import "server-only";

/**
 * Shopee Affiliate Open API config.
 *
 * Unlike TikTok (per-creator OAuth), Shopee authenticates every call with a
 * single app credential: an App ID + Secret issued on the Shopee Affiliate Open
 * Platform. Requests are signed SHA256(appId + timestamp + payload + secret).
 * Leave the env vars unset to keep Shopee inert (falls back to the mock link).
 */
const trimSlash = (v: string) => v.replace(/\/$/, "");

export const SHOPEE_API_BASE = trimSlash(
  process.env.SHOPEE_API_BASE || "https://open-api.affiliate.shopee.vn",
);

export const SHOPEE_GRAPHQL_PATH = "/graphql";

export function getShopeeAppId(): string {
  return process.env.SHOPEE_APP_ID ?? "";
}

export function getShopeeSecret(): string {
  return process.env.SHOPEE_APP_SECRET ?? "";
}

/** True when both app id and secret are configured. */
export function isShopeeConfigured(): boolean {
  return Boolean(getShopeeAppId() && getShopeeSecret());
}
