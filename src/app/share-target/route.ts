import { NextResponse, type NextRequest } from "next/server";
import { getBaseUrl } from "@/lib/baseUrl";
import { extractSharedLink } from "@/lib/shared-link";

export const dynamic = "force-dynamic";

/** Receives Android shares and URL-encoded iOS Shortcut input; creates no records. */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const result = extractSharedLink([params.get("url") ?? "", params.get("text") ?? "", params.get("title") ?? ""]);
  const destination = new URL(result.error ? "/cai-dat-ung-dung" : "/start", getBaseUrl(request));
  if (result.error) destination.searchParams.set("shareError", result.error);
  else destination.searchParams.set("url", result.url);
  const response = NextResponse.redirect(destination, 303);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
