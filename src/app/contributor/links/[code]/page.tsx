import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { contributorShares } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { contributorShareStats } from "@/lib/contributor/stats";
import { ShareQr } from "@/components/contributor/ShareQr";
import { DashboardPageHeader } from "@/components/dashboard/ui";

export const metadata = { title: "Link và QR — Cộng tác viên" };

export default async function ContributorShareDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireContributor();
  const { code } = await params;
  const [owned] = await db.select({ id: contributorShares.id }).from(contributorShares)
    .where(and(eq(contributorShares.code, code), eq(contributorShares.contributorId, user.id))).limit(1);
  if (!owned) notFound();
  const [shares, baseUrl] = await Promise.all([contributorShareStats(user.id), getRequestBaseUrl()]);
  const share = shares.find((item) => item.id === owned.id);
  if (!share) notFound();
  return <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-7 lg:py-8">
    <Link href="/contributor/links" className="text-sm font-semibold text-[#1261ed] hover:underline">← Tất cả link</Link>
    <div className="mt-4"><DashboardPageHeader title={share.title} description="Dùng link hoặc mã QR này trong bài đăng của bạn để theo dõi khách truy cập." /></div>
    <ShareQr url={`${baseUrl}/c/${share.code}`} title={share.title} />
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#dce8f5] bg-white p-5"><p className="text-sm text-[#58749a]">Lượt mở link</p><p className="mt-2 text-2xl font-bold">{share.visits.toLocaleString("vi-VN")}</p></div><div className="rounded-xl border border-[#dce8f5] bg-white p-5"><p className="text-sm text-[#58749a]">Đơn mua đã ghi nhận</p><p className="mt-2 text-2xl font-bold">{share.purchases.toLocaleString("vi-VN")}</p></div></div>
    <p className="mt-4 text-sm text-[#58749a]">Đơn được tính khi khách tạo link mua hàng trên Win-Win Back sau khi truy cập từ link này và đơn được sàn ghi nhận. Đơn bị hủy không tính. Tiền hoàn thuộc ví của khách.</p>
  </main>;
}
