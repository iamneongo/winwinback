import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedArticleMediaOrigin } from "../src/lib/articles/media-origin";

const publicUrl = "https://winwinback.com";
const internalUrl = "http://app-input-online-microchip-iklrp5:3000/api/article-media";

test("accepts the configured public origin behind the Dokploy proxy", () => {
  assert.equal(isAllowedArticleMediaOrigin(publicUrl, publicUrl, internalUrl, true), true);
  assert.equal(isAllowedArticleMediaOrigin(publicUrl, `${publicUrl}/`, internalUrl, true), true);
});

test("rejects missing and unrelated origins, even when the request URL matches them", () => {
  assert.equal(isAllowedArticleMediaOrigin(null, publicUrl, internalUrl, true), false);
  assert.equal(isAllowedArticleMediaOrigin("null", publicUrl, internalUrl, true), false);
  assert.equal(isAllowedArticleMediaOrigin("https://attacker.example", publicUrl, "https://attacker.example/api/article-media", true), false);
  assert.equal(isAllowedArticleMediaOrigin("http://winwinback.com", publicUrl, internalUrl, true), false);
  assert.equal(isAllowedArticleMediaOrigin("https://www.winwinback.com", publicUrl, internalUrl, true), false);
});

test("local development may use the request origin when no public URL is configured", () => {
  const localUrl = "http://localhost:3000/api/article-media";
  assert.equal(isAllowedArticleMediaOrigin("http://localhost:3000", undefined, localUrl, false), true);
  assert.equal(isAllowedArticleMediaOrigin("http://localhost:4000", undefined, localUrl, false), false);
  assert.equal(isAllowedArticleMediaOrigin("http://localhost:3000", undefined, localUrl, true), false);
});
