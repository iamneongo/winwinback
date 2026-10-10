import "server-only";
import { and, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { orders, linkClicks } from "@/db/schema";
import { searchAffiliateOrders, type AffiliateOrder } from "./client";
import { getValidTikTokAccessToken } from "./tokens";
import { settleOrderCashback } from "@/lib/wallet";
import { cashbackRate } from "@/lib/config";
import { notifyAdminsForPendingOrder, notifyOrderStatusForOrder } from "@/lib/notify";

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

/**
 * Map a raw TikTok affiliate order status to our internal lifecycle.
 * Conservative: returns null for anything unrecognised so we never change a
 * local order (and never trigger cashback) on an unknown signal.
 */
export function mapTikTokStatus(raw?: string): OrderStatus | null {
  if (!raw) return null;
  const s = raw.toUpperCase();
  if (/(SETTLE|COMPLETE|FINISH|PAID)/.test(s)) return "completed";
  if (/(CANCEL|REFUND|RETURN|INVALID|CLOSED)/.test(s)) return "cancelled";
  if (/(DELIVER|SHIP|COLLECT|CONFIRM)/.test(s)) return "confirmed";
  if (/(UNPAID|PENDING|AWAIT|CREATE)/.test(s)) return "pending";
  return null;
}

/** Verified-status string stored on the order, derived from the TikTok state. */
function verifiedFrom(mapped: OrderStatus | null): string {
  if (mapped === "completed") return "settled";
  if (mapped === "cancelled") return "cancelled";
  return "pending";
}

/** Best-effort parse of a formatted money string (e.g. "Rp9.900") to an int. */
function parseAmount(raw?: string): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Flatten an order to the fields we need for reconciliation + attribution. */
interface FetchedOrder {
  id: string;
  status?: string;
  createTime?: number;
  productId?: string;
  productName?: string;
  amount: number;
  /** Affiliate commission in VND (what cashback is a share of). */
  commission: number;
}

function toFetched(o: AffiliateOrder): FetchedOrder {
  const sku = o.skus?.[0];
  // Cashback is a share of the commission the creator actually earns — never of
  // the order's gross price. Prefer the finalised amount, fall back to the
  // estimate while the order is still pending.
  const commission =
    parseAmount(sku?.actual_commission?.amount) ||
    parseAmount(sku?.estimated_commission?.amount);
  return {
    id: o.id,
    status: o.status,
    createTime: o.create_time,
    productId: sku?.product_id,
    productName: sku?.product_name,
    amount: parseAmount(sku?.price?.amount),
    commission,
  };
}

export interface SyncResult {
  connected: boolean;
  scanned: number;
  updated: number;
  credited: number;
  /** New orders created by attributing an unmatched TikTok order to a user. */
  attributed: number;
  /** TikTok orders that matched no local order and no click (left for admin). */
  unmatched: number;
}

/**
 * Reconcile the connected creator's TikTok affiliate orders against our DB.
 *
 * - Orders we already track are status-synced and auto-credited on completion.
 * - Brand-new TikTok orders are attributed to the app user whose /go click for
 *   the same product most recently preceded the order (last-click), then created
 *   locally. This is the order→user attribution that lets cashback flow while
 *   preventing paying a user for an order they did not drive.
 * - Anything that matches neither a local order nor a click is only counted.
 */
export async function syncTikTokOrders(
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<SyncResult> {
  const accessToken = await getValidTikTokAccessToken();
  if (!accessToken) {
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
  const createTimeGe = Math.floor(Date.now() / 1000) - sinceDays * 86400;

  const fetched: FetchedOrder[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { orders: batch, nextPageToken } = await searchAffiliateOrders(
      accessToken,
      { createTimeGe, pageSize: 50, pageToken },
    );
    for (const o of batch) fetched.push(toFetched(o));
    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }

  const scanned = fetched.length;
  if (scanned === 0) {
    return {
      connected: true,
      scanned,
      updated: 0,
      credited: 0,
      attributed: 0,
      unmatched: 0,
    };
  }

  const ids = [...new Set(fetched.map((o) => o.id))];
  const existing = await db
    .select()
    .from(orders)
    .where(inArray(orders.externalOrderId, ids));
  const byExt = new Map(existing.map((o) => [o.externalOrderId, o]));

  let updated = 0;
  let attributed = 0;
  let unmatched = 0;
  const toSettle = new Set<string>();

  for (const o of fetched) {
    const row = byExt.get(o.id);
    const mapped = mapTikTokStatus(o.status);

    if (row) {
      // Known order → status sync + refresh commission/cashback until it is paid
      // (the estimate at attribution time is replaced by the settled amount).
      const statusChanged = Boolean(mapped && mapped !== row.status);
      const pendingPayout = !row.cashbackCreditedAt;
      const refreshPayout = pendingPayout && o.commission > 0;
      if (statusChanged || refreshPayout) {
        await db
          .update(orders)
          .set({
            ...(statusChanged
              ? {
                  status: mapped!,
                  tiktokVerifiedStatus: verifiedFrom(mapped),
                  tiktokVerifiedAt: new Date(),
                }
              : {}),
            ...(refreshPayout
              ? {
                  commissionAmount: o.commission,
                  cashbackAmount: Math.round(o.commission * cashbackRate),
                }
              : {}),
          })
          .where(eq(orders.id, row.id));
        updated++;
        if (statusChanged && mapped !== "completed") {
          await notifyOrderStatusForOrder(row.id, mapped!).catch(() => {});
          if (mapped === "pending") {
            await notifyAdminsForPendingOrder(row.id).catch(() => {});
          }
        }
      }
      const nextStatus = mapped ?? (row.status as OrderStatus);
      if (nextStatus === "completed" && pendingPayout) toSettle.add(row.id);
      continue;
    }

    // Unknown order → try to attribute it to a user via a matching click.
    const created = await attributeOrder(o, mapped);
    if (created) {
      attributed++;
      if (mapped !== "completed") {
        await notifyOrderStatusForOrder(created, mapped ?? "pending").catch(() => {});
        if ((mapped ?? "pending") === "pending") {
          await notifyAdminsForPendingOrder(created).catch(() => {});
        }
      }
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

/**
 * Attribute an unmatched TikTok order to a user using the click log:
 * the most recent unattributed click for the same product, made at or before
 * the order's creation time. Returns the new order id, or null if unattributable.
 */
async function attributeOrder(
  o: FetchedOrder,
  mapped: OrderStatus | null,
): Promise<string | null> {
  if (!o.productId) return null;

  const orderTime = o.createTime ? new Date(o.createTime * 1000) : new Date();
  const clicks = await db
    .select()
    .from(linkClicks)
    .where(
      and(
        eq(linkClicks.productId, o.productId),
        isNull(linkClicks.attributedOrderId),
        lte(linkClicks.clickedAt, orderTime),
      ),
    )
    .orderBy(desc(linkClicks.clickedAt))
    .limit(1);
  const click = clicks[0];
  if (!click) return null;

  const status: OrderStatus = mapped ?? "pending";
  const cashback = Math.round(o.commission * cashbackRate);

  try {
    const created = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(orders)
        .values({
          userId: click.userId,
          linkId: click.linkId,
          platform: "tiktok",
          externalOrderId: o.id,
          productName: o.productName ?? "Đơn TikTok Shop",
          orderAmount: o.amount,
          commissionAmount: o.commission,
          cashbackAmount: cashback,
          status,
          tiktokVerifiedStatus: verifiedFrom(mapped),
          tiktokVerifiedAt: new Date(),
        })
        .returning({ id: orders.id });
      const orderId = inserted[0].id;
      await tx
        .update(linkClicks)
        .set({ attributedOrderId: orderId })
        .where(eq(linkClicks.id, click.id));
      return orderId;
    });
    return created;
  } catch {
    // Unique-violation race (order already created by a concurrent run) etc.
    return null;
  }
}
