import "server-only";
import {
  getShopeeAffApiKey,
  isShopeeAffConfigured,
  SHOPEE_AFF_API_URL,
} from "./config";
import { toShopeeSubId1 } from "./sub-id";

export class ShopeeAffApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string | number,
  ) {
    super(message);
    this.name = "ShopeeAffApiError";
  }
}

/**
 * One marketplace order inside a checkout, as returned by GET /api/report.
 * `order_sn` is the stable, per-order idempotency key used for cashback payout.
 */
export interface ShopeeReportOrder {
  order_sn: string;
  order_id?: string;
  order_status?: string; // UNPAID | PENDING | COMPLETED | CANCELLED ...
  display_order_status?: number;
  complete_time?: number; // unix seconds
}

/**
 * One checkout (conversion) from GET /api/report. A checkout can contain several
 * marketplace orders; commission is reported at the checkout level, so it must
 * be split across `orders` when crediting cashback per order_sn.
 */
export interface ShopeeReportCheckout {
  checkout_id?: string;
  purchase_time?: number; // unix seconds
  /** SubIds echoed back as `subId1-subId2-...`; user = split("-")[0]. */
  utm_content?: string;
  affiliate_id?: number;
  conversion_status?: number;
  gross_commission?: number; // confirmed commission
  estimated_total_commission?: number; // estimate (fallback)
  device?: string;
  orders?: ShopeeReportOrder[];
}

interface JsonEnvelope {
  ok?: boolean;
  error?: string;
  message?: string;
  code?: string | number;
  // POST /api/link
  shortLink?: string;
  longLink?: string;
  userId?: string;
  subIds?: Record<string, string>;
  // GET /api/report
  list?: ShopeeReportCheckout[];
  // GET /api/conversions
  conversions?: ShopeeConversion[];
  summary?: ShopeeConversionsSummary;
}

/** One line item inside a conversion (GET /api/conversions). */
export interface ShopeeConversionItem {
  itemId?: number | string;
  name?: string;
  shopName?: string;
  price?: number;
  actual?: number;
  refunded?: number;
  qty?: number;
  commission?: number;
  status?: string;
  isFraud?: boolean;
  fraudReason?: string | null;
}

/**
 * A processed conversion from GET /api/conversions. Unlike /api/report this is
 * already matched to our user (userId = subId1), carries product info, money in
 * VND (no /100000), and a fraud verdict — the preferred reconciliation source.
 */
export interface ShopeeConversion {
  orderSn: string;
  checkoutId?: string;
  /** subId1 (compact 32-hex user id) or "" when the worker could not match. */
  userId?: string;
  subId?: string;
  matched?: boolean;
  manual?: boolean;
  commission?: number; // VND
  status?: string; // COMPLETED | CANCELLED | REFUNDED | PENDING ...
  isFraud?: boolean;
  orderValue?: number; // VND
  itemName?: string;
  purchaseTime?: number; // unix seconds
  completeTime?: number | null;
  device?: string;
  source?: string;
  items?: ShopeeConversionItem[];
}

export interface ShopeeConversionsSummary {
  total?: number;
  matched?: number;
  unmatched?: number;
  commission?: number;
  byStatus?: Record<string, number>;
}

async function request<T extends JsonEnvelope>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!isShopeeAffConfigured()) {
    throw new ShopeeAffApiError(
      "ShopeeAff chưa được cấu hình. Thiết lập SHOPEE_AFF_API_URL và SHOPEE_AFF_API_KEY.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${SHOPEE_AFF_API_URL}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      headers: {
        "x-api-key": getShopeeAffApiKey(),
        ...init?.headers,
      },
    });
  } catch {
    throw new ShopeeAffApiError("Không kết nối được ShopeeAff worker.");
  }

  const body = (await response.json().catch(() => ({}))) as T;
  if (!response.ok || body.ok === false) {
    throw new ShopeeAffApiError(
      body.error ?? body.message ?? "ShopeeAff không thể xử lý yêu cầu.",
      response.status,
      body.code,
    );
  }
  return body;
}

/** Raw POST /api/link. `userId` becomes subId1 (must already be Shopee-safe). */
export async function createShopeeAffLink(input: {
  originalLink: string;
  userId: string;
}): Promise<{ affiliateUrl: string }> {
  const response = await request<JsonEnvelope>("/api/link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const affiliateUrl = response.shortLink ?? response.longLink;
  if (!affiliateUrl) {
    throw new ShopeeAffApiError("ShopeeAff không trả về affiliate link.");
  }
  return { affiliateUrl };
}

// ---------------------------------------------------------------------------
// getCashbackLink — cached wrapper over POST /api/link
// ---------------------------------------------------------------------------

/**
 * Cashback links are deterministic for a given (user, product URL): subId1 is
 * derived from the user id, so the worker returns the same link every time.
 * Cache them in-process to avoid hammering the worker on repeated pastes.
 */
const LINK_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const LINK_CACHE_MAX = 2000;
const linkCache = new Map<string, { url: string; expires: number }>();

/**
 * Turn a pasted Shopee URL into the user's trackable cashback link.
 * `userId` is the internal UUID; it is compacted into a Shopee-safe subId1 so
 * the conversion report can attribute the order back via `utm_content`.
 */
export async function getCashbackLink(
  userId: string,
  originalLink: string,
): Promise<string> {
  const subId1 = toShopeeSubId1(userId);
  const cacheKey = `${subId1}::${originalLink}`;

  const hit = linkCache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.url;
  if (hit) linkCache.delete(cacheKey); // expired

  const { affiliateUrl } = await createShopeeAffLink({
    originalLink,
    userId: subId1,
  });

  if (linkCache.size >= LINK_CACHE_MAX) {
    // Cheap eviction: drop the oldest insertion.
    const oldest = linkCache.keys().next().value;
    if (oldest !== undefined) linkCache.delete(oldest);
  }
  linkCache.set(cacheKey, { url: affiliateUrl, expires: Date.now() + LINK_TTL_MS });
  return affiliateUrl;
}

/** Fetch one page of the affiliate conversion report (GET /api/report). */
export async function getShopeeAffReport(input: {
  days: number;
  page: number;
  size: number;
}): Promise<{ list: ShopeeReportCheckout[] }> {
  const query = new URLSearchParams({
    days: String(input.days),
    page: String(input.page),
    size: String(input.size),
  });
  const response = await request<JsonEnvelope>(`/api/report?${query}`);
  return { list: response.list ?? [] };
}

/**
 * Fetch processed conversions (GET /api/conversions). Already matched to a user
 * (userId = subId1), with product info, VND money and an isFraud verdict.
 */
export async function getShopeeConversions(input: {
  days: number;
  size?: number;
  unmatched?: boolean;
  status?: "COMPLETED" | "CANCELLED" | "REFUNDED" | "PENDING";
  userId?: string;
}): Promise<ShopeeConversion[]> {
  const query = new URLSearchParams({ days: String(input.days) });
  if (input.size != null) query.set("size", String(input.size));
  if (input.unmatched) query.set("unmatched", "1");
  if (input.status) query.set("status", input.status);
  if (input.userId) query.set("userId", input.userId);
  const response = await request<JsonEnvelope>(`/api/conversions?${query}`);
  return response.conversions ?? [];
}

/** Manually bind an order_sn to a user (POST /api/conversions/map). */
export async function mapShopeeConversion(
  orderSn: string,
  userId: string,
): Promise<void> {
  await request<JsonEnvelope>("/api/conversions/map", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ orderSn, userId }),
  });
}

/** Projected product info (GET /api/product) used to preview cashback. */
export interface ShopeeProductInfo {
  itemId?: number | string;
  shopId?: number | string;
  name?: string;
  shopName?: string;
  price?: number;
  image?: string;
  productLink?: string;
  category?: string[];
  rating?: string | number;
  sales?: number;
  /** Estimated affiliate commission in VND ("dự kiến"). */
  commission?: number;
  totalRatePercent?: number;
  cap?: number;
  isCapped?: boolean;
  estimate?: boolean;
}

/**
 * Best-effort projected commission + price for a Shopee product URL
 * (GET /api/product). Returns null on any failure — this only previews cashback
 * so it must never throw or block link creation.
 */
export async function getShopeeProductInfo(
  url: string,
): Promise<ShopeeProductInfo | null> {
  try {
    const res = await request<JsonEnvelope & { product?: ShopeeProductInfo }>(
      `/api/product?${new URLSearchParams({ url })}`,
    );
    return res.product ?? null;
  } catch {
    return null;
  }
}

/** Worker self-check (GET /api/selfcheck) — for health monitoring. */
export async function getShopeeAffSelfcheck(): Promise<{
  ok: boolean;
  at?: string;
  checks: { name: string; ok: boolean; detail?: string }[];
}> {
  const res = await request<
    JsonEnvelope & {
      at?: string;
      checks?: { name: string; ok: boolean; detail?: string }[];
    }
  >("/api/selfcheck");
  return { ok: Boolean(res.ok), at: res.at, checks: res.checks ?? [] };
}
