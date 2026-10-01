import "server-only";
import { getShopeeAffReport } from "./automation-client";
import { isShopeeAffConfigured } from "./config";
import { flattenCheckout } from "./sync";
import type { VerifyResult } from "../tiktok/orders";

/** Find a single order in the ShopeeAff report for the admin verification UI. */
export async function verifyShopeeOrder(
  externalOrderId: string,
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<VerifyResult> {
  if (!isShopeeAffConfigured()) return { connected: false, status: null };

  const size = 100;
  for (let page = 1; page <= (opts.maxPages ?? 30); page++) {
    const { list } = await getShopeeAffReport({ days: opts.sinceDays ?? 90, page, size });
    const hit = list
      .flatMap(flattenCheckout)
      .find((order) => order.orderSn === externalOrderId);
    if (hit) {
      return {
        connected: true,
        status: hit.status === "completed" ? "settled" : hit.status === "cancelled" ? "cancelled" : "pending",
        rawStatus: hit.rawStatus,
      };
    }
    if (list.length < size) break;
  }
  return { connected: true, status: "not_found" };
}
