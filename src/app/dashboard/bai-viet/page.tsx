import Link from "next/link";
import { and, asc, count, desc, eq, ilike, isNotNull } from "drizzle-orm";
import { FileText } from "lucide-react";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { MyArticlesTable } from "./MyArticlesTable";
import { DashboardPageHeader } from "@/components/dashboard/ui";

export const metadata = { title: "Bài viết của bạn — Win-Win Back" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const statuses = ["queued", "fetching_product", "generating", "published", "failed", "unavailable"];

export default async function MyArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 150);
  const platform = one("platform");
  const status = one("status");
  const filter = and(
    eq(affiliateLinks.userId, user.id),
    isNotNull(affiliateLinks.articleStatus),
    q ? ilike(affiliateLinks.title, `%${q}%`) : undefined,
    platform === "shopee" || platform === "tiktok" ? eq(affiliateLinks.platform, platform) : undefined,
    statuses.includes(status) ? eq(affiliateLinks.articleStatus, status) : undefined,
  );
  const [{ total }] = await db.select({ total: count() }).from(affiliateLinks).where(filter);
  const requestedPage = Number(one("trang"));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const sortMap = { title: affiliateLinks.title, articleStatus: affiliateLinks.articleStatus, createdAt: affiliateLinks.createdAt };
  const sortKey = one("sort");
  const sortColumn = Object.hasOwn(sortMap, sortKey) ? sortMap[sortKey as keyof typeof sortMap] : affiliateLinks.createdAt;
  const rows = await db.select({
    shortCode: affiliateLinks.shortCode,
    title: affiliateLinks.title,
    platform: affiliateLinks.platform,
    articleStatus: affiliateLinks.articleStatus,
    articleSlug: affiliateLinks.articleSlug,
    articleUpdatedAt: affiliateLinks.articleUpdatedAt,
    createdAt: affiliateLinks.createdAt,
  }).from(affiliateLinks).where(filter).orderBy(one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn), desc(affiliateLinks.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <main className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-6 sm:px-7 lg:py-8">
    <DashboardPageHeader title="Bài viết của bạn" description="Theo dõi bài AI đang viết, xem lại và chia sẻ bài gắn với link hoàn tiền của bạn." />
    {total === 0 && !q && !status && !platform ? <section className="mb-4 rounded-xl border border-[#e1eaf6] bg-white px-5 py-8 text-center">
      <FileText className="mx-auto size-8 text-[#6681a7]" />
      <h2 className="mt-3 text-base font-bold text-[#173861]">Chưa có bài viết nào</h2>
      <p className="mt-1 text-sm text-[#58749a]">Dán link sản phẩm ở Dashboard để tạo link hoàn tiền và bài giới thiệu.</p>
      <Link href="/dashboard" className="mt-4 inline-flex rounded-lg bg-[#b7e961] px-4 py-2.5 text-sm font-bold text-[#173b5e]">Tạo link sản phẩm</Link>
    </section> : null}
    {total > 0 || q || status || platform ? <>
      <p className="mb-2 text-xs text-[#58749a] sm:hidden">Vuốt ngang để xem đủ cột trong bảng.</p>
      <MyArticlesTable rows={rows.map((row) => ({ ...row, id: row.shortCode, articleUpdatedAt: row.articleUpdatedAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString() }))} total={total} page={page} />
    </> : null}
  </main>;
}
