import type { Metadata } from "next";
import { CuratedNewsPage } from "@/components/sections/CuratedNewsPage";
import {
  countPublishedArticles,
  listArticleCategories,
  listPublishedArticles,
} from "@/lib/articles/service";

export const dynamic = "force-dynamic";

const REMOVED_FEATURED_SLUG = "bo-3-mon-thia-dua-dia-lua-mach-inox-304-co-nen-mua-khong-gia-danh-gia--784661";
const ARTICLES_PER_PAGE = 3;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com").replace(/\/$/, "");
function archiveUrl(category: string | null, page: number) {
  const url = new URL("/bai-viet", siteUrl);
  if (category) url.searchParams.set("danh-muc", category);
  if (page > 1) url.searchParams.set("trang", String(page));
  return url.toString();
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ "danh-muc"?: string | string[]; trang?: string | string[] }> }): Promise<Metadata> {
  const params = await searchParams;
  const categories = await listArticleCategories(REMOVED_FEATURED_SLUG);
  const category = typeof params["danh-muc"] === "string" ? categories.find((c) => c.name === params["danh-muc"])?.name || null : null;
  const requested = typeof params.trang === "string" ? Number(params.trang) : 1;
  const total = await countPublishedArticles({ category: category || undefined, excludeSlug: REMOVED_FEATURED_SLUG });
  const pageCount = Math.max(1, Math.ceil((total - (!category && total ? 1 : 0)) / ARTICLES_PER_PAGE));
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pageCount) : 1;
  const title = category ? `${category} — Bài viết Win-Win Back` : "Bài viết Win-Win Back | Sản phẩm và hoàn tiền";
  const description = category ? `Các bài viết đã xuất bản trong danh mục ${category} trên Win-Win Back.` : "Các bài viết sản phẩm đã xuất bản trên Win-Win Back, kèm thông tin mua sắm và hoàn tiền để tham khảo.";
  return { title, description, alternates: { canonical: archiveUrl(category, page) }, openGraph: { title, description, url: archiveUrl(category, page), type: "website" } };
}

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ "danh-muc"?: string | string[]; trang?: string | string[] }>;
}) {
  const { "danh-muc": rawCategory, trang: rawPage } = await searchParams;
  const [categories, featuredArticles] = await Promise.all([
    listArticleCategories(REMOVED_FEATURED_SLUG),
    listPublishedArticles({ limit: 1, excludeSlug: REMOVED_FEATURED_SLUG }),
  ]);
  const activeCategory = typeof rawCategory === "string"
    ? categories.find((category) => category.name === rawCategory.trim())?.name ?? null
    : null;
  const total = await countPublishedArticles({
    category: activeCategory ?? undefined,
    excludeSlug: REMOVED_FEATURED_SLUG,
  });
  const hasFeatured = !activeCategory && total > 0;
  const gridTotal = total - (hasFeatured ? 1 : 0);
  const pageCount = Math.max(1, Math.ceil(gridTotal / ARTICLES_PER_PAGE));
  const requestedPage = typeof rawPage === "string" ? Number(rawPage) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, pageCount)
    : 1;
  const articles = await listPublishedArticles({
    category: activeCategory ?? undefined,
    excludeSlug: REMOVED_FEATURED_SLUG,
    limit: ARTICLES_PER_PAGE,
    offset: (page - 1) * ARTICLES_PER_PAGE + (hasFeatured ? 1 : 0),
  });

  const pageArticles = [...(!activeCategory && page === 1 && featuredArticles[0] ? [featuredArticles[0]] : []), ...articles];
  const canonical = archiveUrl(activeCategory, page);
  const structured = { "@context": "https://schema.org", "@graph": [
    { "@type": "CollectionPage", name: activeCategory ? `${activeCategory} — Bài viết Win-Win Back` : "Bài viết Win-Win Back", url: canonical, mainEntity: { "@type": "ItemList", itemListElement: pageArticles.map((article, index) => ({ "@type": "ListItem", position: (page - 1) * ARTICLES_PER_PAGE + index + 1, name: article.title, url: `${siteUrl}/bai-viet/${article.slug}` })) } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Bài viết", item: `${siteUrl}/bai-viet` }] },
  ] };
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <CuratedNewsPage
      featured={!activeCategory && page === 1 ? featuredArticles[0] ?? null : null}
      articles={articles}
      categories={categories}
      activeCategory={activeCategory}
      page={page}
      pageCount={pageCount}
      total={total}
    />
  </>);
}
