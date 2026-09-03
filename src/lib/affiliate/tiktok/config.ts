import "server-only";

/**
 * TikTok Shop Open Platform endpoints and app credentials.
 *
 * Base URLs default to production but can be overridden via env so a sandbox /
 * test-shop app can be pointed at a different host without code changes. Leave
 * the env vars unset for production. Credentials come from Partner Center via
 * TIKTOK_APP_KEY / TIKTOK_APP_SECRET (use the sandbox app's key/secret to test).
 */
const trimSlash = (v: string) => v.replace(/\/$/, "");

/** Main Open API host for signed business calls (generate link, orders, ...). */
export const TIKTOK_API_BASE = trimSlash(
  process.env.TIKTOK_API_BASE || "https://open-api.tiktokglobalshop.com",
);

/** OAuth token service host (get / refresh access token). */
export const TIKTOK_AUTH_BASE = trimSlash(
  process.env.TIKTOK_AUTH_BASE || "https://auth.tiktok-shops.com",
);

/** Creator authorization page — the user signs in and grants creator scopes. */
export const TIKTOK_CREATOR_AUTH_URL =
  process.env.TIKTOK_CREATOR_AUTH_URL ||
  "https://shop.tiktok.com/alliance/creator/auth";

/** Endpoint to generate affiliate sharing links from product (material) ids. */
export const TIKTOK_GENERATE_LINK_PATH =
  "/affiliate_creator/202505/affiliate_sharing_links/general_publishers/generate_batch";

/** Endpoint to search affiliate orders driven by the creator. */
export const TIKTOK_ORDERS_SEARCH_PATH =
  "/affiliate_creator/202410/orders/search";

export function getTikTokAppKey(): string {
  return process.env.TIKTOK_APP_KEY ?? "";
}

export function getTikTokAppSecret(): string {
  return process.env.TIKTOK_APP_SECRET ?? "";
}

/** True when both app key and secret are configured. */
export function isTikTokConfigured(): boolean {
  return Boolean(getTikTokAppKey() && getTikTokAppSecret());
}
