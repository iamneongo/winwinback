/* Network-only: never store dashboard, authentication, API or affiliate responses. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cần kết nối mạng — Win-Win Back</title><style>body{font:16px/1.6 system-ui;background:#f4f7fb;color:#173861;margin:0;padding:48px 24px}main{max-width:480px;margin:auto}a{display:inline-block;padding:12px 20px;background:#b7e961;color:#173861;border-radius:12px;font-weight:bold}</style><main><h1>Bạn đang ngoại tuyến</h1><p>Kết nối mạng để kiểm tra hoàn tiền. Link chia sẻ vẫn nằm trong địa chỉ trang này.</p><a href="">Thử tải lại</a></main></html>`,
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } },
  )));
});
