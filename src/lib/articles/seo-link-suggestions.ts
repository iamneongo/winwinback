import type { ArticleDocument } from "./document";
import { adaptArticleForSeo } from "./seo-engine";

const ignoredWords = new Set(["cho", "cua", "của", "và", "voi", "với", "trong", "những", "các", "một", "được", "nào", "khi", "tại", "theo", "bạn", "này", "để", "là"]);

export function linkSuggestionTerms(focusKeyword: string, title: string): string[] {
  const source = focusKeyword.trim() || title.trim();
  return [...new Set((source.normalize("NFC").toLocaleLowerCase("vi").match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((word) => word.length >= 3 && !ignoredWords.has(word)))].slice(0, 6);
}

export function linkedArticleSlugs(doc: ArticleDocument): string[] {
  const links = adaptArticleForSeo(doc).links;
  const slugs = links.flatMap(({ href }) => {
    try {
      const url = new URL(href, "https://winwinback.com");
      if (url.hostname !== "winwinback.com") return [];
      const match = url.pathname.match(/^\/bai-viet\/([^/]+)\/?$/);
      return match ? [decodeURIComponent(match[1])] : [];
    } catch {
      return [];
    }
  });
  return [...new Set(slugs)];
}
