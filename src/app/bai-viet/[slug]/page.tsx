import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { RealArticleDetail } from "@/components/sections/RealArticleDetail";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import {
  getPublishedArticleBySlug,
  peekPublishedArticle,
  articleContentHtml,
  listRelatedArticles,
  articleCoverUrl,
} from "@/lib/articles/service";
import { platformLabel } from "@/lib/labels";
import { UNCATEGORIZED } from "@/lib/articles/categories";
import { getOutro } from "@/lib/articles/studio";

export const dynamic = "force-dynamic";

const REMOVED_FEATURED_SLUG = "bo-3-mon-thia-dua-dia-lua-mach-inox-304-co-nen-mua-khong-gia-danh-gia--784661";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await peekPublishedArticle(slug);
  if (!article) return { title: "Không tìm thấy bài viết — Win-Win Back" };
  const description = article.metaDescription ?? article.intro ?? `${article.title} — bài viết từ Win-Win Back.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com";
  const canonical = article.seo?.canonical || new URL(`/bai-viet/${encodeURIComponent(article.slug)}`, siteUrl).toString();
  const cover = articleCoverUrl(article);
  const image = article.seo?.socialImage ? new URL(article.seo.socialImage, siteUrl).toString() : cover ? new URL(cover, siteUrl).toString() : undefined;
  return {
    title: `${article.seo?.title || article.title} | Win-Win Back`,
    robots: { index: !article.seo?.noindex, follow: true },
    description,
    alternates: { canonical },
    openGraph: {
      title: article.seo?.socialTitle || article.seo?.title || article.title,
      description: article.seo?.socialDescription || description,
      url: canonical,
      images: image ? [{ url: image, alt: article.title }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo?.socialTitle || article.seo?.title || article.title,
      description: article.seo?.socialDescription || description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const [relatedCandidates, { ref }] = await Promise.all([listRelatedArticles(article, 4), searchParams]);
  const related = relatedCandidates.filter((item) => item.slug !== REMOVED_FEATURED_SLUG).slice(0, 2);
  const [sharedLink] = ref && /^[a-zA-Z0-9]{4,32}$/.test(ref)
    ? await db.select({ shortCode: affiliateLinks.shortCode }).from(affiliateLinks).where(and(
        eq(affiliateLinks.shortCode, ref),
        eq(affiliateLinks.platform, article.platform),
        eq(affiliateLinks.productId, article.productId),
      )).limit(1)
    : [];
  const buyHref = article.productId.startsWith("manual:") ? null : sharedLink?.shortCode
    ? `/go/${sharedLink.shortCode}`
    : article.affiliateShortCode ? `/go/${article.affiliateShortCode}` : article.productUrl;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com";
  const url = new URL(`/bai-viet/${article.slug}`, siteUrl).toString();
  const cover = articleCoverUrl(article);
  const structured = { "@context": "https://schema.org", "@graph": [
    { "@type": "Article", headline: article.title, description: article.metaDescription || article.intro, datePublished: article.createdAt.toISOString(), dateModified: (article.updatedAt || article.createdAt).toISOString(), mainEntityOfPage: article.seo?.canonical || url, author: { "@type": "Organization", name: "Win-Win Back", url: siteUrl }, publisher: { "@type": "Organization", name: "Win-Win Back", url: siteUrl }, ...(cover ? { image: new URL(cover, siteUrl).toString() } : {}) },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Tin tức", item: `${siteUrl}/bai-viet` }, { "@type": "ListItem", position: 3, name: article.title, item: url }] },
  ] };
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <RealArticleDetail
      article={article}
      outro={await getOutro(article.seo?.outro)}
      related={related}
      buyHref={buyHref}
      platform={article.productId.startsWith("manual:") ? "Bài viết" : platformLabel[article.platform] ?? article.platform}
      category={article.category ?? UNCATEGORIZED}
      contentHtml={articleContentHtml(article)}
    /></>
  );
}
