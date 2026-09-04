import "server-only";
import { getConversionReport } from "./client";
import { isShopeeConfigured } from "./config";
import { mapShopeeStatus } from "./sync";
import type { VerifyResult } from "../tiktok/orders";

/**
 * Look up a single Shopee order id in the affiliate conversion report and
 * decide whether cashback may be paid. "settled" (Shopee status COMPLETED) is
 * the only state that proves commission was earned — the anti-fraud gate.
 * Scans recent conversions (default last 90 days) until the id is found.
 */
export async function verifyShopeeOrder(
  externalOrderId: string,
  opts: { sinceDays?: number; maxPages?: number } = {},
): Promise<VerifyResult> {
  if (!isShopeeConfigured()) return { connected: false, status: null };

  const sinceDays = opts.sinceDays ?? 90;
  const maxPages = opts.maxPages ?? 30;
  const now = Math.floor(Date.now() / 1000);
  const purchaseTimeStart = now - sinceDays * 86400;

  let scrollId: string | undefined;
  for (let page = 0; page < maxPages; page++) {
    const { nodes, scrollId: next, hasNextPage } = await getConversionReport({
      purchaseTimeStart,
      purchaseTimeEnd: now,
      scrollId,
      limit: 100,
    });
    const hit = nodes.find((c) => c.orderId === externalOrderId);
    if (hit) {
      const mapped = mapShopeeStatus(hit.orderStatus);
      const status =
        mapped === "completed"
          ? ("settled" as const)
          : mapped === "cancelled"
            ? ("cancelled" as const)
            : ("pending" as const);
      return { connected: true, status, rawStatus: hit.orderStatus };
    }
    if (!hasNextPage || !next) break;
    scrollId = next;
  }
  return { connected: true, status: "not_found" };
}
