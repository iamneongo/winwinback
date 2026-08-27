import "server-only";
import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  TIKTOK_CREATOR_AUTH_URL,
  getTikTokAppKey,
} from "@/lib/affiliate/tiktok/config";
import { getBaseUrl } from "@/lib/baseUrl";

export const dynamic = "force-dynamic";

/**
 * Begin TikTok creator authorization: set an unguessable `state` cookie and
 * redirect the admin to the TikTok creator auth page. On approval TikTok
 * redirects back to the configured Redirect URL with `?code=...&state=...`.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const base = getBaseUrl(req);

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/login", base));
  }

  const appKey = getTikTokAppKey();
  if (!appKey) {
    return NextResponse.redirect(
      new URL("/admin/integrations?tiktok=misconfigured", base),
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = `${TIKTOK_CREATOR_AUTH_URL}?app_key=${encodeURIComponent(
    appKey,
  )}&state=${encodeURIComponent(state)}`;

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
