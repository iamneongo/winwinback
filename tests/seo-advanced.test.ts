import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultSeo, type ArticleDocument } from "../src/lib/articles/document";
import { auditArticleSeo } from "../src/lib/articles/seo-audit-rules";
import { renderSeoPattern } from "../src/lib/articles/seo-template-pattern";
import { linkedArticleSlugs, linkSuggestionTerms } from "../src/lib/articles/seo-link-suggestions";

const doc: ArticleDocument = { title: "Mẹo mua sắm", slug: "meo-mua-sam", html: "", intro: "", metaDescription: "", category: "Mua sắm", imageUrl: "", seo: { ...defaultSeo(), keyword: "hoàn tiền" } };
test("SEO template substitutes only supported editorial fields", () => {
  assert.equal(renderSeoPattern("{title} · {category} · {keyword}", doc), "Mẹo mua sắm · Mua sắm · hoàn tiền");
  assert.equal(renderSeoPattern("{unknown} {title}", doc), "{unknown} Mẹo mua sắm");
});
test("audit finds missing metadata, image alt, broken internal article and duplicate canonical", () => {
  const article = { title: doc.title, slug: doc.slug, intro: "", metaDescription: "", imageUrl: null, seo: { ...doc.seo, canonical: "https://winwinback.com/shared" }, status: "published" };
  const findings = auditArticleSeo(article, '<img src="/x"><a href="/bai-viet/missing">Lost</a><a href="https://example.com/bai-viet/missing">External</a>', new Set(["meo-mua-sam"]), new Set([article.seo.canonical]));
  assert.deepEqual(findings.map((item) => item.code), ["missing_seo_title", "missing_meta_description", "missing_image_alt", "broken_article_link", "duplicate_canonical"]);
  assert.deepEqual(auditArticleSeo({ ...article, status: "hidden" }, "", new Set(), new Set()), []);
});
test("internal link suggestions use Vietnamese terms and skip links already in the draft", () => {
  assert.deepEqual(linkSuggestionTerms("  Điện thoại điện thoại & hoàn tiền! ", "Khác"), ["điện", "thoại", "hoàn", "tiền"]);
  assert.deepEqual(linkSuggestionTerms("", "Mẹo mua sắm cho bạn"), ["mẹo", "mua", "sắm"]);
  assert.deepEqual(linkedArticleSlugs({ ...doc, html: '<a href="/bai-viet/meo-mua-sam">Một</a><a href="https://winwinback.com/bai-viet/meo-mua-sam?ref=1">Hai</a><a href="https://example.com/bai-viet/ngoai">Ngoài</a>' }), ["meo-mua-sam"]);
});
