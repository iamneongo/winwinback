import "server-only";
import { getShopeeAffReport } from "./automation-client";
import { isShopeeAffConfigured } from "./config";
import { mapShopeeStatus, normalizeShopeeAffReportItem } from "./sync";
import type { VerifyResult } from "../tiktok/orders";

/** Find a single order in the ShopeeAff report for the admin verification UI. */
export async function verifyShopeeOrder(
  externalOrderId: string,
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<VerifyResult> {
  if (!isShopeeAffConfigured()) return { connected: false, status: null };

  const size = 100;
  for (let page = 1; page <= (opts.maxPages ?? 30); page++) {
    const response = await getShopeeAffReport({ days: opts.sinceDays ?? 90, page, size });
    const hit = response.list
      .map(normalizeShopeeAffReportItem)
      .find((item) => item?.id === externalOrderId);
    if (hit) {
      const mapped = mapShopeeStatus(hit.status);
      return {
        connected: true,
        status: mapped === "completed" ? "settled" : mapped === "cancelled" ? "cancelled" : "pending",
        rawStatus: hit.status,
      };
    }
    if (response.list.length < size) break;
  }
  return { connected: true, status: "not_found" };
}
