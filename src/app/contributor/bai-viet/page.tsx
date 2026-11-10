import Link from "next/link";
import { and, count, desc, eq, like } from "drizzle-orm";
import { FilePlus2 } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Bài viết cộng tác viên — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function ContributorArticlesPage({ searchParams }: { searchParams: Promise<{ trang?: string }> }) {
  const user = await requireContributor();
  const filter = and(eq(articles.userId, user.id), like(articles.productId, "manual:%"));
  const [{ total }] = await db.select({ total: count() }).from(articles).where(filter);
  const requested = Number((await searchParams).trang);
  const pages = Math.max(1, Math.ceil(total / 20));
  const page = Math.min(Number.isSafeInteger(requested) && requested > 0 ? requested : 1, pages);
  const rows = await db.select({ id: articles.id, title: articles.title, status: articles.status, editorialStatus: articles.editorialStatus, updatedAt: articles.updatedAt, createdAt: articles.createdAt })
    .from(articles).where(filter).orderBy(desc(articles.createdAt)).limit(20).offset((page - 1) * 20);

  return <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-7 lg:py-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <DashboardPageHeader title="Bài viết của tôi" description="Viết bài, lưu nháp và gửi quản trị viên duyệt trước khi đăng." />
      <div className="flex flex-wrap gap-2"><Button nativeButton={false} variant="outline" render={<Link href="/contributor/links" />}>Link và mã QR</Button><Button nativeButton={false} variant="cta" render={<Link href="/contributor/bai-viet/tao-moi" />}><FilePlus2 data-icon="inline-start" />Viết bài mới</Button></div>
    </div>
    <div className="overflow-x-auto rounded-xl border border-[#dce8f5] bg-white"><Table className="min-w-[680px]"><TableHeader><TableRow><TableHead>Bài viết</TableHead><TableHead>Trạng thái</TableHead><TableHead>Cập nhật</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}>
      <TableCell className="max-w-[24rem] font-semibold">{row.title}</TableCell>
      <TableCell><Badge variant={row.status === "published" ? "success" : "warning"}>{row.status === "published" ? "Đã xuất bản" : row.editorialStatus === "submitted" ? "Chờ admin duyệt" : "Bản nháp"}</Badge></TableCell>
      <TableCell>{(row.updatedAt ?? row.createdAt).toLocaleDateString("vi-VN")}</TableCell>
      <TableCell><Link className="font-semibold text-[#1261ed] hover:underline" href={`/contributor/bai-viet/${row.id}`}>{row.status === "published" ? "Xem" : "Sửa bài"}</Link></TableCell>
    </TableRow>)}</TableBody></Table>{!rows.length && <p className="px-4 py-8 text-center text-sm text-[#58749a]">Chưa có bài viết tự viết.</p>}</div>
    {total > 20 && <nav aria-label="Phân trang bài viết" className="mt-4 flex items-center justify-between text-sm"><Link aria-disabled={page === 1} href={`/contributor/bai-viet?trang=${Math.max(1, page - 1)}`} className={page === 1 ? "pointer-events-none text-[#8aa0bb]" : "font-semibold text-[#1261ed]"}>Trước</Link><span>Trang {page} / {pages}</span><Link aria-disabled={page >= pages} href={`/contributor/bai-viet?trang=${Math.min(pages, page + 1)}`} className={page >= pages ? "pointer-events-none text-[#8aa0bb]" : "font-semibold text-[#1261ed]"}>Sau</Link></nav>}
  </main>;
}
