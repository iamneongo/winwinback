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
import { resolvePublicArticleSeo } from "@/lib/articles/seo-public";

export const dynamic = "force-dynamic";

const REMOVED_FEATURED_SLUG = "bo-3-mon-thia-dua-dia-lua-mach-inox-304-co-nen-mua-khong-gia-danh-gia--784661";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await peekPublishedArticle(slug);
  if (!article) return { title: "Không tìm thấy bài viết — Win-Win Back", robots: { index: false, follow: false } };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com";
  const cover = articleCoverUrl(article);
  const seo = resolvePublicArticleSeo(article, siteUrl, cover);
  return {
    title: `${seo.title} | Win-Win Back`,
    robots: { index: seo.index, follow: seo.follow },
    description: seo.description,
    alternates: { canonical: seo.canonical },
    openGraph: {
      title: seo.socialTitle,
      description: seo.socialDescription,
      url: seo.canonical,
      images: seo.image ? [{ url: seo.image, alt: article.title }] : undefined,
      type: seo.seo.schemaType === "Article" ? "article" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.socialTitle,
      description: seo.socialDescription,
      images: seo.image ? [seo.image] : undefined,
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
  const cover = articleCoverUrl(article);
  const seo = resolvePublicArticleSeo(article, siteUrl, cover);
  const structured = { "@context": "https://schema.org", "@graph": [
    seo.seo.schemaType === "Article" ? { "@type": "Article", headline: article.title, description: seo.description, datePublished: article.createdAt.toISOString(), dateModified: (article.updatedAt || article.createdAt).toISOString(), mainEntityOfPage: seo.canonical, author: { "@type": "Organization", name: "Win-Win Back", url: siteUrl }, publisher: { "@type": "Organization", name: "Win-Win Back", url: siteUrl }, ...(seo.image ? { image: seo.image } : {}) } : { "@type": "WebPage", name: seo.title, description: seo.description, url: seo.canonical },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Tin tức", item: `${siteUrl}/bai-viet` }, { "@type": "ListItem", position: 3, name: article.title, item: seo.articleUrl }] },
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
