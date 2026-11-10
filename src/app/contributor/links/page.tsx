import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { CreateLinkForm } from "@/components/dashboard/CreateLinkForm";
import { MyLinksTable } from "@/app/dashboard/MyLinksTable";
import { DashboardPageHeader } from "@/components/dashboard/ui";

export const metadata = { title: "Link affiliate — Cộng tác viên" };

export default async function ContributorLinksPage({ searchParams }: { searchParams: Promise<{ q?: string; trang?: string; platform?: string; sort?: string; dir?: string }> }) {
  const user = await requireContributor();
  const query = await searchParams;
  const conditions = [eq(affiliateLinks.userId, user.id)];
  const search = query.q?.trim();
  if (search) {
    const term = `%${search}%`;
    const match = or(ilike(affiliateLinks.title, term), ilike(affiliateLinks.originalUrl, term), ilike(affiliateLinks.shortCode, term));
    if (match) conditions.push(match);
  }
  if (query.platform === "shopee" || query.platform === "tiktok") conditions.push(eq(affiliateLinks.platform, query.platform));
  const filter = and(...conditions);
  const [[summary], baseUrl] = await Promise.all([
    db.select({ total: count() }).from(affiliateLinks).where(filter),
    getRequestBaseUrl(),
  ]);
  const requested = Number(query.trang);
  const page = Math.min(Number.isSafeInteger(requested) && requested > 0 ? requested : 1, Math.max(1, Math.ceil(summary.total / 8)));
  const descending = query.dir !== "asc";
  const order = query.sort === "title" ? (descending ? desc(affiliateLinks.title) : asc(affiliateLinks.title))
    : query.sort === "platform" ? (descending ? desc(affiliateLinks.platform) : asc(affiliateLinks.platform))
      : query.sort === "clicks" ? (descending ? desc(affiliateLinks.clicks) : asc(affiliateLinks.clicks))
        : (descending ? desc(affiliateLinks.createdAt) : asc(affiliateLinks.createdAt));
  const links = await db.select().from(affiliateLinks).where(filter).orderBy(order, desc(affiliateLinks.createdAt)).limit(8).offset((page - 1) * 8);

  return <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-7 lg:py-8">
    <DashboardPageHeader title="Link affiliate" description="Dán link sản phẩm, tạo link Win-Win Back rồi chia sẻ. Đơn được ghi nhận vào tài khoản của bạn." />
    <section className="mb-6 rounded-xl border border-[#dce8f5] bg-white p-4 sm:p-5"><h2 className="mb-4 text-base font-bold">Tạo link mới</h2><CreateLinkForm /></section>
    <section><h2 className="mb-4 text-base font-bold">Link của bạn</h2><MyLinksTable rows={links.map((link) => ({ id: link.id, shortCode: link.shortCode, title: link.title, originalUrl: link.originalUrl, platform: link.platform, clicks: link.clicks, createdAt: link.createdAt.toISOString() }))} total={summary.total} page={page} baseUrl={baseUrl} detailBase="/contributor/links" /></section>
  </main>;
}
