import type { Metadata } from "next";
import { CuratedNewsPage } from "@/components/sections/CuratedNewsPage";
import {
  countPublishedArticles,
  listArticleCategories,
  listPublishedArticles,
} from "@/lib/articles/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bài viết Win-Win Back | Sản phẩm và hoàn tiền",
  description: "Các bài viết sản phẩm đã xuất bản trên Win-Win Back, kèm thông tin mua sắm và hoàn tiền để tham khảo.",
};

const REMOVED_FEATURED_SLUG = "bo-3-mon-thia-dua-dia-lua-mach-inox-304-co-nen-mua-khong-gia-danh-gia--784661";
const ARTICLES_PER_PAGE = 3;

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

  return (
    <CuratedNewsPage
      featured={!activeCategory && page === 1 ? featuredArticles[0] ?? null : null}
      articles={articles}
      categories={categories}
      activeCategory={activeCategory}
      page={page}
      pageCount={pageCount}
      total={total}
    />
  );
}
