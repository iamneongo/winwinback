import { NextResponse, type NextRequest } from "next/server";

/**
 * Invite entry point: /r/<referralCode>. Stores the code in a cookie so it
 * survives the sign-up + email-verification round trip, then sends the visitor
 * to the register page. The dashboard layout later reconciles referredBy from
 * this cookie once the invited user first signs in.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/register", req.url));
  if (code) {
    res.cookies.set("ww_ref", code, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });
  }
  return res;
}
