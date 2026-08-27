import "server-only";
import { searchAffiliateOrders, type AffiliateOrder } from "./client";
import { getValidTikTokAccessToken } from "./tokens";

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
