import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { searchAffiliateOrders } from "./client";
import { getValidTikTokAccessToken } from "./tokens";
import { settleOrderCashback } from "@/lib/wallet";

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

export interface SyncResult {
  connected: boolean;
  scanned: number;
  updated: number;
  credited: number;
  unmatched: number;
}

/**
 * Reconcile the connected creator's TikTok affiliate orders against our DB.
 *
 * Updates the status of orders we already track (matched by externalOrderId)
 * and auto-credits cashback once they reach "completed". Brand-new orders are
 * NOT created here: TikTok's order search does not reveal which app user drove
 * the sale, so attribution stays with the webhook (shortCode / userEmail).
 * Unmatched TikTok orders are only counted, for admin reconciliation.
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
      unmatched: 0,
    };
  }

  const sinceDays = opts.sinceDays ?? 7;
  const maxPages = opts.maxPages ?? 10;
  const createTimeGe = Math.floor(Date.now() / 1000) - sinceDays * 86400;

  const fetched: { id: string; status?: string }[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { orders: batch, nextPageToken } = await searchAffiliateOrders(
      accessToken,
      { createTimeGe, pageSize: 50, pageToken },
    );
    for (const o of batch) fetched.push({ id: o.id, status: o.status });
    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }

  const scanned = fetched.length;
  if (scanned === 0) {
    return { connected: true, scanned, updated: 0, credited: 0, unmatched: 0 };
  }

  const ids = [...new Set(fetched.map((o) => o.id))];
  const existing = await db
    .select()
    .from(orders)
    .where(inArray(orders.externalOrderId, ids));
  const byExt = new Map(existing.map((o) => [o.externalOrderId, o]));

  let updated = 0;
  let unmatched = 0;
  const toSettle = new Set<string>();

  for (const o of fetched) {
    const row = byExt.get(o.id);
    if (!row) {
      unmatched++;
      continue;
    }
    const mapped = mapTikTokStatus(o.status);
    if (mapped && mapped !== row.status) {
      await db.update(orders).set({ status: mapped }).where(eq(orders.id, row.id));
      updated++;
      if (mapped === "completed") toSettle.add(row.id);
    } else if (row.status === "completed" && !row.cashbackCreditedAt) {
      // Completed previously but not yet credited (e.g. an earlier crash).
      toSettle.add(row.id);
    }
  }

  let credited = 0;
  for (const id of toSettle) {
    if (await settleOrderCashback(id)) credited++;
  }

  return { connected: true, scanned, updated, credited, unmatched };
}
