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
import { verifyTikTokOrder, type VerifyResult } from "@/lib/affiliate/tiktok/orders";
import { verifyShopeeOrder } from "@/lib/affiliate/shopee/orders";

/** Verify an order against the right marketplace's affiliate API. */
function verifyByPlatform(
  platform: string,
  externalOrderId: string,
): Promise<VerifyResult> {
  if (platform === "tiktok") return verifyTikTokOrder(externalOrderId);
  if (platform === "shopee") return verifyShopeeOrder(externalOrderId);
  return Promise.resolve({ connected: false, status: null });
}

const marketLabel: Record<string, string> = { tiktok: "TikTok", shopee: "Shopee" };

/**
 * Anti-fraud gate: a TikTok/Shopee order may only be marked completed (which
 * credits cashback) after the marketplace's affiliate API confirms it SETTLED —
 * proof the commission was actually earned. Auto re-checks live if needed and
 * persists the verdict. Orders on non-integrated platforms are not gated.
 */
async function ensureOrderSettled(orderId: string): Promise<{ error?: string }> {
  const rows = await db
    .select({
      platform: orders.platform,
      externalOrderId: orders.externalOrderId,
      verified: orders.tiktokVerifiedStatus,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  const order = rows[0];
  if (!order) return { error: "Không tìm thấy đơn" };
  if (order.platform !== "tiktok" && order.platform !== "shopee") return {};

  let verified = order.verified;
  if (verified !== "settled") {
    try {
      const r = await verifyByPlatform(order.platform, order.externalOrderId);
      verified = r.status;
      await db
        .update(orders)
        .set({ tiktokVerifiedStatus: r.status, tiktokVerifiedAt: new Date() })
        .where(eq(orders.id, orderId));
    } catch {
      // Treat a failed check as unverified — never let it unblock a payout.
    }
  }
  if (verified !== "settled") {
    const m = marketLabel[order.platform] ?? order.platform;
    return {
      error: `Chưa xác minh "Settled" từ ${m} (hiện: ${verified ?? "chưa kiểm tra"}). Không thể duyệt hoàn tiền cho đơn này.`,
    };
  }
  return {};
}

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

  // Anti-fraud gate: a completed TikTok/Shopee order must be SETTLED on the
  // marketplace side before it can be created as payable.
  let verifiedStatus: "settled" | "pending" | "cancelled" | "not_found" | null =
    null;
  if (
    data.status === "completed" &&
    (data.platform === "tiktok" || data.platform === "shopee")
  ) {
    const r = await verifyByPlatform(data.platform, data.externalOrderId).catch(
      () => null,
    );
    verifiedStatus = r?.status ?? null;
    if (verifiedStatus !== "settled") {
      const m = marketLabel[data.platform] ?? data.platform;
      return {
        error: `Không thể tạo đơn hoàn tất: ${m} chưa xác minh "Settled" (hiện: ${verifiedStatus ?? "không kiểm tra được"}).`,
      };
    }
  }

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
        tiktokVerifiedStatus: verifiedStatus ?? undefined,
        tiktokVerifiedAt: verifiedStatus ? new Date() : undefined,
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
): Promise<{ error?: string }> {
  // Gate before crediting: TikTok/Shopee orders must be verified SETTLED.
  if (status === "completed") {
    const gate = await ensureOrderSettled(orderId);
    if (gate.error) return gate;
  }

  await db
    .update(orders)
    .set({ status, ...(fields ?? {}) })
    .where(eq(orders.id, orderId));

  // Crediting is idempotent and only fires when status === completed.
  if (status === "completed") {
    await settleOrderCashback(orderId);
  }
  return {};
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

  const res = await applyOrderStatus(parsed.data.orderId, parsed.data.status);
  if (res.error) return { error: res.error };
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

  const res = await applyOrderStatus(parsed.data.orderId, parsed.data.status, {
    adminNote: parsed.data.adminNote ?? null,
  });
  if (res.error) return { error: res.error };
  revalidatePath("/admin");
  revalidatePath("/admin/yeu-cau-hoan-tien");
  revalidatePath(`/admin/yeu-cau-hoan-tien/${parsed.data.orderId}`);
  return { success: "Đã lưu kết quả kiểm duyệt" };
}

const verifyLabel: Record<string, string> = {
  settled: 'Đã "Settled" — creator có hoa hồng ✓',
  pending: "Đang chờ trên TikTok (chưa settle)",
  cancelled: "Đã huỷ/hoàn — không có hoa hồng",
  not_found: "Không tìm thấy đơn này trên TikTok",
};

const verifyOrderSchema = z.object({ orderId: z.string().uuid() });

/**
 * On-demand check of a TikTok order against the creator's affiliate-orders API,
 * so an admin can confirm a payout is legitimate without opening TikTok. Caches
 * the verdict on the order (tiktokVerifiedStatus/At).
 */
export async function verifyOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = verifyOrderSchema.safeParse({ orderId: formData.get("orderId") });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  const rows = await db
    .select({
      platform: orders.platform,
      externalOrderId: orders.externalOrderId,
    })
    .from(orders)
    .where(eq(orders.id, parsed.data.orderId))
    .limit(1);
  const order = rows[0];
  if (!order) return { error: "Không tìm thấy đơn" };
  if (order.platform !== "tiktok" && order.platform !== "shopee") {
    return { error: "Chỉ kiểm tra được đơn TikTok / Shopee" };
  }

  let result;
  try {
    result = await verifyByPlatform(order.platform, order.externalOrderId);
  } catch {
    return { error: "Không gọi được API sàn để kiểm tra" };
  }
  if (!result.connected) {
    const m = marketLabel[order.platform] ?? order.platform;
    return { error: `Chưa kết nối / cấu hình ${m} — không thể kiểm tra` };
  }

  await db
    .update(orders)
    .set({ tiktokVerifiedStatus: result.status, tiktokVerifiedAt: new Date() })
    .where(eq(orders.id, parsed.data.orderId));
  revalidatePath("/admin");
  revalidatePath("/admin/don-hang");
  revalidatePath("/admin/yeu-cau-hoan-tien");
  revalidatePath(`/admin/yeu-cau-hoan-tien/${parsed.data.orderId}`);

  const label = verifyLabel[result.status ?? "not_found"] ?? result.status;
  const m = marketLabel[order.platform] ?? order.platform;
  return {
    success: `${m}: ${label}${result.rawStatus ? ` (${result.rawStatus})` : ""}`,
  };
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
