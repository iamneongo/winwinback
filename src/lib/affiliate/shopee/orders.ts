import "server-only";
import { getShopeeConversions } from "./automation-client";
import { isShopeeAffConfigured } from "./config";
import type { VerifyResult } from "../tiktok/orders";

const COMPLETED = new Set(["COMPLETED", "SETTLED", "VALIDATED"]);
const CANCELLED = new Set(["CANCELLED", "CANCELED", "REFUNDED", "REJECTED", "RETURNED"]);

/**
 * Verify a single Shopee order via the conversion API for the admin UI.
 * "settled" requires status COMPLETED and not flagged fraud (anti-fraud gate);
 * fraud or cancelled/refunded map to "cancelled".
 */
export async function verifyShopeeOrder(
  externalOrderId: string,
  opts: { sinceDays?: number } = {},
): Promise<VerifyResult> {
  if (!isShopeeAffConfigured()) return { connected: false, status: null };

  const conversions = await getShopeeConversions({
    days: opts.sinceDays ?? 90,
    size: 500,
  });
  const hit = conversions.find((c) => c.orderSn === externalOrderId);
  if (!hit) return { connected: true, status: "not_found" };

  const raw = (hit.status ?? "").toUpperCase();
  const status =
    COMPLETED.has(raw) && !hit.isFraud
      ? "settled"
      : hit.isFraud || CANCELLED.has(raw)
        ? "cancelled"
        : "pending";
  return { connected: true, status, rawStatus: hit.status };
}
