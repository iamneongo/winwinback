import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, FileText, Pencil, RefreshCw, Tag, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getArticleAdminStats, listArticles } from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { platformLabel } from "@/lib/labels";
import {
  toggleArticleAction,
  deleteArticleAction,
  regenerateArticleAction,
} from "./actions";

export const metadata = { title: "Bài viết SEO — Quản trị" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ trang?: string }>;
}) {
  await requireAdmin();
  const { trang } = await searchParams;
  const stats = await getArticleAdminStats();
  const pageCount = Math.max(1, Math.ceil(stats.total / PAGE_SIZE));
  const requestedPage = Number(trang);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, pageCount)
    : 1;
  const rows = await listArticles({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
  const pageHref = (target: number) => target === 1 ? "/admin/bai-viet" : `/admin/bai-viet?trang=${target}`;
  const visiblePages = Array.from(new Set([
    1,
    ...Array.from({ length: Math.min(5, pageCount) }, (_, index) =>
      Math.min(Math.max(page - 2, 1), Math.max(pageCount - 4, 1)) + index,
    ),
    pageCount,
  ])).sort((a, b) => a - b);

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e]">Bài viết SEO</h1>
        <p className="mt-1 text-sm text-[#58749a]">Bài do AI tự tạo khi khách tạo link mua hàng (mỗi sản phẩm 1 bài). Bạn có thể sửa nội dung, ẩn hoặc xoá.</p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#34527d]">
        <FileText className="h-4 w-4 shrink-0 text-[#287be5]" />
        <span>Tổng: <b>{stats.total}</b> bài</span><span aria-hidden="true">·</span>
        <span>Hiển thị: <b>{stats.published}</b></span><span aria-hidden="true">·</span>
        <span>Ẩn: <b>{stats.hidden}</b></span>
      </div>

      <p className="mb-2 text-xs text-[#58749a] sm:hidden">Vuốt ngang để xem đủ cột và vuốt dọc trong bảng để xem các bài viết.</p>
      <section className="min-w-0 overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
        <div role="region" aria-label="Bảng bài viết SEO, cuộn ngang và dọc" tabIndex={0} className="max-h-[65vh] w-full overflow-auto overscroll-contain focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1261ed] lg:max-h-[720px]">
          <table className="w-full min-w-[1190px] table-fixed text-left text-xs text-[#35537c]">
          <colgroup><col className="w-[320px]" /><col className="w-[90px]" /><col className="w-[135px]" /><col className="w-[105px]" /><col className="w-[85px]" /><col className="w-[95px]" /><col className="w-[100px]" /><col className="w-[260px]" /></colgroup>
          <thead className="sticky top-0 z-10 border-b border-[#dfe9f5] bg-[#f8fbff] text-[#234168]"><tr>
            <th scope="col" className="px-4 py-3.5">Tiêu đề</th><th scope="col" className="px-3 py-3.5">Sàn</th><th scope="col" className="px-3 py-3.5">Danh mục</th><th scope="col" className="px-3 py-3.5">Giá</th><th scope="col" className="px-3 py-3.5">Lượt xem</th><th scope="col" className="px-3 py-3.5">Trạng thái</th><th scope="col" className="px-3 py-3.5">Ngày tạo</th><th scope="col" className="px-3 py-3.5 text-center">Thao tác</th>
          </tr></thead>
          <tbody className="divide-y divide-[#e8eef6]">
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-14 text-center text-[#6681a7]">Chưa có bài viết nào. Bài sẽ tự tạo khi khách tạo link mua hàng.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} className="align-top hover:bg-[#fbfdff]">
                <td className="px-4 py-3.5"><Link href={`/bai-viet/${a.slug}`} target="_blank" className="flex min-w-0 items-start gap-1.5 font-semibold text-[#1261ed] hover:underline"><span className="line-clamp-2 min-w-0 break-words">{a.title}</span><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /></Link></td>
                <td className="break-words px-3 py-3.5">{platformLabel[a.platform] ?? a.platform}</td>
                <td className="px-3 py-3.5">{a.category ? <span title={a.category} className="inline-flex w-full min-w-0 items-center gap-1 rounded-md bg-[#f3fbe9] px-2 py-1 font-semibold text-[#4a7d1e]"><Tag className="h-3 w-3 shrink-0" /><span className="truncate">{a.category}</span></span> : "—"}</td>
                <td className="whitespace-nowrap px-3 py-3.5">{a.price ? formatVnd(a.price) : "—"}</td>
                <td className="px-3 py-3.5">{a.views}</td>
                <td className="px-3 py-3.5">{a.status === "published" ? <span className="inline-block whitespace-nowrap rounded-full bg-[#e7f7ef] px-2 py-1 text-[11px] font-bold text-[#168146]">Hiển thị</span> : <span className="inline-block whitespace-nowrap rounded-full bg-[#fee9ee] px-2 py-1 text-[11px] font-bold text-[#d34862]">Đã ẩn</span>}</td>
                <td className="whitespace-nowrap px-3 py-3.5">{a.createdAt.toLocaleDateString("vi-VN")}</td>
                <td className="px-3 py-3.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <Link href={`/admin/bai-viet/${a.id}/sua`} className="inline-flex min-h-9 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#d9e5f4] px-2 font-bold text-[#34527d] hover:bg-[#f6f9fd]">
                      <Pencil className="h-3.5 w-3.5" /> Sửa
                    </Link>
                    <form action={regenerateArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="inline-flex min-h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#cfe0f5] px-2 font-bold text-[#1261ed] hover:bg-[#f4f9ff]">
                        <RefreshCw className="h-3.5 w-3.5" /> Tạo lại
                      </button>
                    </form>
                    <form action={toggleArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value={a.status === "published" ? "hidden" : "published"} />
                      <button type="submit" className="inline-flex min-h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#d9e5f4] px-2 font-bold text-[#34527d] hover:bg-[#f6f9fd]">
                        {a.status === "published" ? <><EyeOff className="h-3.5 w-3.5" /> Ẩn</> : <><Eye className="h-3.5 w-3.5" /> Hiện</>}
                      </button>
                    </form>
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="inline-flex min-h-9 w-full items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-[#f3c6d0] px-2 font-bold text-[#d34862] hover:bg-[#fee9ee]">
                        <Trash2 className="h-3.5 w-3.5" /> Xoá
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </section>
      <div className="mt-4 flex flex-col gap-3 text-sm text-[#58749a] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {stats.total === 0 ? "Chưa có bài viết" : `Hiển thị ${(page - 1) * PAGE_SIZE + 1}–${(page - 1) * PAGE_SIZE + rows.length} / ${stats.total} bài`}
        </p>
        {pageCount > 1 ? (
          <nav aria-label="Phân trang bài viết SEO" className="flex flex-wrap items-center gap-1.5">
            {page > 1 ? <Link href={pageHref(page - 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#dbe6f3] bg-white px-3 font-semibold text-[#34527d] hover:bg-[#f4f8fc]"><ChevronLeft className="size-4" /> Trước</Link> : null}
            {visiblePages.map((number, index) => (
              <span key={number} className="contents">
                {index > 0 && number - visiblePages[index - 1] > 1 ? <span className="px-1" aria-hidden="true">…</span> : null}
                <Link href={pageHref(number)} aria-current={number === page ? "page" : undefined} className={`inline-flex size-10 items-center justify-center rounded-lg font-bold ${number === page ? "bg-[#11335e] text-white" : "border border-[#dbe6f3] bg-white text-[#34527d] hover:bg-[#f4f8fc]"}`}>{number}</Link>
              </span>
            ))}
            {page < pageCount ? <Link href={pageHref(page + 1)} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-[#dbe6f3] bg-white px-3 font-semibold text-[#34527d] hover:bg-[#f4f8fc]">Sau <ChevronRight className="size-4" /></Link> : null}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
