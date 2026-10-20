import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { gscConfig } from "@/lib/articles/seo-search-console";

export const dynamic = "force-dynamic";
export async function GET() {
  await requireAdmin();
  let config: ReturnType<typeof gscConfig>;
  try { config = gscConfig(); } catch { return new Response("Search Console chưa được cấu hình.", { status: 503 }); }
  const state = randomBytes(32).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: config.redirectUri, response_type: "code", scope: "https://www.googleapis.com/auth/webmasters.readonly", access_type: "offline", prompt: "consent", state }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set("gsc_oauth_state", state, { httpOnly: true, secure: config.origin.startsWith("https://"), sameSite: "lax", path: "/api/admin/seo/search-console/callback", maxAge: 600 });
  return response;
}
