import "server-only";
import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { orders, affiliateLinks, linkClicks } from "@/db/schema";
import { getConversionReport, type ShopeeConversion } from "./client";
import { isShopeeConfigured } from "./config";
import { settleOrderCashback } from "@/lib/wallet";
import { cashbackRate } from "@/lib/config";

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

/** Map a Shopee conversion status to our internal lifecycle. */
export function mapShopeeStatus(raw?: string): OrderStatus | null {
  if (!raw) return null;
  const s = raw.toUpperCase();
  if (s === "COMPLETED") return "completed";
  if (s === "CANCELLED" || s === "CANCELED") return "cancelled";
  if (s === "PENDING") return "confirmed";
  if (s === "UNPAID") return "pending";
  return null;
}

function verifiedFrom(mapped: OrderStatus | null): string {
  if (mapped === "completed") return "settled";
  if (mapped === "cancelled") return "cancelled";
  return "pending";
}

/** Best-effort parse of a money string to an integer (VND has no decimals). */
function parseAmount(raw?: string): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export interface ShopeeSyncResult {
  connected: boolean;
  scanned: number;
  updated: number;
  credited: number;
  attributed: number;
  unmatched: number;
}

/**
 * Reconcile Shopee affiliate conversions against our orders.
 *
 * Shopee's report carries real commission + status, so attributed orders get a
 * correct commission/cashback. Attribution prefers the sub id echoed in
 * utm_content (we embed the link's short code), then falls back to matching the
 * item id against a recent /go click (same product+time heuristic as TikTok).
 */
export async function syncShopeeOrders(
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<ShopeeSyncResult> {
  if (!isShopeeConfigured()) {
    return {
      connected: false,
      scanned: 0,
      updated: 0,
      credited: 0,
      attributed: 0,
      unmatched: 0,
    };
  }

  const sinceDays = opts.sinceDays ?? 7;
  const maxPages = opts.maxPages ?? 10;
  const now = Math.floor(Date.now() / 1000);
  const purchaseTimeStart = now - sinceDays * 86400;

  const fetched: ShopeeConversion[] = [];
  let scrollId: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { nodes, scrollId: next, hasNextPage } = await getConversionReport({
      purchaseTimeStart,
      purchaseTimeEnd: now,
      scrollId,
      limit: 100,
    });
    fetched.push(...nodes);
    if (!hasNextPage || !next) break;
    scrollId = next;
  }

  const scanned = fetched.length;
  if (scanned === 0) {
    return { connected: true, scanned, updated: 0, credited: 0, attributed: 0, unmatched: 0 };
  }

  const ids = [...new Set(fetched.map((c) => c.orderId))];
  const existing = await db
    .select()
    .from(orders)
    .where(inArray(orders.externalOrderId, ids));
  const byExt = new Map(existing.map((o) => [o.externalOrderId, o]));

  let updated = 0;
  let attributed = 0;
  let unmatched = 0;
  const toSettle = new Set<string>();

  for (const c of fetched) {
    const row = byExt.get(c.orderId);
    const mapped = mapShopeeStatus(c.orderStatus);

    if (row) {
      if (mapped && mapped !== row.status) {
        await db
          .update(orders)
          .set({
            status: mapped,
            tiktokVerifiedStatus: verifiedFrom(mapped),
            tiktokVerifiedAt: new Date(),
          })
          .where(eq(orders.id, row.id));
        updated++;
        if (mapped === "completed") toSettle.add(row.id);
      } else if (row.status === "completed" && !row.cashbackCreditedAt) {
        toSettle.add(row.id);
      }
      continue;
    }

    const created = await attributeShopeeOrder(c, mapped);
    if (created) {
      attributed++;
      if (mapped === "completed") toSettle.add(created);
    } else {
      unmatched++;
    }
  }

  let credited = 0;
  for (const id of toSettle) {
    if (await settleOrderCashback(id)) credited++;
  }

  return { connected: true, scanned, updated, credited, attributed, unmatched };
}

/** Resolve the owning user for a conversion, then create the order locally. */
async function attributeShopeeOrder(
  c: ShopeeConversion,
  mapped: OrderStatus | null,
): Promise<string | null> {
  let userId: string | undefined;
  let linkId: string | undefined;

  // 1) Preferred: the short code we embedded as a sub id (utm_content).
  if (c.utmContent) {
    const code = c.utmContent.split(/[_-]/)[0]?.trim();
    if (code) {
      const link = await db
        .select({ id: affiliateLinks.id, userId: affiliateLinks.userId })
        .from(affiliateLinks)
        .where(eq(affiliateLinks.shortCode, code))
        .limit(1);
      if (link[0]) {
        userId = link[0].userId;
        linkId = link[0].id;
      }
    }
  }

  // 2) Fallback: match the purchased item id to a recent unattributed click.
  let clickId: string | undefined;
  if (!userId) {
    const itemId = c.items?.find((i) => i.itemId)?.itemId;
    if (!itemId) return null;
    const orderTime = c.purchaseTime ? new Date(c.purchaseTime * 1000) : new Date();
    const clicks = await db
      .select()
      .from(linkClicks)
      .where(
        and(
          eq(linkClicks.productId, itemId),
          isNull(linkClicks.attributedOrderId),
          lte(linkClicks.clickedAt, orderTime),
        ),
      )
      .orderBy(desc(linkClicks.clickedAt))
      .limit(1);
    const click = clicks[0];
    if (!click) return null;
    userId = click.userId;
    linkId = click.linkId;
    clickId = click.id;
  }

  if (!userId) return null;

  const status: OrderStatus = mapped ?? "pending";
  const commission = parseAmount(c.netCommission ?? c.totalCommission);
  const cashback = Math.round(commission * cashbackRate);

  try {
    return await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          userId,
          linkId,
          platform: "shopee",
          externalOrderId: c.orderId,
          productName: c.items?.[0]?.itemName ?? "Đơn Shopee",
          orderAmount: 0,
          commissionAmount: commission,
          cashbackAmount: cashback,
          status,
          tiktokVerifiedStatus: verifiedFrom(mapped),
          tiktokVerifiedAt: new Date(),
        })
        .returning({ id: orders.id });
      const orderId = inserted[0].id;
      if (clickId) {
        await tx
          .update(linkClicks)
          .set({ attributedOrderId: orderId })
          .where(eq(linkClicks.id, clickId));
      }
      return orderId;
    });
  } catch {
    return null;
  }
}
