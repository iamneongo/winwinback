import type { ArticleDocument } from "./document";
const placeholders = new Set(["title", "category", "keyword"]);
export function renderSeoPattern(pattern: string, doc: ArticleDocument) {
  return pattern.replace(/\{([^{}]+)\}/g, (match, field: string) => placeholders.has(field) ? ({ title: doc.title, category: doc.category, keyword: doc.seo.keyword }[field] || "") : match).replace(/\s+/g, " ").trim();
}
