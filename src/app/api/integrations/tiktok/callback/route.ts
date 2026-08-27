import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectTikTokWithAuthCode } from "@/lib/affiliate/tiktok/tokens";
import { TikTokApiError } from "@/lib/affiliate/tiktok/client";
import { getBaseUrl } from "@/lib/baseUrl";

export const dynamic = "force-dynamic";

/**
 * OAuth callback for TikTok creator authorization.
 *
 * NOTE: For this to fire automatically, set the app's Redirect URL in Partner
 * Center to <base>/api/integrations/tiktok/callback. If the Redirect URL is the
 * site root, use the manual auth-code form on /admin/integrations instead.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const base = getBaseUrl(req);

  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/login", base));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("tiktok_oauth_state")?.value;

  const redirectTo = (status: string, reason?: string) => {
    const target = new URL(`/admin/integrations?tiktok=${status}`, base);
    if (reason) target.searchParams.set("reason", reason);
    return NextResponse.redirect(target);
  };

  if (!code) return redirectTo("denied");
  if (!state || !cookieState || state !== cookieState) {
    return redirectTo("bad_state");
  }

  try {
    const data = await connectTikTokWithAuthCode(code);
    const res =
      data.user_type === 1 ? redirectTo("connected") : redirectTo("not_creator");
    res.cookies.delete("tiktok_oauth_state");
    return res;
  } catch (e) {
    const reason =
      e instanceof TikTokApiError
        ? `mã ${e.code}: ${e.message}`
        : e instanceof Error
          ? e.message
          : "unknown";
    return redirectTo("error", reason);
  }
}
