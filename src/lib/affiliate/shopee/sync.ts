import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { cashbackRate } from "@/lib/config";
import { settleOrderCashback, reverseOrderCashback } from "@/lib/wallet";
import {
  getShopeeConversions,
  type ShopeeConversion,
  type ShopeeReportCheckout,
} from "./automation-client";
import { isShopeeAffConfigured } from "./config";
import { fromShopeeSubId1 } from "./sub-id";

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

/** A single marketplace order, attributed to a user and ready to reconcile. */
export interface AttributedShopeeOrder {
  /** order_sn — the idempotency key for cashback payout. */
  orderSn: string;
  /** Resolved internal user UUID (from utm_content.split("-")[0]). */
  userId: string;
  status: OrderStatus | null;
  rawStatus?: string;
  /** This order's share of the checkout commission (VND). */
  commission: number;
  purchaseTime?: Date;
  completeTime?: Date;
}

/** Convert Shopee's report states to the lifecycle used by the wallet. */
export function mapShopeeStatus(raw?: string): OrderStatus | null {
  if (!raw) return null;
  const status = raw.trim().toLocaleUpperCase("vi-VN");
  if (["COMPLETED", "SETTLED", "VALIDATED", "ĐÃ DUYỆT", "ĐÃ HOÀN THÀNH"].includes(status)) return "completed";
  if (["CANCELLED", "CANCELED", "REJECTED", "RETURNED", "ĐÃ HỦY", "ĐÃ HUỶ", "ĐÃ TRẢ HÀNG"].includes(status)) return "cancelled";
  if (["PROCESSING", "CONFIRMED", "DELIVERED", "ĐÃ GIAO", "ĐANG XỬ LÝ", "ĐÃ XÁC NHẬN"].includes(status)) return "confirmed";
  if (["PENDING", "UNPAID", "CREATED", "TO_PAY", "CHỜ THANH TOÁN"].includes(status)) return "pending";
  return null;
}

function verifiedFrom(status: OrderStatus | null): string {
  if (status === "completed") return "settled";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function amount(raw: number | string | undefined): number {
  if (typeof raw === "number") return Number.isFinite(raw) ? Math.round(raw) : 0;
  if (!raw) return 0;
  const parsed = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function dateFrom(raw: number | string | undefined): Date | undefined {
  if (typeof raw === "number" || (typeof raw === "string" && /^\d+$/.test(raw))) {
    const value = Number(raw);
    return Number.isFinite(value) ? new Date(value > 10_000_000_000 ? value : value * 1000) : undefined;
  }
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

/** First subId in utm_content (`subId1-subId2-...`) maps back to our user UUID. */
export function userIdFromUtmContent(utmContent: string | undefined): string | null {
  if (!utmContent) return null;
  const subId1 = utmContent.split("-")[0]?.trim();
  return subId1 ? fromShopeeSubId1(subId1) : null;
}

/**
 * Flatten one report checkout into per-order records attributed to a user.
 *
 * Commission is reported once per checkout, but cashback is credited per
 * order_sn, so the checkout commission is split evenly across its orders (the
 * rounding remainder goes to the first order). Most checkouts hold a single
 * order, where this is just the full amount.
 */
export function flattenCheckout(checkout: ShopeeReportCheckout): AttributedShopeeOrder[] {
  const userId = userIdFromUtmContent(checkout.utm_content);
  if (!userId) return [];

  const list = (checkout.orders ?? []).filter((o) => o.order_sn);
  if (!list.length) return [];

  // Prefer confirmed (gross) commission; fall back to the estimate.
  const total = amount(checkout.gross_commission) || amount(checkout.estimated_total_commission);
  const base = Math.floor(total / list.length);
  const remainder = total - base * list.length;
  const purchaseTime = dateFrom(checkout.purchase_time);

  return list.map((order, index) => ({
    orderSn: String(order.order_sn),
    userId,
    status: mapShopeeStatus(order.order_status),
    rawStatus: order.order_status,
    commission: base + (index === 0 ? remainder : 0),
    purchaseTime,
    completeTime: dateFrom(order.complete_time),
  }));
}

/** When the same order_sn appears twice, keep the most advanced status. */
const STATUS_RANK: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  cancelled: 2,
  completed: 3,
};

export interface ShopeeReconcileResult {
  connected: boolean;
  scanned: number;
  updated: number;
  credited: number;
  attributed: number;
  unmatched: number;
}

/**
 * Reconcile Shopee conversions (GET /api/conversions) against our orders.
 *
 * The worker already matches each conversion to a user (userId = subId1),
 * carries product info + VND money, and flags fraud. We upsert by order_sn then:
 * - credit cashback once when status=COMPLETED and isFraud=false;
 * - claw back a previously-credited order that turned cancelled/refunded/fraud.
 * Idempotent (guarded by orders.cashbackCreditedAt).
 */
export async function reconcile(
  opts: { sinceDays?: number } = {},
): Promise<ShopeeReconcileResult> {
  const empty = { connected: false, scanned: 0, updated: 0, credited: 0, attributed: 0, unmatched: 0 };
  if (!isShopeeAffConfigured()) return empty;

  const sinceDays = opts.sinceDays ?? 30;
  const conversions = await getShopeeConversions({ days: sinceDays, size: 500 });

  // Keep the most advanced status if an order_sn appears more than once.
  const byOrderSn = new Map<string, ShopeeConversion>();
  for (const c of conversions) {
    if (!c.orderSn) continue;
    const prev = byOrderSn.get(c.orderSn);
    if (!prev || rank(mapShopeeStatus(c.status)) >= rank(mapShopeeStatus(prev.status))) {
      byOrderSn.set(c.orderSn, c);
    }
  }
  const fetched = [...byOrderSn.values()];
  if (!fetched.length) return { ...empty, connected: true };

  const existing = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.platform, "shopee"),
        inArray(orders.externalOrderId, fetched.map((c) => c.orderSn)),
      ),
    );
  const existingBySn = new Map(existing.map((o) => [o.externalOrderId, o]));

  let updated = 0;
  let attributed = 0;
  let unmatched = 0;
  const toSettle = new Set<string>();
  const toReverse = new Set<string>();

  for (const c of fetched) {
    const status = mapShopeeStatus(c.status);
    const payable = status === "completed" && !c.isFraud;
    const commission = Math.round(c.commission ?? 0);
    const orderValue = Math.round(c.orderValue ?? 0);
    const productName = c.itemName?.trim() || "Đơn Shopee";
    const cashback = payable ? Math.round(commission * cashbackRate) : 0;
    const orderedAt = c.purchaseTime ? new Date(c.purchaseTime * 1000) : undefined;
    const verified = c.isFraud ? "fraud" : verifiedFrom(status);

    const current = existingBySn.get(c.orderSn);
    if (current) {
      const pendingPayout = !current.cashbackCreditedAt;
      await db
        .update(orders)
        .set({
          status: status ?? (current.status as OrderStatus),
          productName,
          orderAmount: orderValue || current.orderAmount,
          commissionAmount: commission || current.commissionAmount,
          cashbackAmount: pendingPayout ? cashback : current.cashbackAmount,
          tiktokVerifiedStatus: verified,
          tiktokVerifiedAt: new Date(),
          orderedAt: orderedAt ?? current.orderedAt,
        })
        .where(eq(orders.id, current.id));
      updated++;
      if (payable && pendingPayout) toSettle.add(current.id);
      // Credited before, now cancelled/refunded/fraud → claw it back.
      if (current.cashbackCreditedAt && (status === "cancelled" || c.isFraud)) {
        toReverse.add(current.id);
      }
      continue;
    }

    // New conversion — only create when the worker matched it to a real user.
    const userId = c.matched && c.userId ? fromShopeeSubId1(c.userId) : null;
    if (!userId) {
      unmatched++;
      continue;
    }
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user[0]) {
      unmatched++;
      continue;
    }

    try {
      const inserted = await db
        .insert(orders)
        .values({
          userId,
          platform: "shopee",
          externalOrderId: c.orderSn,
          productName,
          orderAmount: orderValue,
          commissionAmount: commission,
          cashbackAmount: cashback,
          status: status ?? "pending",
          tiktokVerifiedStatus: verified,
          tiktokVerifiedAt: new Date(),
          orderedAt,
        })
        .returning({ id: orders.id });
      attributed++;
      if (payable) toSettle.add(inserted[0].id);
    } catch {
      unmatched++;
    }
  }

  let credited = 0;
  for (const id of toSettle) if (await settleOrderCashback(id)) credited++;
  for (const id of toReverse) await reverseOrderCashback(id);

  return { connected: true, scanned: fetched.length, updated, credited, attributed, unmatched };
}

function rank(status: OrderStatus | null): number {
  return status ? STATUS_RANK[status] : -1;
}
