import type { Article } from "@/db/schema";
import { seoSchema } from "./document";

type PublicSeoArticle = Pick<Article, "title" | "slug" | "intro" | "metaDescription" | "imageUrl" | "seo" | "status">;

/** Resolve all public SEO fallbacks in one place for metadata, schema and sitemap. */
export function resolvePublicArticleSeo(article: PublicSeoArticle, siteUrl: string, coverImage?: string | null) {
  const seo = seoSchema.parse(article.seo ?? {});
  const origin = siteUrl.replace(/\/$/, "");
  const articleUrl = new URL(`/bai-viet/${encodeURIComponent(article.slug)}`, origin).toString();
  const canonical = seo.canonical || articleUrl;
  const title = seo.title.trim() || article.title;
  const description = article.metaDescription?.trim() || article.intro?.trim() || `${article.title} — bài viết từ Win-Win Back.`;
  const imageSource = seo.socialImage || coverImage || null;
  let image: string | null = null;
  if (imageSource) {
    try {
      const resolved = new URL(imageSource, origin);
      if (resolved.protocol === "https:" || (resolved.protocol === "http:" && resolved.origin === new URL(origin).origin)) image = resolved.toString();
    } catch { /* Preserve old articles with an invalid legacy cover path. */ }
  }
  return {
    seo,
    articleUrl,
    canonical,
    title,
    description,
    socialTitle: seo.socialTitle.trim() || title,
    socialDescription: seo.socialDescription.trim() || description,
    image,
    index: article.status === "published" && !seo.noindex,
    follow: seo.follow,
    inSitemap: article.status === "published" && !seo.noindex && canonical === articleUrl,
  };
}
