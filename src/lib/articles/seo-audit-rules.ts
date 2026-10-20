import type { Article, SeoAuditFinding } from "@/db/schema";
import { adaptArticleForSeo } from "./seo-engine";
import { seoSchema } from "./document";

export function auditArticleSeo(article: Pick<Article, "slug" | "title" | "metaDescription" | "intro" | "imageUrl" | "seo" | "status">, html: string, validArticleSlugs: Set<string>, duplicateCanonicals: Set<string>): SeoAuditFinding[] {
  if (article.status !== "published") return [];
  const seo = seoSchema.parse(article.seo ?? {});
  const document = { title: article.title, slug: article.slug, html, intro: article.intro || "", metaDescription: article.metaDescription || "", category: "", imageUrl: article.imageUrl || "", seo };
  const content = adaptArticleForSeo(document, "published");
  const findings: SeoAuditFinding[] = [];
  if (!seo.title.trim()) findings.push({ code: "missing_seo_title", message: "Chưa đặt tiêu đề SEO riêng; hiện dùng tiêu đề bài viết." });
  if (!document.metaDescription.trim()) findings.push({ code: "missing_meta_description", message: "Chưa có meta description; công khai đang dùng đoạn giới thiệu hoặc fallback." });
  for (const image of content.images) if (!image.alt) findings.push({ code: "missing_image_alt", message: "Ảnh trong bài chưa có mô tả alt.", href: image.src.slice(0, 500) });
  for (const link of content.links) {
    let path = link.href;
    try {
      const url = new URL(link.href, "https://winwinback.com");
      if (url.hostname !== "winwinback.com") continue;
      path = url.pathname;
    } catch { continue; }
    const slug = /^\/bai-viet\/([^/]+)\/?$/.exec(path)?.[1];
    if (slug) {
      let decoded = slug;
      try { decoded = decodeURIComponent(slug); } catch { /* Malformed URLs are invalid. */ }
      if (!validArticleSlugs.has(decoded)) findings.push({ code: "broken_article_link", message: "Liên kết bài viết nội bộ không trỏ tới bài đã xuất bản.", href: link.href.slice(0, 500) });
    }
  }
  const canonical = seo.canonical.trim();
  if (canonical && duplicateCanonicals.has(canonical)) findings.push({ code: "duplicate_canonical", message: "Canonical trùng với bài viết khác.", href: canonical });
  return findings;
}
