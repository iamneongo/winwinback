import "server-only";
import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Win-Win Back <no-reply@winwinback.com>";
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Send a transactional email via Resend. If RESEND_API_KEY is unset the call is
 * a no-op (returns false) so the app keeps working in dev without email set up.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!resend) {
    console.info(
      `[email:skipped] to=${opts.to} subject="${opts.subject}" (RESEND_API_KEY not set)`,
    );
    return false;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (e) {
    console.error("[email:error]", e);
    return false;
  }
}

/** Minimal branded wrapper for transactional emails (Vietnamese). */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0d315d">
    <div style="font-weight:800;font-size:18px;margin-bottom:4px">Win-Win Back</div>
    <h1 style="font-size:18px;margin:16px 0 8px">${title}</h1>
    <div style="font-size:14px;line-height:1.6;color:#3a5578">${bodyHtml}</div>
    <p style="font-size:12px;color:#8aa0bd;margin-top:24px">Email tự động từ Win-Win Back — vui lòng không trả lời.</p>
  </div>`;
}
