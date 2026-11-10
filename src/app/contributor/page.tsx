import Link from "next/link";
import { count, eq, and, like } from "drizzle-orm";
import { ArrowRight, FileText, Link2 } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { contributorShareStats } from "@/lib/contributor/stats";
import { requireContributor } from "@/lib/auth/guards";
import { DashboardPageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Cổng cộng tác viên — Win-Win Back" };

export default async function ContributorOverviewPage() {
  const user = await requireContributor();
  const [shares, [posts], [pending]] = await Promise.all([
    contributorShareStats(user.id),
    db.select({ total: count() }).from(articles).where(and(eq(articles.userId, user.id), like(articles.productId, "manual:%"))),
    db.select({ total: count() }).from(articles).where(and(eq(articles.userId, user.id), eq(articles.editorialStatus, "submitted"))),
  ]);

  return <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-7 lg:py-8">
    <DashboardPageHeader title="Không gian cộng tác viên" description="Dùng link cá nhân trong bài đăng mạng xã hội để theo dõi lượt truy cập và đơn phát sinh trên Win-Win Back." />
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl border border-[#dce8f5] bg-white p-5">
        <div className="flex items-start gap-3"><Link2 className="mt-0.5 size-5 text-[#168146]" /><div><h2 className="text-lg font-bold">Link và mã QR cá nhân</h2><p className="mt-1 text-sm text-[#58749a]">{shares.reduce((sum, item) => sum + item.visits, 0).toLocaleString("vi-VN")} lượt mở · {shares.reduce((sum, item) => sum + item.purchases, 0).toLocaleString("vi-VN")} đơn ghi nhận.</p></div></div>
        <Button variant="cta" nativeButton={false} render={<Link href="/contributor/links" />} className="mt-5">Xem link và QR <ArrowRight data-icon="inline-end" /></Button>
      </section>
      <section className="rounded-xl border border-[#dce8f5] bg-white p-5">
        <div className="flex items-start gap-3"><FileText className="mt-0.5 size-5 text-[#1766e7]" /><div><h2 className="text-lg font-bold">Bài viết</h2><p className="mt-1 text-sm text-[#58749a]">{posts.total} bài đã viết · {pending.total} bài đang chờ duyệt.</p></div></div>
        <Button variant="outline" nativeButton={false} render={<Link href="/contributor/bai-viet" />} className="mt-5">Quản lý bài viết <ArrowRight data-icon="inline-end" /></Button>
      </section>
    </div>
  </main>;
}
