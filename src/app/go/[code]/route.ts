import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { incrementClicks } from "@/lib/wallet";

/** True for plain web links (one_link / sharing_link) safe to 302-redirect. */
function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Escape a string for safe embedding inside an HTML text/attribute context. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Interstitial for custom-scheme deep links (e.g. `snssdk1180://…`).
 *
 * A raw 302 to a non-http scheme is unreliable: many browsers refuse to follow
 * a server redirect into an app scheme. Instead we serve a tiny page that opens
 * the app from the client (a real navigation the browser honours) and offers a
 * web fallback so the buyer is never stranded if the app is not installed.
 */
function deepLinkInterstitial(appUrl: string, webFallback: string): string {
  const appJson = JSON.stringify(appUrl);
  const webJson = JSON.stringify(webFallback);
  const webAttr = escapeHtml(webFallback);
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Đang mở ứng dụng…</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background:#0b0b0f; color:#f4f4f5; padding:24px; }
  .card { max-width:360px; text-align:center; }
  .spinner { width:36px; height:36px; margin:0 auto 20px; border-radius:50%;
    border:3px solid rgba(255,255,255,.2); border-top-color:#ff0050; animation:spin .8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  h1 { font-size:18px; margin:0 0 8px; }
  p { font-size:14px; opacity:.7; margin:0 0 20px; line-height:1.5; }
  a.btn { display:inline-block; padding:12px 20px; border-radius:10px; font-weight:700;
    font-size:14px; text-decoration:none; background:#ff0050; color:#fff; }
</style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h1>Đang mở ứng dụng…</h1>
    <p>Nếu ứng dụng không tự mở, hãy bấm nút bên dưới để tiếp tục.</p>
    <a class="btn" id="fallback" href="${webAttr}">Tiếp tục trên web</a>
  </div>
  <script>
    (function () {
      var app = ${appJson};
      var web = ${webJson};
      // Attempt the app scheme from the client — a navigation the browser honours.
      window.location.href = app;
      // If we are still here after a moment, the app almost certainly is not
      // installed; fall through to the web link so the purchase can complete.
      setTimeout(function () {
        if (!document.hidden) { window.location.href = web; }
      }, 2000);
    })();
  </script>
</body>
</html>`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const rows = await db
    .select()
    .from(affiliateLinks)
    .where(eq(affiliateLinks.shortCode, code))
    .limit(1);
  const link = rows[0];

  if (!link) {
    return NextResponse.redirect(new URL("/", _req.url), 302);
  }

  // Best-effort click tracking; never block the redirect.
  incrementClicks(link.id).catch(() => {});

  // Web links (one_link / sharing_link) redirect straight away. Custom-scheme
  // deep links go through a client-side interstitial that reliably opens the
  // app and falls back to the original product page on the web.
  if (isHttpUrl(link.affiliateUrl)) {
    return NextResponse.redirect(link.affiliateUrl, 302);
  }

  return new NextResponse(
    deepLinkInterstitial(link.affiliateUrl, link.originalUrl),
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
