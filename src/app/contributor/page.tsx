import Link from "next/link";
import { and, count, desc, eq, like, sql } from "drizzle-orm";
import { ArrowRight, ClipboardList, Eye, FilePlus2, FileText, Link2, ShoppingBag } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { contributorShareStats } from "@/lib/contributor/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { DashboardPageHeader } from "@/components/dashboard/ui";

export const metadata = { title: "Cổng cộng tác viên — Win-Win Back" };
export const dynamic = "force-dynamic";

const ownArticle = (userId: string) => and(eq(articles.userId, userId), like(articles.productId, "manual:%"));

function StatIcon({ tone, children }: { tone: "green" | "blue" | "amber" | "violet"; children: React.ReactNode }) {
  const colors = {
    green: "bg-[#e9f8dd] text-[#319a37]",
    blue: "bg-[#e8f1ff] text-[#287be5]",
    amber: "bg-[#fff3d9] text-[#d8900a]",
    violet: "bg-[#f2e8ff] text-[#913fdb]",
  };
  return <span className={`grid size-10 place-items-center rounded-full ${colors[tone]}`}>{children}</span>;
}

export default async function ContributorOverviewPage() {
  const user = await requireContributor();
  const [shares, [articleCounts], recentArticles] = await Promise.all([
    contributorShareStats(user.id),
    db.select({
      total: count(),
      pending: sql<number>`count(*) filter (where ${articles.editorialStatus} = 'submitted')::int`,
    }).from(articles).where(ownArticle(user.id)),
    db.select({ id: articles.id, title: articles.title, status: articles.status, editorialStatus: articles.editorialStatus, updatedAt: articles.updatedAt, createdAt: articles.createdAt })
      .from(articles).where(ownArticle(user.id)).orderBy(desc(articles.updatedAt)).limit(4),
  ]);
  const visits = shares.reduce((sum, item) => sum + item.visits, 0);
  const purchases = shares.reduce((sum, item) => sum + item.purchases, 0);
  const hasPersonalLink = shares.some((item) => item.articleId === null);

  return <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <DashboardPageHeader title="Tổng quan cộng tác viên" description="Theo dõi lượt truy cập, đơn hàng từ link cá nhân và tiến độ bài viết của bạn." />
      <Button variant="cta" nativeButton={false} render={<Link href="/contributor/links" />}>
        <Link2 data-icon="inline-start" />{hasPersonalLink ? "Xem link & mã QR" : "Tạo link & mã QR"}
      </Button>
    </div>

    <section aria-label="Thống kê cộng tác viên" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <DashboardMetricCard icon={<StatIcon tone="green"><Eye className="size-5" /></StatIcon>} label="Lượt truy cập qua link" value={visits.toLocaleString("vi-VN")} href="/contributor/links" action="Xem link của bạn" />
      <DashboardMetricCard icon={<StatIcon tone="blue"><ShoppingBag className="size-5" /></StatIcon>} label="Đơn mua được ghi nhận" value={purchases.toLocaleString("vi-VN")} href="/contributor/links" action="Xem thống kê" />
      <DashboardMetricCard icon={<StatIcon tone="violet"><FileText className="size-5" /></StatIcon>} label="Bài viết của bạn" value={(articleCounts?.total ?? 0).toLocaleString("vi-VN")} href="/contributor/bai-viet" action="Quản lý bài viết" />
      <DashboardMetricCard icon={<StatIcon tone="amber"><ClipboardList className="size-5" /></StatIcon>} label="Bài đang chờ duyệt" value={(articleCounts?.pending ?? 0).toLocaleString("vi-VN")} href="/contributor/bai-viet" action="Xem trạng thái" />
    </section>

    <section className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <div><CardTitle>Link chia sẻ cá nhân</CardTitle><CardDescription className="mt-1">Dùng trong bài đăng Facebook, TikTok hoặc nền tảng khác.</CardDescription></div>
          <Link2 className="size-5 text-[#168146]" aria-hidden="true" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="max-w-[55ch] text-sm leading-6 text-[#48668c]">Người đọc mở link hoặc quét mã QR sẽ đến Win-Win Back. Bạn có thể theo dõi lượt truy cập và đơn phát sinh; tiền hoàn vẫn thuộc về khách mua hàng.</p>
          <div><Badge variant={hasPersonalLink ? "success" : "warning"}>{hasPersonalLink ? "Link đã sẵn sàng" : "Chưa tạo link"}</Badge></div>
        </CardContent>
        <CardFooter>
          <Link href="/contributor/links" className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-[#1766e7] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1766e7]">{hasPersonalLink ? "Sao chép link hoặc tải QR" : "Tạo link và mã QR"}<ArrowRight className="size-3.5" aria-hidden="true" /></Link>
        </CardFooter>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <div><CardTitle>Bài viết gần đây</CardTitle><CardDescription className="mt-1">Bài viết trong CMS được admin duyệt trước khi công khai.</CardDescription></div>
          <Link href="/contributor/bai-viet" className="inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline">Xem tất cả <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentArticles.length ? <ul className="divide-y divide-[#edf1f7]">{recentArticles.map((article) => <li key={article.id}>
            <Link href={`/contributor/bai-viet/${article.id}`} className="flex min-w-0 items-center gap-3 px-5 py-3.5 hover:bg-[#f7faff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1766e7]">
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#173b68]">{article.title}</span><span className="mt-0.5 block text-xs text-[#7188a6]">Cập nhật {(article.updatedAt ?? article.createdAt).toLocaleDateString("vi-VN")}</span></span>
              <Badge variant={article.status === "published" ? "success" : article.editorialStatus === "submitted" ? "warning" : "secondary"}>{article.status === "published" ? "Đã đăng" : article.editorialStatus === "submitted" ? "Chờ duyệt" : "Bản nháp"}</Badge>
            </Link>
          </li>)}</ul> : <div className="px-5 py-8 text-center"><p className="text-sm text-[#58749a]">Bạn chưa có bài viết nào trong CMS.</p><Button className="mt-4" variant="outline" nativeButton={false} render={<Link href="/contributor/bai-viet/tao-moi" />}><FilePlus2 data-icon="inline-start" />Viết bài đầu tiên</Button></div>}
        </CardContent>
        {recentArticles.length > 0 && <CardFooter><Link href="/contributor/bai-viet/tao-moi" className="inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-[#1766e7] hover:underline"><FilePlus2 className="size-3.5" aria-hidden="true" />Viết bài mới</Link></CardFooter>}
      </Card>
    </section>
  </main>;
}
