import Link from "next/link";
import { and, count, desc, eq, isNotNull } from "drizzle-orm";
import { ChevronLeft, ChevronRight, FileText, Link2 } from "lucide-react";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { platformLabel } from "@/lib/labels";
import { ArticleProgress } from "@/components/dashboard/ArticleProgress";

export const metadata = { title: "Bài viết của bạn — Win-Win Back" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function MyArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireUser();
  const { page: requestedPage } = await searchParams;
  const filter = and(eq(affiliateLinks.userId, user.id), isNotNull(affiliateLinks.articleStatus));
  const [{ total }] = await db.select({ total: count() }).from(affiliateLinks).where(filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const parsedPage = Number.parseInt(requestedPage ?? "1", 10);
  const page = Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), totalPages) : 1;
  const links = await db
    .select({
      shortCode: affiliateLinks.shortCode,
      title: affiliateLinks.title,
      platform: affiliateLinks.platform,
      articleStatus: affiliateLinks.articleStatus,
      articlePreview: affiliateLinks.articlePreview,
      articleSlug: affiliateLinks.articleSlug,
      articleUpdatedAt: affiliateLinks.articleUpdatedAt,
      createdAt: affiliateLinks.createdAt,
    })
    .from(affiliateLinks)
    .where(filter)
    .orderBy(desc(affiliateLinks.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-7 lg:py-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-black tracking-tight text-[#11335e] sm:text-[30px]">Bài viết của bạn</h1>
        <p className="mt-1 text-sm leading-6 text-[#58749a]">Theo dõi bài AI đang viết, xem lại và chia sẻ bài gắn với link hoàn tiền của bạn.</p>
      </header>

      {links.length === 0 ? (
        <section className="rounded-2xl border border-[#e1eaf6] bg-white px-5 py-12 text-center shadow-sm">
          <FileText className="mx-auto size-9 text-[#8ba7c9]" />
          <h2 className="mt-3 text-base font-bold text-[#173861]">Chưa có bài viết nào</h2>
          <p className="mt-1 text-sm text-[#6681a7]">Dán link sản phẩm ở Dashboard để tạo link hoàn tiền và bài giới thiệu.</p>
          <Link href="/dashboard" className="mt-4 inline-flex rounded-lg bg-[#b7e961] px-4 py-2.5 text-sm font-bold text-[#173b5e]">Tạo link sản phẩm</Link>
        </section>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <article key={link.shortCode} className="min-w-0 rounded-2xl border border-[#e1eaf6] bg-white p-4 shadow-[0_5px_18px_rgba(26,73,124,0.05)] sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-md bg-[#eef6ff] px-2 py-1 text-[11px] font-bold text-[#287be5]">{platformLabel[link.platform] ?? link.platform}</span>
                  <h2 className="mt-2 line-clamp-2 text-base font-black leading-snug text-[#11335e]">{link.title?.trim() || `Sản phẩm trên ${platformLabel[link.platform] ?? "sàn"}`}</h2>
                  <p className="mt-1 text-xs text-[#8198b6]">Tạo ngày {link.createdAt.toLocaleDateString("vi-VN")}</p>
                </div>
                <Link href={`/go/${link.shortCode}`} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#dbe6f3] px-3 py-2 text-xs font-bold text-[#315a90] hover:bg-[#f4f8fe]"><Link2 className="size-3.5" /> Link hoàn tiền</Link>
              </div>
              <ArticleProgress
                code={link.shortCode}
                initial={{
                  status: link.articleStatus,
                  preview: link.articlePreview,
                  slug: link.articleSlug,
                  updatedAt: link.articleUpdatedAt?.toISOString() ?? null,
                }}
                allowRetry
              />
            </article>
          ))}
          <nav aria-label="Phân trang bài viết" className="flex items-center justify-between gap-3 pt-2 text-xs font-semibold text-[#58749a]">
            <span>{total} bài viết · Trang {page}/{totalPages}</span>
            <div className="flex items-center gap-2">
              {page > 1 ? <Link href={`/dashboard/bai-viet?page=${page - 1}`} aria-label="Trang trước" className="rounded-lg border border-[#dbe6f3] p-2 hover:bg-white"><ChevronLeft className="size-4" /></Link> : null}
              {page < totalPages ? <Link href={`/dashboard/bai-viet?page=${page + 1}`} aria-label="Trang sau" className="rounded-lg border border-[#dbe6f3] p-2 hover:bg-white"><ChevronRight className="size-4" /></Link> : null}
            </div>
          </nav>
        </div>
      )}
    </main>
  );
}
