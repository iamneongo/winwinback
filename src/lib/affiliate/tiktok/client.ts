import "server-only";
import {
  TIKTOK_API_BASE,
  TIKTOK_AUTH_BASE,
  TIKTOK_GENERATE_LINK_PATH,
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
): Promise<T> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const query: Record<string, string> = {
    app_key: getTikTokAppKey(),
    timestamp,
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
