import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { integrationTokens, type IntegrationToken } from "@/db/schema";
import {
  exchangeAuthCode,
  refreshAccessToken,
  type TikTokTokenData,
} from "./client";

const PROVIDER = "tiktok";

// Refresh a little before actual expiry to avoid edge-of-expiry failures.
const REFRESH_SKEW_MS = 5 * 60 * 1000;

function toRow(data: TikTokTokenData) {
  return {
    provider: PROVIDER,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: new Date(data.access_token_expire_in * 1000),
    refreshTokenExpiresAt: data.refresh_token_expire_in
      ? new Date(data.refresh_token_expire_in * 1000)
      : null,
    openId: data.open_id ?? null,
    userType: data.user_type ?? null,
    sellerName: data.seller_name ?? null,
    grantedScopes: data.granted_scopes
      ? JSON.stringify(data.granted_scopes)
      : null,
    updatedAt: new Date(),
  };
}

async function upsertToken(data: TikTokTokenData): Promise<void> {
  const row = toRow(data);
  await db
    .insert(integrationTokens)
    .values(row)
    .onConflictDoUpdate({
      target: integrationTokens.provider,
      set: {
        accessToken: row.accessToken,
        refreshToken: row.refreshToken,
        accessTokenExpiresAt: row.accessTokenExpiresAt,
        refreshTokenExpiresAt: row.refreshTokenExpiresAt,
        openId: row.openId,
        userType: row.userType,
        sellerName: row.sellerName,
        grantedScopes: row.grantedScopes,
        updatedAt: row.updatedAt,
      },
    });
}

export async function getStoredTikTokToken(): Promise<
  IntegrationToken | null
> {
  const rows = await db
    .select()
    .from(integrationTokens)
    .where(eq(integrationTokens.provider, PROVIDER))
    .limit(1);
  return rows[0] ?? null;
}

/** Exchange an OAuth auth code and persist the resulting creator token. */
export async function connectTikTokWithAuthCode(
  authCode: string,
): Promise<TikTokTokenData> {
  const data = await exchangeAuthCode(authCode);
  await upsertToken(data);
  return data;
}

/** Force a refresh using the stored refresh token; persists the new token. */
export async function refreshStoredTikTokToken(): Promise<TikTokTokenData> {
  const stored = await getStoredTikTokToken();
  if (!stored) throw new Error("TikTok chưa được kết nối");
  const data = await refreshAccessToken(stored.refreshToken);
  await upsertToken(data);
  return data;
}

export async function disconnectTikTok(): Promise<void> {
  await db
    .delete(integrationTokens)
    .where(eq(integrationTokens.provider, PROVIDER));
}

/**
 * Return a currently-valid creator access token, refreshing if it is expired
 * or about to expire. Returns null if TikTok is not connected.
 */
export async function getValidTikTokAccessToken(): Promise<string | null> {
  const stored = await getStoredTikTokToken();
  if (!stored) return null;

  const expiresMs = stored.accessTokenExpiresAt.getTime();
  if (expiresMs - REFRESH_SKEW_MS > Date.now()) {
    return stored.accessToken;
  }

  const refreshed = await refreshStoredTikTokToken();
  return refreshed.access_token;
}
