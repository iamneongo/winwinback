"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, orders, withdrawals } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { settleOrderCashback, recordWalletTx } from "@/lib/wallet";
import { notifyWithdrawalStatus } from "@/lib/notify";
import { cashbackRate } from "@/lib/config";

export type ActionState = { error?: string; success?: string } | undefined;

const orderSchema = z.object({
  userEmail: z.string().trim().toLowerCase().email("Email khách không hợp lệ"),
  platform: z.enum(["shopee", "tiktok"]),
  externalOrderId: z.string().trim().min(1, "Nhập mã đơn").max(120),
  productName: z.string().trim().min(1, "Nhập tên sản phẩm").max(200),
  orderAmount: z.coerce.number().int().nonnegative(),
  commissionAmount: z.coerce.number().int().nonnegative(),
  cashbackAmount: z.coerce.number().int().nonnegative().optional(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

export async function createOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = orderSchema.safeParse({
    userEmail: formData.get("userEmail"),
    platform: formData.get("platform"),
    externalOrderId: formData.get("externalOrderId"),
    productName: formData.get("productName"),
    orderAmount: formData.get("orderAmount"),
    commissionAmount: formData.get("commissionAmount"),
    cashbackAmount: formData.get("cashbackAmount") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const data = parsed.data;

  const owner = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.userEmail))
    .limit(1);
  if (!owner[0]) return { error: "Không tìm thấy khách với email này" };

  const cashback =
    data.cashbackAmount ?? Math.round(data.commissionAmount * cashbackRate);

  let orderId: string;
  try {
    const inserted = await db
      .insert(orders)
      .values({
        userId: owner[0].id,
        platform: data.platform,
        externalOrderId: data.externalOrderId,
        productName: data.productName,
        orderAmount: data.orderAmount,
        commissionAmount: data.commissionAmount,
        cashbackAmount: cashback,
        status: data.status,
      })
      .returning({ id: orders.id });
    orderId = inserted[0].id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("external_order_id")) {
      return { error: "Mã đơn này đã tồn tại" };
    }
    return { error: "Không lưu được đơn" };
  }

  if (data.status === "completed") {
    await settleOrderCashback(orderId);
  }
  revalidatePath("/admin");
  return { success: "Đã thêm đơn hàng" };
}

const statusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

type OrderStatus = z.infer<typeof statusSchema>["status"];

/**
 * Persist an order's status and, when it becomes `completed`, credit the
 * cashback (idempotent). Shared by the quick status control and the detailed
 * review form.
 */
async function applyOrderStatus(
  orderId: string,
  status: OrderStatus,
  fields?: { adminNote?: string | null },
): Promise<void> {
  await db
    .update(orders)
    .set({ status, ...(fields ?? {}) })
    .where(eq(orders.id, orderId));

  // Crediting is idempotent and only fires when status === completed.
  if (status === "completed") {
    await settleOrderCashback(orderId);
  }
}

export async function updateOrderStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  await applyOrderStatus(parsed.data.orderId, parsed.data.status);
  revalidatePath("/admin");
  revalidatePath("/admin/don-hang");
  revalidatePath("/admin/yeu-cau-hoan-tien");
  return { success: "Đã cập nhật trạng thái đơn" };
}

const reviewSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  adminNote: z.string().trim().max(2000).optional(),
});

export async function reviewOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = reviewSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    adminNote: formData.get("adminNote") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await applyOrderStatus(parsed.data.orderId, parsed.data.status, {
    adminNote: parsed.data.adminNote ?? null,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/yeu-cau-hoan-tien");
  revalidatePath(`/admin/yeu-cau-hoan-tien/${parsed.data.orderId}`);
  return { success: "Đã lưu kết quả kiểm duyệt" };
}

const withdrawalActionSchema = z.object({
  withdrawalId: z.string().uuid(),
  action: z.enum(["approve", "reject", "paid"]),
});

export async function processWithdrawalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = withdrawalActionSchema.safeParse({
    withdrawalId: formData.get("withdrawalId"),
    action: formData.get("action"),
  });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };
  const { withdrawalId, action } = parsed.data;

  let processed: { userId: string; amount: number; status: "approved" | "rejected" | "paid" };
  try {
    processed = await db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(withdrawals)
        .where(eq(withdrawals.id, withdrawalId))
        .for("update")
        .limit(1);
      const w = rows[0];
      if (!w) throw new Error("NOT_FOUND");

      if (action === "reject") {
        if (w.status === "rejected" || w.status === "paid") {
          throw new Error("ALREADY_FINAL");
        }
        // Refund the held amount back to the wallet.
        await recordWalletTx(tx, {
          userId: w.userId,
          type: "refund",
          amount: w.amount,
          note: "Hoàn tiền do từ chối rút",
        });
        await tx
          .update(withdrawals)
          .set({ status: "rejected", processedAt: new Date() })
          .where(eq(withdrawals.id, withdrawalId));
        return { userId: w.userId, amount: w.amount, status: "rejected" as const };
      } else if (action === "approve") {
        await tx
          .update(withdrawals)
          .set({ status: "approved", processedAt: new Date() })
          .where(eq(withdrawals.id, withdrawalId));
        return { userId: w.userId, amount: w.amount, status: "approved" as const };
      } else {
        // paid
        await tx
          .update(withdrawals)
          .set({ status: "paid", processedAt: new Date() })
          .where(eq(withdrawals.id, withdrawalId));
        return { userId: w.userId, amount: w.amount, status: "paid" as const };
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") return { error: "Không tìm thấy yêu cầu" };
    if (msg === "ALREADY_FINAL") return { error: "Yêu cầu đã xử lý xong" };
    return { error: "Không xử lý được yêu cầu" };
  }

  // Best-effort notification; never block the response.
  void notifyWithdrawalStatus(processed).catch(() => {});

  revalidatePath("/admin");
  revalidatePath("/admin/rut-tien");
  return { success: "Đã xử lý yêu cầu rút tiền" };
}
