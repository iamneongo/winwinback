import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Image proxy for article content. Streams marketplace product images from the
 * server so they display despite hotlink protection (e.g. TikTok CDN). Limited
 * to known image CDNs + image content-types to avoid being an open proxy.
 */
const ALLOWED_HOST_SUFFIXES = [
  "shopee.vn",
  "susercontent.com",
  "ibyteimg.com",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "ibytedtos.com",
];

function hostAllowed(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOWED_HOST_SUFFIXES.some((s) => h === s || h.endsWith("." + s));
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }
  if (parsed.protocol !== "https:" || !hostAllowed(parsed.hostname)) {
    return new NextResponse("forbidden", { status: 403 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: { "user-agent": "Mozilla/5.0 (compatible; WinWinBack/1.0)" },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok || !ct.startsWith("image/")) {
      return new NextResponse("not an image", { status: 404 });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "content-type": ct,
        "cache-control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse("fetch failed", { status: 502 });
  }
}
