"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { recordWalletTx } from "@/lib/wallet";
import { auth } from "@/lib/auth";
import type { ActionState } from "@/app/admin/actions";

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin"]),
});

export async function setUserRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  // Don't let an admin strip their own admin role (avoids self lock-out).
  if (parsed.data.userId === admin.id && parsed.data.role !== "admin") {
    return { error: "Không thể tự gỡ quyền quản trị của chính bạn" };
  }

  await db
    .update(users)
    .set({ role: parsed.data.role })
    .where(eq(users.id, parsed.data.userId));

  revalidatePath("/admin/nguoi-dung");
  return { success: "Đã cập nhật vai trò" };
}

const balanceSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().int().refine((n) => n !== 0, "Số tiền phải khác 0"),
  note: z.string().trim().max(200).optional(),
});

export async function adjustBalanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = balanceSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  try {
    await db.transaction(async (tx) => {
      await recordWalletTx(tx, {
        userId: parsed.data.userId,
        type: "adjustment",
        amount: parsed.data.amount,
        note: parsed.data.note ?? "Điều chỉnh thủ công bởi quản trị",
      });
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "INSUFFICIENT_BALANCE") {
      return { error: "Số dư không đủ để trừ" };
    }
    return { error: "Không điều chỉnh được số dư" };
  }

  revalidatePath("/admin/nguoi-dung");
  return { success: "Đã điều chỉnh số dư" };
}

const userIdSchema = z.object({ userId: z.string().uuid() });

export async function resendVerificationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = userIdSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const row = await db
    .select({ email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, parsed.data.userId))
    .limit(1);
  const target = row[0];
  if (!target) return { error: "Không tìm thấy người dùng" };
  if (target.emailVerified) return { error: "Email đã được xác thực" };

  try {
    await auth.api.sendVerificationEmail({
      body: { email: target.email, callbackURL: "/dashboard" },
    });
  } catch {
    return { error: "Không gửi được email xác thực" };
  }

  return { success: "Đã gửi lại email xác thực" };
}

const notifySchema = z.object({
  userId: z.string().uuid(),
  enabled: z.enum(["true", "false"]),
});

export async function toggleUserNotificationsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = notifySchema.safeParse({
    userId: formData.get("userId"),
    enabled: formData.get("enabled"),
  });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const enabled = parsed.data.enabled === "true";
  await db
    .update(users)
    .set({ notifyOrders: enabled, notifyCashback: enabled })
    .where(eq(users.id, parsed.data.userId));

  revalidatePath("/admin/nguoi-dung");
  return {
    success: enabled ? "Đã bật thông báo" : "Đã tắt thông báo",
  };
}
