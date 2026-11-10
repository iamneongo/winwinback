import Link from "next/link";
import { desc, eq, and, like, count } from "drizzle-orm";
import { FilePlus2 } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { DashboardPageHeader } from "@/components/dashboard/ui";

export const metadata = { title: "Bài viết cộng tác viên — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function ContributorArticlesPage({ searchParams }: { searchParams: Promise<{ trang?: string }> }) {
  const user = await requireContributor();
  const filter = and(eq(articles.userId, user.id), like(articles.productId, "manual:%"));
  const [{ total }] = await db.select({ total: count() }).from(articles).where(filter);
  const requested = Number((await searchParams).trang);
  const page = Math.min(Number.isSafeInteger(requested) && requested > 0 ? requested : 1, Math.max(1, Math.ceil(total / 20)));
  const rows = await db.select({ id: articles.id, title: articles.title, status: articles.status, editorialStatus: articles.editorialStatus, updatedAt: articles.updatedAt, createdAt: articles.createdAt }).from(articles)
    .where(filter).orderBy(desc(articles.createdAt)).limit(20).offset((page - 1) * 20);
  return <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-7 lg:py-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><DashboardPageHeader title="Bài viết cộng tác viên" description="Viết bài, lưu nháp và gửi quản trị viên duyệt trước khi đăng. Link affiliate của bạn được tạo và chia sẻ từ trang Tổng quan." /><div className="flex flex-wrap gap-2"><Link href="/dashboard" className="inline-flex min-h-10 items-center rounded-lg border border-[#cddced] bg-white px-4 text-sm font-bold">Tạo link affiliate</Link><Link href="/dashboard/viet-bai/tao-moi" className="ww-btn-cta inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold"><FilePlus2 className="size-4" />Viết bài mới</Link></div></div>
    <div className="mt-5 overflow-x-auto rounded-xl border border-[#dce8f5] bg-white"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-[#f4f8fc] text-[#315a78]"><tr><th className="px-4 py-3">Bài viết</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody className="divide-y divide-[#e5edf6]">{rows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-semibold">{row.title}</td><td className="px-4 py-3"><Badge variant={row.status === "published" ? "success" : "warning"}>{row.status === "published" ? "Đã xuất bản" : row.editorialStatus === "submitted" ? "Chờ admin duyệt" : "Bản nháp"}</Badge></td><td className="px-4 py-3 text-[#58749a]">{(row.updatedAt ?? row.createdAt).toLocaleDateString("vi-VN")}</td><td className="px-4 py-3"><Link className="font-semibold text-[#1261ed] hover:underline" href={`/dashboard/viet-bai/${row.id}`}>{row.status === "published" ? "Xem" : "Sửa bài"}</Link></td></tr>)}</tbody></table>{rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-[#58749a]">Chưa có bài viết tự viết.</p>}</div>
    {total > 20 && <nav aria-label="Phân trang bài viết" className="mt-4 flex items-center justify-between text-sm"><Link aria-disabled={page === 1} href={`/dashboard/viet-bai?trang=${Math.max(1, page - 1)}`} className={page === 1 ? "pointer-events-none text-[#8aa0bb]" : "font-semibold text-[#1261ed]"}>Trước</Link><span>Trang {page} / {Math.ceil(total / 20)}</span><Link aria-disabled={page >= Math.ceil(total / 20)} href={`/dashboard/viet-bai?trang=${Math.min(Math.ceil(total / 20), page + 1)}`} className={page >= Math.ceil(total / 20) ? "pointer-events-none text-[#8aa0bb]" : "font-semibold text-[#1261ed]"}>Sau</Link></nav>}
  </main>;
}
