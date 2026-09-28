import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks, orders, users } from "@/db/schema";
import { cashbackRate } from "@/lib/config";
import { settleOrderCashback } from "@/lib/wallet";
import { getShopeeAffReport, type ShopeeAffReportItem } from "./automation-client";
import { isShopeeAffConfigured } from "./config";
import { fromShopeeSubId1 } from "./sub-id";

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface FetchedShopeeOrder {
  id: string;
  subIds: string[];
  status?: string;
  purchaseTime?: Date;
  productId?: string;
  productName?: string;
  orderAmount: number;
  commission: number;
}

/** Convert Shopee's report states to the lifecycle used by the wallet. */
export function mapShopeeStatus(raw?: string): OrderStatus | null {
  if (!raw) return null;
  const status = raw.trim().toLocaleUpperCase("vi-VN");
  if (["COMPLETED", "SETTLED", "VALIDATED", "ĐÃ DUYỆT", "ĐÃ HOÀN THÀNH"].includes(status)) return "completed";
  if (["CANCELLED", "CANCELED", "REJECTED", "RETURNED", "ĐÃ HỦY", "ĐÃ HUỶ", "ĐÃ TRẢ HÀNG"].includes(status)) return "cancelled";
  if (["PENDING", "PROCESSING", "CONFIRMED", "DELIVERED", "ĐÃ GIAO", "ĐANG XỬ LÝ", "ĐÃ XÁC NHẬN"].includes(status)) return "confirmed";
  if (["UNPAID", "CREATED", "TO_PAY", "CHỜ THANH TOÁN"].includes(status)) return "pending";
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

function strings(raw: string[] | string | undefined): string[] {
  if (Array.isArray(raw)) return raw.map(String).map((value) => value.trim()).filter(Boolean);
  return raw ? raw.split(",").map((value) => value.trim()).filter(Boolean) : [];
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

export function normalizeShopeeAffReportItem(item: ShopeeAffReportItem): FetchedShopeeOrder | null {
  const id = item.order_sn ?? item.orderId;
  if (!id) return null;
  const rawProductId = item.item_id ?? item.itemId;
  return {
    id: String(id),
    subIds: strings(item.sub_ids ?? item.subIds),
    status: item.order_status ?? item.display_order_status,
    purchaseTime: dateFrom(item.purchase_time ?? item.purchaseTime),
    productId: rawProductId === undefined ? undefined : String(rawProductId),
    productName: item.item_name ?? item.itemName ?? item.shop_name ?? item.shopName,
    orderAmount: amount(item.order_amount ?? item.orderAmount),
    commission: amount(item.commission ?? item.estimated_commission),
  };
}

export interface ShopeeSyncResult {
  connected: boolean;
  scanned: number;
  updated: number;
  credited: number;
  attributed: number;
  unmatched: number;
}

/** Reconcile ShopeeAff reports. SubId1 is the compact, Shopee-safe user UUID. */
export async function syncShopeeOrders(
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<ShopeeSyncResult> {
  const empty = { connected: false, scanned: 0, updated: 0, credited: 0, attributed: 0, unmatched: 0 };
  if (!isShopeeAffConfigured()) return empty;

  const sinceDays = opts.sinceDays ?? 7;
  const maxPages = opts.maxPages ?? 10;
  const pageSize = 100;
  const fetched: FetchedShopeeOrder[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= maxPages; page++) {
    const response = await getShopeeAffReport({ days: sinceDays, page, size: pageSize });
    for (const item of response.list) {
      const normalized = normalizeShopeeAffReportItem(item);
      if (normalized && !seen.has(normalized.id)) {
        seen.add(normalized.id);
        fetched.push(normalized);
      }
    }
    if (response.list.length < pageSize) break;
  }

  if (!fetched.length) return { ...empty, connected: true };

  const existing = await db.select().from(orders).where(inArray(orders.externalOrderId, fetched.map((order) => order.id)));
  const existingById = new Map(existing.map((order) => [order.externalOrderId, order]));
  let updated = 0;
  let attributed = 0;
  let unmatched = 0;
  const toSettle = new Set<string>();

  for (const reportOrder of fetched) {
    const current = existingById.get(reportOrder.id);
    const mappedStatus = mapShopeeStatus(reportOrder.status);
    if (current) {
      const nextStatus = mappedStatus ?? current.status;
      const pendingPayout = !current.cashbackCreditedAt;
      await db.update(orders).set({
        status: nextStatus,
        productName: reportOrder.productName ?? current.productName,
        orderAmount: reportOrder.orderAmount || current.orderAmount,
        commissionAmount: reportOrder.commission || current.commissionAmount,
        cashbackAmount: pendingPayout ? Math.round(reportOrder.commission * cashbackRate) : current.cashbackAmount,
        tiktokVerifiedStatus: verifiedFrom(mappedStatus),
        tiktokVerifiedAt: new Date(),
        orderedAt: reportOrder.purchaseTime ?? current.orderedAt,
      }).where(eq(orders.id, current.id));
      updated++;
      if (nextStatus === "completed" && pendingPayout) toSettle.add(current.id);
      continue;
    }

    const created = await createAttributedShopeeOrder(reportOrder, mappedStatus);
    if (created) {
      attributed++;
      if (mappedStatus === "completed") toSettle.add(created);
    } else {
      unmatched++;
    }
  }

  let credited = 0;
  for (const id of toSettle) if (await settleOrderCashback(id)) credited++;
  return { connected: true, scanned: fetched.length, updated, credited, attributed, unmatched };
}

async function createAttributedShopeeOrder(reportOrder: FetchedShopeeOrder, mappedStatus: OrderStatus | null): Promise<string | null> {
  const userId = reportOrder.subIds[0] ? fromShopeeSubId1(reportOrder.subIds[0]) : null;
  if (!userId) return null;
  const user = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return null;

  const matchingLink = await db.select({ id: affiliateLinks.id }).from(affiliateLinks).where(
    reportOrder.productId
      ? and(eq(affiliateLinks.userId, userId), eq(affiliateLinks.productId, reportOrder.productId))
      : eq(affiliateLinks.userId, userId),
  ).limit(1);
  const status = mappedStatus ?? "pending";
  try {
    const inserted = await db.insert(orders).values({
      userId,
      linkId: matchingLink[0]?.id,
      platform: "shopee",
      externalOrderId: reportOrder.id,
      productName: reportOrder.productName ?? "Đơn Shopee",
      orderAmount: reportOrder.orderAmount,
      commissionAmount: reportOrder.commission,
      cashbackAmount: Math.round(reportOrder.commission * cashbackRate),
      status,
      tiktokVerifiedStatus: verifiedFrom(mappedStatus),
      tiktokVerifiedAt: new Date(),
      orderedAt: reportOrder.purchaseTime,
    }).returning({ id: orders.id });
    return inserted[0]?.id ?? null;
  } catch {
    return null;
  }
}
