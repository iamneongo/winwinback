import "server-only";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  TIKTOK_CREATOR_AUTH_URL,
  getTikTokAppKey,
} from "@/lib/affiliate/tiktok/config";

export const dynamic = "force-dynamic";

/**
 * Begin TikTok creator authorization: set an unguessable `state` cookie and
 * redirect the admin to the TikTok creator auth page. On approval TikTok
 * redirects back to the configured Redirect URL with `?code=...&state=...`.
 */
export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/login", getBaseUrl()));
  }

  const appKey = getTikTokAppKey();
  if (!appKey) {
    return NextResponse.redirect(
      new URL("/admin/integrations?tiktok=misconfigured", getBaseUrl()),
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

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
