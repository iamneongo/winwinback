import { test } from "node:test";
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { articleSlug, defaultSeo, documentSchema, seoSchema, type ArticleDocument } from "../src/lib/articles/document";
import { adaptArticleForSeo, analyzeSeo } from "../src/lib/articles/seo-engine";
import { publicArticleMetadata, resolvePublicArticleSeo } from "../src/lib/articles/seo-public";

const doc: ArticleDocument = { title: "Cửa composite cho nhà ở hiện đại", slug: "cua-composite", html: '<h2>Chọn cửa composite</h2><p>Cửa composite phù hợp nhiều không gian.</p><p>Kiểm tra vật liệu và kích thước trước khi chọn.</p><img src="/api/article-media/abc" alt="Cửa composite màu nâu"><a href="/bai-viet">Bài viết liên quan</a>', intro: "Tìm hiểu cách chọn cửa composite cho nhà ở.", metaDescription: "", category: "Khác", imageUrl: "", seo: { ...defaultSeo(), keyword: "Cửa composite" } };

test("score is deterministic and bounded; N/A weight does not penalize", () => {
  const first = analyzeSeo(doc);
  assert.deepEqual(first, analyzeSeo(doc));
  assert.ok(first.score >= 0 && first.score <= 100);
  assert.equal(analyzeSeo({ ...doc, html: "<p>Không có ảnh.</p>" }).issues.find((issue) => issue.id === "image_alt")?.status, "not_applicable");
  const applicable = first.issues.filter((issue) => issue.status !== "not_applicable");
  assert.equal(first.score, Math.round(applicable.reduce((n, issue) => n + issue.earnedPoints, 0) / applicable.reduce((n, issue) => n + issue.maxPoints, 0) * 100));
  assert.equal(first.issues.length, 13);
  assert.equal(first.issues.reduce((sum, issue) => sum + issue.maxPoints, 0), 100);
});

test("adapter reads Unicode Vietnamese, headings, images, links and malformed HTML", () => {
  const parsed = adaptArticleForSeo({ ...doc, html: '<h2>Điện thoại 📱</h2><p>Cửa composite <strong>đẹp</strong><img src="/x" alt="Mẫu cửa"><a href="https://winwinback.com/bai-viet/x">Đọc tiếp</a>' });
  assert.equal(parsed.headings[0].text, "Điện thoại 📱");
  assert.equal(parsed.images[0].alt, "Mẫu cửa");
  assert.equal(parsed.links[0].internal, true);
  assert.match(parsed.plainText, /Cửa composite đẹp/);
  assert.equal(analyzeSeo({ ...doc, html: '<p>Cửa composite đẹp.</p><a href="https://winwinback.com/bai-viet/huong-dan">Đọc hướng dẫn</a>' }).issues.find((issue) => issue.id === "internal_links")?.status, "passed");
  assert.equal(analyzeSeo({ ...doc, html: "" }).issues.find((issue) => issue.id === "content_completeness")?.status, "failed");
});

test("legacy secondary keywords normalize, deduplicate and URL validation blocks unsafe values", () => {
  const settings = seoSchema.parse({ secondaryKeywords: "điện thoại, Điện Thoại, cửa composite, " });
  assert.deepEqual(settings.secondaryKeywords, ["điện thoại", "cửa composite"]);
  assert.equal(documentSchema.safeParse({ ...doc, seo: { ...doc.seo, canonical: "javascript:alert(1)" } }).success, false);
  assert.equal(documentSchema.safeParse({ ...doc, seo: { ...doc.seo, canonical: "https://user:pass@example.com/" } }).success, false);
  assert.equal(articleSlug("ĐIỆN THOẠI 😀  Cửa composite"), "dien-thoai-cua-composite");
});

test("metadata fallbacks, robots and sitemap eligibility share one resolver", () => {
  const base = { title: doc.title, slug: doc.slug, intro: doc.intro, metaDescription: null, imageUrl: null, seo: null, status: "published" } as Parameters<typeof resolvePublicArticleSeo>[0];
  const fallback = resolvePublicArticleSeo(base, "https://winwinback.com");
  assert.equal(fallback.title, doc.title);
  assert.equal(resolvePublicArticleSeo({ ...base, seo: { ...defaultSeo(), title: "Mẹo mua sắm | Win-Win Back" } }, "https://winwinback.com").title, "Mẹo mua sắm | Win-Win Back");
  const metadata = publicArticleMetadata({ ...base, seo: { ...defaultSeo(), title: "Mẹo mua sắm | Win-Win Back" } }, "https://winwinback.com");
  assert.equal(metadata.title, "Mẹo mua sắm | Win-Win Back");
  assert.equal(metadata.openGraph?.title, "Mẹo mua sắm | Win-Win Back");
  assert.equal(fallback.description, doc.intro);
  assert.equal(fallback.inSitemap, true);
  assert.equal(resolvePublicArticleSeo({ ...base, status: "hidden" }, "https://winwinback.com").inSitemap, false);
  const noindex = resolvePublicArticleSeo({ ...base, seo: { ...defaultSeo(), noindex: true, follow: false } }, "https://winwinback.com");
  assert.equal(noindex.index, false);
  assert.equal(noindex.follow, false);
  assert.equal(noindex.inSitemap, false);
  assert.equal(resolvePublicArticleSeo({ ...base, seo: { ...defaultSeo(), canonical: "https://example.com/elsewhere" } }, "https://winwinback.com").inSitemap, false);
  assert.equal(resolvePublicArticleSeo(base, "https://winwinback.com", "http://external.example/image.jpg").image, null);
});

test("5,000-word analysis benchmark stays responsive", () => {
  const longDoc = { ...doc, html: `<h2>Hướng dẫn</h2>${"<p>Cửa composite phù hợp với nhiều kiểu nhà ở hiện đại.</p>".repeat(625)}` };
  const durations = Array.from({ length: 20 }, () => {
    const start = performance.now();
    analyzeSeo(longDoc);
    return performance.now() - start;
  }).sort((a, b) => a - b);
  const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
  assert.ok(p95 < 100, `p95 ${p95.toFixed(1)}ms exceeded 100ms`);
});
