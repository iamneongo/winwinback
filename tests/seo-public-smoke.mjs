import assert from "node:assert/strict";
import { DomUtils, parseDocument } from "htmlparser2";

const origin = (process.env.SEO_SMOKE_ORIGIN || "https://winwinback.com").replace(/\/$/, "");

async function get(path) {
  const response = await fetch(new URL(path, origin), { redirect: "manual", signal: AbortSignal.timeout(15000) });
  return { response, body: await response.text() };
}

const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.response.status, 200, "sitemap must be public");
const articleUrl = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].replaceAll("&amp;", "&"))
  .find((url) => url.startsWith(`${origin}/bai-viet/`));
assert.ok(articleUrl, "sitemap must contain a published article");

const robots = await get("/robots.txt");
assert.equal(robots.response.status, 200, "robots.txt must be public");
assert.match(robots.body, /Sitemap:/i);

const article = await get(articleUrl);
assert.equal(article.response.status, 200, "sitemap article must resolve");
const nodes = parseDocument(article.body).children;
const tags = DomUtils.findAll((node) => Boolean(node.name), nodes);
const findTag = (name, attribute, value) => tags.find((node) => node.name === name && node.attribs?.[attribute] === value);
const title = tags.find((node) => node.name === "title");
const description = findTag("meta", "name", "description");
const canonical = findTag("link", "rel", "canonical");
const ogTitle = findTag("meta", "property", "og:title");
const robotsMeta = findTag("meta", "name", "robots");
assert.ok(title && DomUtils.getText(title).trim(), "title must be populated");
assert.ok(description?.attribs.content?.trim(), "meta description must be populated");
assert.equal(canonical?.attribs.href, articleUrl, "canonical must match the indexable article URL");
assert.ok(ogTitle?.attribs.content?.trim(), "Open Graph title must be populated");
assert.doesNotMatch(robotsMeta?.attribs.content || "", /noindex/i, "sitemap article must be indexable");
const schemas = tags.filter((node) => node.name === "script" && node.attribs?.type === "application/ld+json")
  .flatMap((node) => {
    const parsed = JSON.parse(DomUtils.getText(node));
    return [parsed, ...(Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [])];
  });
assert.ok(schemas.some((schema) => schema["@type"] === "Article"), "article schema must be present");
assert.ok(schemas.some((schema) => schema["@type"] === "BreadcrumbList"), "breadcrumb schema must be present");

if (process.env.SEO_SMOKE_OLD_SLUG) {
  const old = await get(`/bai-viet/${encodeURIComponent(process.env.SEO_SMOKE_OLD_SLUG)}`);
  assert.ok([301, 308].includes(old.response.status), "old slug must permanently redirect");
  assert.equal(new URL(old.response.headers.get("location"), origin).origin, origin, "redirect must remain on this site");
}

console.log(`SEO public smoke passed: ${articleUrl}`);
