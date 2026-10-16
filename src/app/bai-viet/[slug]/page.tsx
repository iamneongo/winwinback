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
import { normalizeArticleCategory } from "@/lib/articles/categories";

export const dynamic = "force-dynamic";

const REMOVED_FEATURED_SLUG = "bo-3-mon-thia-dua-dia-lua-mach-inox-304-co-nen-mua-khong-gia-danh-gia--784661";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await peekPublishedArticle(slug);
  if (!article) return { title: "Không tìm thấy bài viết — Win-Win Back" };
  const description = article.metaDescription ?? article.intro ?? `${article.productName} — thông tin sản phẩm và cách mua được hoàn tiền qua Win-Win Back.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com";
  const canonical = new URL(`/bai-viet/${encodeURIComponent(article.slug)}`, siteUrl).toString();
  const cover = articleCoverUrl(article);
  const image = cover ? new URL(cover, siteUrl).toString() : undefined;
  return {
    title: `${article.title} | Win-Win Back`,
    description,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description,
      url: canonical,
      images: image ? [{ url: image, alt: article.title }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
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
  const buyHref = sharedLink?.shortCode
    ? `/go/${sharedLink.shortCode}`
    : article.affiliateShortCode ? `/go/${article.affiliateShortCode}` : article.productUrl;

  return (
    <RealArticleDetail
      article={article}
      related={related}
      buyHref={buyHref}
      platform={platformLabel[article.platform] ?? article.platform}
      category={normalizeArticleCategory(article.category)}
      contentHtml={articleContentHtml(article)}
    />
  );
}
