import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { connectTikTokWithAuthCode } from "@/lib/affiliate/tiktok/tokens";

export const dynamic = "force-dynamic";

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/**
 * OAuth callback for TikTok creator authorization.
 *
 * NOTE: For this to fire automatically, set the app's Redirect URL in Partner
 * Center to <base>/api/integrations/tiktok/callback. If the Redirect URL is the
 * site root, use the manual auth-code form on /admin/integrations instead.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/login", baseUrl()));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.cookies.get("tiktok_oauth_state")?.value;

  const redirectTo = (status: string) =>
    NextResponse.redirect(
      new URL(`/admin/integrations?tiktok=${status}`, baseUrl()),
    );

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
  } catch {
    return redirectTo("error");
  }
}
