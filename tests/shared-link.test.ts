import assert from "node:assert/strict";
import { test } from "node:test";
import { extractSharedLink } from "../src/lib/shared-link";

test("accepts a Shopee short link in Android promotional text", () => {
  assert.deepEqual(extractSharedLink(["", "Mua ngay, giảm 20% 👉 https://s.shopee.vn/3B7gM2EwwS nhé!", ""]), { url: "https://s.shopee.vn/3B7gM2EwwS" });
});
test("accepts TikTok links and preserves query parameters", () => {
  const url = "https://vt.tiktok.com/ZS9BkhRn3TUVX-eSEkj/?a=1&b=2%2B3";
  assert.deepEqual(extractSharedLink([url, "", ""]), { url });
});
test("receives the full URL-encoded iPhone Shortcut payload", () => {
  const text = "Ưu đãi https://shopee.vn/product/123/456?x=1&y=2#detail";
  const params = new URLSearchParams(`text=${encodeURIComponent(text)}`);
  assert.deepEqual(extractSharedLink([params.get("text")!]), { url: "https://shopee.vn/product/123/456?x=1&y=2#detail" });
});
test("handles title fallback, punctuation and duplicate fields", () => {
  const url = "https://vn.shp.ee/abc123";
  assert.deepEqual(extractSharedLink([url, "", `Ưu đãi (${url}).`]), { url });
});
test("does not guess which of several products the customer wants", () => {
  assert.deepEqual(extractSharedLink(["https://s.shopee.vn/one https://vt.tiktok.com/two"]), { error: "multiple" });
});
test("rejects invalid, unsafe, lookalike and unsupported destinations", () => {
  for (const text of ["https://shopee.vn.evil.test/one", "https://shopee.vn@evil.test/one", "https://user:pass@shopee.vn/one", "https://shopee.vn:8443/one", "javascript:alert(1)", "file:///etc/passwd", "https://example.com", "https://"] ) {
    assert.deepEqual(extractSharedLink([text]), { error: "unsupported" }, text);
  }
});
test("ignores an unrelated URL when there is exactly one marketplace link", () => {
  assert.deepEqual(extractSharedLink(["https://example.com https://s.shopee.vn/abc"]), { url: "https://s.shopee.vn/abc" });
});
test("handles missing and oversized content", () => {
  assert.deepEqual(extractSharedLink(["", " \n"]), { error: "missing" });
  assert.deepEqual(extractSharedLink(["x".repeat(8001)]), { error: "too-long" });
});
