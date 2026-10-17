import Link from "next/link";
import { FileText, FolderOpen, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getArticleAdminStats, listAdminArticles } from "@/lib/articles/service";
import { ArticlesTable } from "./ArticlesTable";
import { listManagedCategories } from "@/lib/articles/category-service";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";

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
  const category = one("category") || undefined;
  const sort = ["title", "price", "views", "createdAt"].includes(one("sort")) ? one("sort") as "title" | "price" | "views" | "createdAt" : "createdAt";
  const dir = one("dir") === "asc" ? "asc" : "desc";
  const [stats, categories] = await Promise.all([getArticleAdminStats(), listManagedCategories()]);
  const query = { q: one("q"), status, platform, category, sort, dir, limit: PAGE_SIZE } as const;
  let result = await listAdminArticles({ ...query, offset: (rawPage - 1) * PAGE_SIZE });
  const page = Math.min(rawPage, Math.max(1, Math.ceil(result.total / PAGE_SIZE)));
  if (page !== rawPage) result = await listAdminArticles({ ...query, offset: (page - 1) * PAGE_SIZE });

  return <AdminPageContainer className="py-6 lg:py-7">
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
      <h1 className="text-xl font-black leading-tight tracking-tight text-[#11335e] lg:hidden">Bài viết SEO</h1>
      <p className="mt-1 text-sm text-[#58749a]">Viết bài mới hoặc quản lý các bài được tạo từ link sản phẩm.</p>
      </div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/bai-viet/danh-muc" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cddced] bg-white px-3 text-sm font-bold text-[#234568] hover:bg-[#f4f8fc]"><FolderOpen className="size-4" /> Danh mục</Link><Link href="/admin/bai-viet/tao-moi" className="ww-btn-cta inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold text-[#173b5e]"><Plus className="size-4" /> Viết bài mới</Link></div>
    </header>
    <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#34527d]">
      <FileText className="size-4 shrink-0 text-[#287be5]" />
      <span>Tổng: <b>{stats.total}</b> bài</span><span aria-hidden="true">·</span>
      <span>Hiển thị: <b>{stats.published}</b></span><span aria-hidden="true">·</span>
      <span>Ẩn: <b>{stats.hidden}</b></span>
    </div>
    <p className="mb-2 text-xs text-[#58749a] sm:hidden">Vuốt ngang để xem đủ cột trong bảng.</p>
    <ArticlesTable rows={result.rows.map((article) => ({ id: article.id, slug: article.slug, title: article.title, platform: article.platform, manual: article.productId.startsWith("manual:"), category: article.category, price: article.price, views: article.views, status: article.status, createdAt: article.createdAt.toISOString() }))} categories={categories.map((item) => item.name)} total={result.total} page={page} />
  </AdminPageContainer>;
}
