import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { exchangeGscCode, findSiteProperty, gscConfig, saveGscConnection } from "@/lib/articles/seo-search-console";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  await requireAdmin();
  const configured = gscConfig();
  const home = new URL("/admin/bai-viet/seo", configured.origin);
  const given = request.nextUrl.searchParams.get("state") || "";
  const stored = request.cookies.get("gsc_oauth_state")?.value || "";
  const valid = stored.length > 0 && Buffer.byteLength(stored) === Buffer.byteLength(given) && timingSafeEqual(Buffer.from(stored), Buffer.from(given));
  if (!valid) return new Response("Phiên kết nối Google hết hạn hoặc không hợp lệ.", { status: 400 });
  if (request.nextUrl.searchParams.get("error")) return new Response("Bạn đã từ chối kết nối Search Console.", { status: 400 });
  const code = request.nextUrl.searchParams.get("code");
  if (!code || code.length > 4096) return new Response("Google không trả mã xác thực hợp lệ.", { status: 400 });
  try {
    const token = await exchangeGscCode(code);
    if (!token.refresh_token) throw new Error("Google không cấp quyền truy cập ngoại tuyến. Hãy thu hồi quyền ứng dụng rồi kết nối lại.");
    const property = await findSiteProperty(token.access_token!);
    if (!property) throw new Error("Tài khoản Google không có quyền Search Console cho website này.");
    await saveGscConnection(property, token.refresh_token);
    home.searchParams.set("gsc", "connected");
    const response = NextResponse.redirect(home);
    response.cookies.set("gsc_oauth_state", "", { httpOnly: true, secure: configured.origin.startsWith("https://"), sameSite: "lax", path: "/api/admin/seo/search-console/callback", maxAge: 0 });
    return response;
  } catch (error) {
    return new Response(error instanceof Error ? error.message : "Kết nối Google thất bại.", { status: 400 });
  }
}
