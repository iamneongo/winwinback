import "server-only";
import { searchAffiliateOrders, type AffiliateOrder } from "./client";
import { getValidTikTokAccessToken } from "./tokens";
import { mapTikTokStatus } from "./sync";

export interface TikTokOrderRow {
  orderId: string;
  status: string;
  createdAt: string | null;
  productId: string;
  productName: string;
  price: string;
}

/** Human-readable date from a unix-seconds timestamp, or null. */
function fmtTime(unixSeconds?: number): string | null {
  if (!unixSeconds) return null;
  return new Date(unixSeconds * 1000).toLocaleString("vi-VN");
}

/** Flatten TikTok affiliate orders into one display row per product line. */
export function flattenOrders(orders: AffiliateOrder[]): TikTokOrderRow[] {
  const rows: TikTokOrderRow[] = [];
  for (const order of orders) {
    const skus = order.skus?.length ? order.skus : [undefined];
    for (const sku of skus) {
      rows.push({
        orderId: order.id,
        status: order.status ?? "—",
        createdAt: fmtTime(order.create_time),
        productId: sku?.product_id ?? "—",
        productName: sku?.product_name ?? "—",
        price: sku?.price?.amount
          ? `${sku.price.amount}${sku.price.currency ? ` ${sku.price.currency}` : ""}`
          : "—",
      });
    }
  }
  return rows;
}

/**
 * Fetch the connected creator's live affiliate orders from TikTok Shop.
 * Returns display-ready rows carrying real order ids (57/58...) and product
 * ids (17...). Throws if TikTok is not connected.
 */
export async function fetchConnectedCreatorOrders(): Promise<TikTokOrderRow[]> {
  const accessToken = await getValidTikTokAccessToken();
  if (!accessToken) {
    throw new Error("Chưa kết nối tài khoản Creator TikTok.");
  }
  const { orders } = await searchAffiliateOrders(accessToken, { pageSize: 50 });
  return flattenOrders(orders);
}

/** Persisted verdict for orders.tiktokVerifiedStatus. */
export type TikTokVerifiedStatus =
  | "settled"
  | "pending"
  | "cancelled"
  | "not_found";

export interface VerifyResult {
  /** False when no creator is connected (cannot verify at all). */
  connected: boolean;
  /** The verdict, or null when not connected. */
  status: TikTokVerifiedStatus | null;
  /** Raw TikTok status string if the order was found. */
  rawStatus?: string;
}

/**
 * Look up a single order id in the connected creator's affiliate orders and
 * decide whether cashback may be paid.
 *
 * "settled" is the only state that proves the creator actually earned a
 * commission on the order — the anti-fraud gate for approving payouts.
 * Scans recent pages (default last 90 days) until the id is found.
 */
export async function verifyTikTokOrder(
  externalOrderId: string,
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<VerifyResult> {
  const accessToken = await getValidTikTokAccessToken();
  if (!accessToken) return { connected: false, status: null };

  const sinceDays = opts.sinceDays ?? 90;
  const maxPages = opts.maxPages ?? 20;
  const createTimeGe = Math.floor(Date.now() / 1000) - sinceDays * 86400;

  let pageToken: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { orders, nextPageToken } = await searchAffiliateOrders(accessToken, {
      createTimeGe,
      pageSize: 50,
      pageToken,
    });
    const hit = orders.find((o) => o.id === externalOrderId);
    if (hit) {
      const mapped = mapTikTokStatus(hit.status);
      const status: TikTokVerifiedStatus =
        mapped === "completed"
          ? "settled"
          : mapped === "cancelled"
            ? "cancelled"
            : "pending";
      return { connected: true, status, rawStatus: hit.status };
    }
    if (!nextPageToken) break;
    pageToken = nextPageToken;
  }
  return { connected: true, status: "not_found" };
}
