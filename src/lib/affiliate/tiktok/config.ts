import "server-only";

/**
 * TikTok Shop Open Platform endpoints and app credentials.
 *
 * Base URLs are fixed by TikTok; credentials come from Partner Center and are
 * provided via env (TIKTOK_APP_KEY / TIKTOK_APP_SECRET).
 */

/** Main Open API host for signed business calls (generate link, orders, ...). */
export const TIKTOK_API_BASE = "https://open-api.tiktokglobalshop.com";

/** OAuth token service host (get / refresh access token). */
export const TIKTOK_AUTH_BASE = "https://auth.tiktok-shops.com";

/** Creator authorization page — the user signs in and grants creator scopes. */
export const TIKTOK_CREATOR_AUTH_URL =
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
