import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { sendEmail, emailLayout } from "@/lib/email";
import { formatVnd, baseUrl } from "@/lib/config";

async function recipient(
  userId: string,
): Promise<{ email: string; name: string } | null> {
  const rows = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

/** Notify a user that cashback for a completed order was credited. */
export async function notifyCashbackCredited(input: {
  userId: string;
  externalOrderId: string;
  amount: number;
}): Promise<void> {
  const to = await recipient(input.userId);
  if (!to) return;
  await sendEmail({
    to: to.email,
    subject: "Đã cộng hoàn tiền vào ví — Win-Win Back",
    html: emailLayout(
      "Bạn vừa nhận hoàn tiền 🎉",
      `Chào ${to.name || "bạn"}, đơn <b>#${input.externalOrderId}</b> đã hoàn tất.
       Chúng tôi đã cộng <b>${formatVnd(input.amount)}</b> vào ví của bạn.
       <p style="margin-top:16px"><a href="${baseUrl}/dashboard/vi">Xem ví của bạn →</a></p>`,
    ),
  });
}

const withdrawalCopy: Record<string, { subject: string; body: string }> = {
  approved: {
    subject: "Yêu cầu rút tiền đã được duyệt — Win-Win Back",
    body: "đã được <b>duyệt</b> và đang chờ chuyển khoản.",
  },
  rejected: {
    subject: "Yêu cầu rút tiền bị từ chối — Win-Win Back",
    body: "đã bị <b>từ chối</b>. Số tiền đã được hoàn lại vào ví của bạn.",
  },
  paid: {
    subject: "Đã chuyển tiền rút — Win-Win Back",
    body: "đã được <b>chi trả</b>. Vui lòng kiểm tra tài khoản ngân hàng của bạn.",
  },
};

/** Notify a user that their withdrawal request changed status. */
export async function notifyWithdrawalStatus(input: {
  userId: string;
  status: "approved" | "rejected" | "paid";
  amount: number;
}): Promise<void> {
  const to = await recipient(input.userId);
  if (!to) return;
  const copy = withdrawalCopy[input.status];
  if (!copy) return;
  await sendEmail({
    to: to.email,
    subject: copy.subject,
    html: emailLayout(
      "Cập nhật yêu cầu rút tiền",
      `Chào ${to.name || "bạn"}, yêu cầu rút <b>${formatVnd(input.amount)}</b> ${copy.body}`,
    ),
  });
}
