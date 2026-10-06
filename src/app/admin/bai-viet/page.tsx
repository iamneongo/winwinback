import { FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getArticleAdminStats, listAdminArticles } from "@/lib/articles/service";
import { ArticlesTable } from "./ArticlesTable";

export const metadata = { title: "Bài viết SEO — Quản trị" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const requestedPage = Number(one("trang"));
  const rawPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const status = one("status") === "published" || one("status") === "hidden" ? one("status") as "published" | "hidden" : undefined;
  const platform = one("platform") === "shopee" || one("platform") === "tiktok" ? one("platform") as "shopee" | "tiktok" : undefined;
  const sort = ["title", "price", "views", "createdAt"].includes(one("sort")) ? one("sort") as "title" | "price" | "views" | "createdAt" : "createdAt";
  const dir = one("dir") === "asc" ? "asc" : "desc";
  const stats = await getArticleAdminStats();
  const query = { q: one("q"), status, platform, sort, dir, limit: PAGE_SIZE } as const;
  let result = await listAdminArticles({ ...query, offset: (rawPage - 1) * PAGE_SIZE });
  const page = Math.min(rawPage, Math.max(1, Math.ceil(result.total / PAGE_SIZE)));
  if (page !== rawPage) result = await listAdminArticles({ ...query, offset: (page - 1) * PAGE_SIZE });

  return <main className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
    <header className="mb-6">
      <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e]">Bài viết SEO</h1>
      <p className="mt-1 text-sm text-[#58749a]">Bài do AI tự tạo khi khách tạo link mua hàng. Bạn có thể sửa nội dung, ẩn hoặc xóa.</p>
    </header>
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#34527d]">
      <FileText className="size-4 shrink-0 text-[#287be5]" />
      <span>Tổng: <b>{stats.total}</b> bài</span><span aria-hidden="true">·</span>
      <span>Hiển thị: <b>{stats.published}</b></span><span aria-hidden="true">·</span>
      <span>Ẩn: <b>{stats.hidden}</b></span>
    </div>
    <p className="mb-2 text-xs text-[#58749a] sm:hidden">Vuốt ngang để xem đủ cột trong bảng.</p>
    <ArticlesTable rows={result.rows.map((article) => ({ id: article.id, slug: article.slug, title: article.title, platform: article.platform, category: article.category, price: article.price, views: article.views, status: article.status, createdAt: article.createdAt.toISOString() }))} total={result.total} page={page} />
  </main>;
}
