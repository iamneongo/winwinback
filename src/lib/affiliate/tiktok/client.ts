import "server-only";
import {
  TIKTOK_API_BASE,
  TIKTOK_AUTH_BASE,
  TIKTOK_GENERATE_LINK_PATH,
  TIKTOK_ORDERS_SEARCH_PATH,
  getTikTokAppKey,
  getTikTokAppSecret,
} from "./config";
import { signRequest } from "./sign";

/** Raw token payload returned by the OAuth token get/refresh endpoints. */
export interface TikTokTokenData {
  access_token: string;
  access_token_expire_in: number; // absolute unix seconds
  refresh_token: string;
  refresh_token_expire_in?: number; // absolute unix seconds
  open_id?: string;
  seller_name?: string;
  user_type?: number; // 1 = creator identity
  granted_scopes?: string[];
}

interface TikTokEnvelope<T> {
  code: number;
  message: string;
  request_id?: string;
  data: T;
}

export class TikTokApiError extends Error {
  constructor(
    message: string,
    readonly code: number,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "TikTokApiError";
  }
}

/**
 * Exchange an auth code for tokens, or refresh an existing token.
 * These auth-service calls are authenticated by app_secret in the query and
 * are NOT signed like the Open API calls.
 */
async function tokenCall(
  endpoint: "get" | "refresh",
  params: Record<string, string>,
): Promise<TikTokTokenData> {
  const query = new URLSearchParams({
    app_key: getTikTokAppKey(),
    app_secret: getTikTokAppSecret(),
    ...params,
  });
  const res = await fetch(
    `${TIKTOK_AUTH_BASE}/api/v2/token/${endpoint}?${query.toString()}`,
    { method: "GET", signal: AbortSignal.timeout(15000) },
  );
  const json = (await res.json()) as TikTokEnvelope<TikTokTokenData>;
  if (json.code !== 0 || !json.data?.access_token) {
    throw new TikTokApiError(
      json.message || "Token request failed",
      json.code,
      json.request_id,
    );
  }
  return json.data;
}

export function exchangeAuthCode(authCode: string): Promise<TikTokTokenData> {
  return tokenCall("get", {
    auth_code: authCode,
    grant_type: "authorized_code",
  });
}

export function refreshAccessToken(
  refreshToken: string,
): Promise<TikTokTokenData> {
  return tokenCall("refresh", {
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

/**
 * Perform a signed POST against the TikTok Open API and return `data`.
 */
async function signedPost<T>(
  path: string,
  accessToken: string,
  bodyObj: unknown,
  extraQuery: Record<string, string> = {},
): Promise<T> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Extra query params (e.g. page_size, page_token) participate in the signature
  // exactly like app_key/timestamp — signRequest sorts and includes them all.
  const query: Record<string, string> = {
    app_key: getTikTokAppKey(),
    timestamp,
    ...extraQuery,
  };
  const body = JSON.stringify(bodyObj);
  const sign = signRequest({
    path,
    query,
    body,
    appSecret: getTikTokAppSecret(),
    contentType: "application/json",
  });

  const url = `${TIKTOK_API_BASE}${path}?${new URLSearchParams({
    ...query,
    sign,
  }).toString()}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tts-access-token": accessToken,
    },
    body,
    signal: AbortSignal.timeout(15000),
  });

  const json = (await res.json()) as TikTokEnvelope<T>;
  if (json.code !== 0) {
    throw new TikTokApiError(
      json.message || "TikTok API error",
      json.code,
      json.request_id,
    );
  }
  return json.data;
}

export interface SharingLink {
  material_id: string;
  sharing_link: string;
  deep_link?: string;
  one_link?: string;
}

interface GenerateLinkData {
  sharing_links?: SharingLink[];
  failed_materials?: {
    material_id?: string;
    reason?: string;
    message?: string;
  }[];
}

/**
 * Generate affiliate sharing links for the given product ids.
 * Returns the successful links and any per-material failures.
 */
export async function generateSharingLinks(
  productIds: string[],
  accessToken: string,
): Promise<{
  links: SharingLink[];
  failed: NonNullable<GenerateLinkData["failed_materials"]>;
}> {
  const data = await signedPost<GenerateLinkData>(
    TIKTOK_GENERATE_LINK_PATH,
    accessToken,
    { material: { ids: productIds, type: "PRODUCT" } },
  );
  return {
    links: data.sharing_links ?? [],
    failed: data.failed_materials ?? [],
  };
}

// ---------------------------------------------------------------------------
// Affiliate orders (creator.affiliate_collaboration.read)
// ---------------------------------------------------------------------------

/** A single product line inside an affiliate order. */
export interface AffiliateOrderSku {
  id?: string;
  product_id?: string;
  product_name?: string;
  price?: { amount?: string; currency?: string };
  campaign_id?: string;
  open_collaboration_id?: string;
  target_collaboration_id?: string;
}

/** An affiliate order driven by the connected creator. */
export interface AffiliateOrder {
  /** TikTok Shop order id (18-digit, starts with 57/58). */
  id: string;
  create_time?: number;
  delivery_time?: number;
  status?: string;
  skus?: AffiliateOrderSku[];
}

interface SearchOrdersData {
  orders?: AffiliateOrder[];
  next_page_token?: string;
  total_count?: number;
}

/**
 * Search the connected creator's affiliate orders. Returns real TikTok Shop
 * order + product data (order id, product id/name, price, status).
 *
 * `createTimeGe` / `createTimeLt` are unix seconds; when both are omitted TikTok
 * defaults to [earliest shop time, now].
 */
export async function searchAffiliateOrders(
  accessToken: string,
  params: {
    createTimeGe?: number;
    createTimeLt?: number;
    pageSize?: number;
    pageToken?: string;
  } = {},
): Promise<{ orders: AffiliateOrder[]; nextPageToken?: string }> {
  const extraQuery: Record<string, string> = {
    page_size: String(params.pageSize ?? 50),
  };
  if (params.pageToken) extraQuery.page_token = params.pageToken;

  const body: Record<string, number> = {};
  if (params.createTimeGe) body.create_time_ge = params.createTimeGe;
  if (params.createTimeLt) body.create_time_lt = params.createTimeLt;

  const data = await signedPost<SearchOrdersData>(
    TIKTOK_ORDERS_SEARCH_PATH,
    accessToken,
    body,
    extraQuery,
  );
  return {
    orders: data.orders ?? [],
    nextPageToken: data.next_page_token,
  };
}
