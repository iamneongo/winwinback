"use server";

import { count, eq, gte, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { CONTACT_TOPICS } from "@/lib/contact";
import { notifyAdmins } from "@/lib/notifications";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  topic: z.enum(CONTACT_TOPICS),
  message: z.string().trim().min(10).max(4000),
});

export async function submitContactMessage(
  _previous: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  // A hidden field catches basic bot submissions without telling the bot why.
  if (String(formData.get("website") ?? "").trim()) {
    return { status: "success", message: "Yêu cầu của bạn đã được tiếp nhận." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Vui lòng kiểm tra lại họ tên, email, chủ đề và nội dung (tối thiểu 10 ký tự)." };
  }

  const input = { ...parsed.data, email: parsed.data.email.toLowerCase() };
  try {
    const [recent] = await db
      .select({ total: count() })
      .from(contactMessages)
      .where(and(
        eq(contactMessages.email, input.email),
        gte(contactMessages.createdAt, new Date(Date.now() - 60 * 60 * 1000)),
      ));
    if ((recent?.total ?? 0) >= 3) {
      return { status: "error", message: "Bạn đã gửi nhiều yêu cầu gần đây. Vui lòng thử lại sau một giờ hoặc liên hệ qua email hỗ trợ." };
    }

    const [saved] = await db.insert(contactMessages).values(input).returning({ id: contactMessages.id });
    if (saved) {
      await notifyAdmins({
        type: "contact",
        title: "Yêu cầu liên hệ mới",
        body: `${input.name} gửi yêu cầu về ${input.topic}.`,
        href: `/admin/lien-he/${saved.id}`,
        dedupeKey: `contact:${saved.id}`,
      }).catch(() => {
        console.error("[contact] Could not create admin notification");
      });
    }
    return { status: "success", message: "Đã gửi yêu cầu thành công. Đội ngũ Win-Win Back sẽ xem và phản hồi qua email của bạn." };
  } catch {
    // Database errors may contain submitted text in query parameters.
    console.error("[contact] Could not save contact message");
    return { status: "error", message: "Chưa thể gửi yêu cầu lúc này. Vui lòng thử lại sau hoặc gửi email trực tiếp tới support@winwinback.com." };
  }
}
