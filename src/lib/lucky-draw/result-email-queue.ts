import "server-only";
import { createHmac } from "node:crypto";
import { Client } from "pg";
import { Resend } from "resend";
import { emailLayout } from "@/lib/email";
import { formatVnd } from "@/lib/config";
import { drawEmailBudget, type ResendUsage } from "./result-email-budget";


type Recipient = {
  period_id: string;
  user_id: string;
  email: string;
  name: string;
  period_name: string;
  winning_number: string;
  exact_match: boolean | null;
  pot_total: string;
  paid_out: string;
};

function escaped(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}

export function drawUnsubscribeUrl(userId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
  const signature = createHmac("sha256", secret).update(`draw-email:${userId}`).digest("hex");
  return `https://winwinback.com/api/email/unsubscribe/draw?uid=${encodeURIComponent(userId)}&sig=${signature}`;
}

function renderEmail(row: Recipient): string {
  const result = row.exact_match === null
    ? "Kỳ này chưa có phiếu hợp lệ. Giải thưởng được chuyển sang kỳ tiếp theo."
    : row.exact_match
      ? `Các phiếu trùng chính xác đã được trao tổng cộng ${formatVnd(Number(row.paid_out))}.`
      : `Các phiếu gần số trúng nhất đã được trao tổng cộng ${formatVnd(Number(row.paid_out))}; phần còn lại được cộng dồn.`;
  return emailLayout("Kết quả rút thăm đã công bố", `
    <p>Chào ${escaped(row.name)},</p>
    <p>Kỳ <strong>${escaped(row.period_name)}</strong> đã có kết quả.</p>
    <p style="font-size:22px;font-weight:700;color:#168146">Số trúng: ${escaped(row.winning_number)}</p>
    <p>Giải thưởng kỳ này: <strong>${formatVnd(Number(row.pot_total))}</strong>.</p>
    <p>${result}</p>
    <p>Xem phiếu của bạn và chi tiết kỳ quay tại <a href="https://winwinback.com/dashboard/rut-tham">Win-Win Back</a>.</p>
    <p style="font-size:12px"><a href="${drawUnsubscribeUrl(row.user_id)}">Ngừng nhận email kết quả rút thăm</a></p>
  `);
}

/** Serialized across app replicas and cron invocations by a session advisory lock. */
export async function processDrawResultEmails(): Promise<{ locked: boolean; sent: number; pending: number; skipped: number; quota: number }> {
  const connectionString = process.env.DATABASE_URL;
  const apiKey = process.env.RESEND_API_KEY;
  if (!connectionString || !apiKey) throw new Error("DATABASE_URL and RESEND_API_KEY are required");
  const client = new Client({ connectionString });
  await client.connect();
  let locked = false;
  let sent = 0;
  let skipped = 0;
  let quota = 0;
  try {
    const lock = await client.query<{ locked: boolean }>("SELECT pg_try_advisory_lock(20261119, 1) AS locked");
    locked = lock.rows[0]?.locked ?? false;
    if (!locked) return { locked: false, sent: 0, pending: 0, skipped: 0, quota: 0 };

    const usageResponse = await fetch("https://api.resend.com/usage", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!usageResponse.ok) throw new Error(`Resend usage HTTP ${usageResponse.status}`);
    const usage = await usageResponse.json() as ResendUsage;
    const sentToday = await client.query<{ count: number }>(`
      SELECT count(*)::int AS count FROM lucky_draw_result_emails
      WHERE status = 'sent' AND sent_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    `);
    quota = drawEmailBudget(usage, sentToday.rows[0]?.count ?? 0);

    // Honor changes to the user's preferences made after the draw.
    const skippedRows = await client.query(`
      UPDATE lucky_draw_result_emails q SET status = 'skipped', last_error = 'Email disabled or unverified'
      FROM users u WHERE q.user_id = u.id AND q.status = 'pending'
        AND (u.email_verified = false OR u.notify_system_email = false OR u.notify_draw_email = false)
    `);
    skipped = skippedRows.rowCount ?? 0;

    if (quota > 0) {
      const rows = await client.query<Recipient>(`
        SELECT q.period_id, q.user_id, u.email, u.name,
          p.name AS period_name, p.winning_number, p.exact_match,
          p.pot_total::text, p.paid_out::text
        FROM lucky_draw_result_emails q
        JOIN users u ON u.id = q.user_id
        JOIN lucky_draw_periods p ON p.id = q.period_id
        WHERE q.status = 'pending' AND q.next_attempt_at <= now() AND p.status = 'drawn'
        ORDER BY q.created_at, q.period_id, q.user_id LIMIT $1
      `, [quota]);
      const resend = new Resend(apiKey);
      for (const row of rows.rows) {
        try {
          const current = await client.query<{ allowed: boolean }>(`
            SELECT email_verified AND notify_system_email AND notify_draw_email AS allowed
            FROM users WHERE id = $1
          `, [row.user_id]);
          if (!current.rows[0]?.allowed) {
            await client.query(`UPDATE lucky_draw_result_emails SET status = 'skipped', last_error = 'Email disabled or unverified' WHERE period_id = $1 AND user_id = $2`, [row.period_id, row.user_id]);
            skipped++;
            continue;
          }
          const url = drawUnsubscribeUrl(row.user_id);
          const response = await resend.emails.send({
            from: process.env.EMAIL_FROM || "Win-Win Back <no-reply@winwinback.com>",
            to: row.email,
            subject: `Kết quả rút thăm ${row.period_name} — Win-Win Back`,
            html: renderEmail(row),
            headers: {
              "List-Unsubscribe": `<${url}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          }, { idempotencyKey: `draw-result-${row.period_id}-${row.user_id}` });
          if (response.error || !response.data?.id) throw new Error(response.error?.message || "Resend did not return an email ID");
          await client.query(`
            UPDATE lucky_draw_result_emails SET status = 'sent', sent_at = now(), provider_id = $3,
              attempts = attempts + 1, last_error = NULL WHERE period_id = $1 AND user_id = $2
          `, [row.period_id, row.user_id, response.data.id]);
          sent++;
        } catch (error) {
          const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown send failure";
          const rateLimited = /rate limit|daily quota|monthly quota|too many requests/i.test(message);
          await client.query(`
            UPDATE lucky_draw_result_emails SET attempts = attempts + 1, last_error = $3,
              next_attempt_at = now() + (CASE WHEN $4::boolean THEN interval '1 day'
                WHEN attempts >= 5 THEN interval '1 day' ELSE interval '30 minutes' END)
            WHERE period_id = $1 AND user_id = $2
          `, [row.period_id, row.user_id, message, rateLimited]);
          console.error("[draw-email] send failed", { periodId: row.period_id, userId: row.user_id, message });
          if (rateLimited) break;
        }
      }
    }
    const pendingRows = await client.query<{ count: number }>("SELECT count(*)::int AS count FROM lucky_draw_result_emails WHERE status = 'pending'");
    return { locked: true, sent, pending: pendingRows.rows[0]?.count ?? 0, skipped, quota };
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock(20261119, 1)").catch(() => undefined);
    await client.end();
  }
}
