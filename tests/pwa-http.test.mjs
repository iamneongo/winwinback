import assert from "node:assert/strict";
import { test } from "node:test";

const base = process.env.PWA_TEST_BASE_URL || "http://127.0.0.1:3100";
const request = (path) => fetch(`${base}${path}`, { redirect: "manual", headers: { "x-forwarded-proto": new URL(base).protocol.slice(0, -1) } });

test("installed app declares the receiver and serves correctly-sized PNG icons", async () => {
  const response = await request("/manifest.webmanifest");
  assert.equal(response.status, 200);
  const manifest = await response.json();
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.share_target.action, "/share-target");
  assert.equal(manifest.share_target.params.text, "text");
  for (const icon of manifest.icons) {
    const response = await request(icon.src);
    assert.equal(response.status, 200);
    const png = Buffer.from(await response.arrayBuffer());
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
});
test("Android and iOS encoded shares hand off a complete URL without creating a link", async () => {
  for (const product of ["https://s.shopee.vn/3B7gM2EwwS", "https://vt.tiktok.com/example/?a=1&b=2%2B3"]) {
    const response = await request(`/share-target?text=${encodeURIComponent(`Ưu đãi ${product}`)}`);
    assert.equal(response.status, 303);
    assert.match(response.headers.get("cache-control"), /no-store/);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.pathname, "/start");
    assert.equal(location.searchParams.get("url"), product);
    const loginResponse = await request(`${location.pathname}${location.search}`);
    const login = new URL(loginResponse.headers.get("location"));
    assert.equal(login.pathname, "/login");
    const next = new URL(login.searchParams.get("next"), base);
    assert.equal(next.pathname, "/dashboard");
    assert.equal(next.searchParams.get("url"), product);
    assert.match(next.searchParams.get("intent"), /^[a-f\d-]{36}$/);
  }
});
test("bad input reaches readable setup errors and cannot redirect to another site", async () => {
  const response = await request("/share-target?url=https%3A%2F%2Fshopee.vn.evil.test");
  const location = new URL(response.headers.get("location"));
  assert.equal(location.origin, new URL(base).origin);
  assert.equal(location.pathname, "/cai-dat-ung-dung");
  assert.equal(location.searchParams.get("shareError"), "unsupported");
  const page = await request(`${location.pathname}${location.search}`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Chưa tìm thấy link Shopee/);
});
test("service worker is served as JavaScript without caching", async () => {
  const response = await request("/sw.js");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /javascript/);
  assert.match(response.headers.get("cache-control"), /no-store/);
});
