import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowRight, BadgeCheck, ChevronRight, Newspaper, ShoppingBag, Tag } from "lucide-react";
import { db } from "@/db";
import { affiliateLinks, type Article } from "@/db/schema";
import {
  getPublishedArticleBySlug,
  peekPublishedArticle,
  articleContentHtml,
  listRelatedArticles,
  articleCoverUrl,
} from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { platformLabel } from "@/lib/labels";
import { normalizeArticleCategory } from "@/lib/articles/categories";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await peekPublishedArticle(slug);
  if (!a) return { title: "Không tìm thấy bài viết — Win-Win Back" };
  const description =
    a.metaDescription ??
    a.intro ??
    `${a.productName} — đánh giá chi tiết và cách mua được hoàn tiền qua Win-Win Back.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com";
  const canonical = new URL(`/bai-viet/${encodeURIComponent(a.slug)}`, siteUrl).toString();
  const cover = articleCoverUrl(a);
  const image = cover ? new URL(cover, siteUrl).toString() : undefined;
  return {
    title: `${a.title} | Win-Win Back`,
    description,
    alternates: { canonical },
    openGraph: {
      title: a.title,
      description,
      url: canonical,
      images: image ? [{ url: image, alt: a.title }] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { slug } = await params;
  const a = await getPublishedArticleBySlug(slug);
  if (!a) notFound();

  const [related, { ref }] = await Promise.all([listRelatedArticles(a, 3), searchParams]);
  const [sharedLink] = ref && /^[a-zA-Z0-9]{4,32}$/.test(ref)
    ? await db.select({ shortCode: affiliateLinks.shortCode }).from(affiliateLinks).where(and(
        eq(affiliateLinks.shortCode, ref),
        eq(affiliateLinks.platform, a.platform),
        eq(affiliateLinks.productId, a.productId),
      )).limit(1)
    : [];
  const buyHref = sharedLink?.shortCode
    ? `/go/${sharedLink.shortCode}`
    : a.affiliateShortCode ? `/go/${a.affiliateShortCode}` : a.productUrl;
  const category = normalizeArticleCategory(a.category);
  const catHref = `/bai-viet?danh-muc=${encodeURIComponent(category)}`;
  const platform = platformLabel[a.platform] ?? a.platform;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <nav aria-label="Đường dẫn trang" className="mb-8 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[#526e91]">
        <Link href="/" className="hover:text-[#1261ed]">Trang chủ</Link>
        <ChevronRight className="size-3.5 text-[#9db0ca]" aria-hidden="true" />
        <Link href="/bai-viet" className="hover:text-[#1261ed]">Tin tức</Link>
        <ChevronRight className="size-3.5 text-[#9db0ca]" aria-hidden="true" />
        <Link href={catHref} className="min-w-0 truncate hover:text-[#1261ed]">{category}</Link>
      </nav>

      <div className="mx-auto max-w-4xl">
        <header>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-md bg-[#e4effd] px-2.5 py-1 text-[#1764c6]">{platform}</span>
            <Link href={catHref} className="inline-flex items-center gap-1 rounded-md bg-[#eaf4df] px-2.5 py-1 text-[#3f7122] hover:underline">
              <Tag className="size-3.5" aria-hidden="true" /> {category}
            </Link>
          </div>
          <h1 className="mt-5 text-balance text-[clamp(1.75rem,3.2vw,2.625rem)] font-black leading-[1.18] tracking-[-0.025em] text-[#11335e]">
            {a.title}
          </h1>
          {a.metaDescription ? (
            <p className="mt-5 hidden max-w-3xl text-pretty text-base leading-7 text-[#45617f] sm:block sm:text-lg sm:leading-8">
              {a.metaDescription}
            </p>
          ) : null}
        </header>

        {(a.price || (a.estimatedCashback && a.estimatedCashback > 0) || buyHref) ? (
          <section aria-label="Thông tin mua sản phẩm" className="mt-7 flex flex-col gap-5 border-y border-[#dce6f3] py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {a.price ? <span className="text-2xl font-black text-[#e84d2c]">{formatVnd(a.price)}</span> : null}
              {a.estimatedCashback && a.estimatedCashback > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#32721d]">
                  <BadgeCheck className="size-4" aria-hidden="true" /> Hoàn tiền dự kiến ~{formatVnd(a.estimatedCashback)}
                </span>
              ) : null}
            </div>
            {buyHref ? (
              <Link href={buyHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#b7e961] px-5 py-3 text-sm font-bold text-[#173b5e] transition-colors hover:bg-[#a9e75e]">
                <ShoppingBag className="size-4" aria-hidden="true" /> Xem sản phẩm trên {platform}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </section>
        ) : null}

        <article
          className="article-body mt-8 min-w-0 overflow-x-auto rounded-2xl bg-white px-5 py-7 text-base leading-8 text-[#34516f] sm:px-9 sm:py-10 [&>p:first-child]:mt-0 [&>p:first-child_img]:my-0 [&_a]:font-semibold [&_a]:text-[#1261ed] [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#b7e961] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mt-10 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-[#12335f] [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-balance [&_h2]:text-[22px] [&_h2]:font-black [&_h2]:leading-snug [&_h2]:text-[#12335f] [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#12335f] [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-5 [&_strong]:text-[#244566] [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: articleContentHtml(a) }}
        />

        {buyHref ? (
          <div className="mt-7 flex flex-col gap-3 rounded-xl bg-[#eaf5de] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-[#315e28]">Xem sản phẩm và kiểm tra mức hoàn tiền trước khi đặt hàng.</p>
            <Link href={buyHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#11335e] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1b4b7d]">
              Mở {platform} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>

      <section className="mt-16 border-t border-[#dce6f3] pt-9" aria-labelledby="related-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold text-[#4f719c]">Khám phá thêm</p>
            <h2 id="related-title" className="text-2xl font-black tracking-tight text-[#11335e]">Bài viết liên quan</h2>
          </div>
          <Link href="/bai-viet" className="inline-flex items-center gap-1 text-sm font-bold text-[#1261ed] hover:underline">Xem tất cả <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {related.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <RelatedCard key={r.id} a={r} />)}
          </div>
        ) : (
          <div className="rounded-xl bg-white px-5 py-8 text-sm text-[#58749a]">Chưa có bài viết khác. Khám phá thêm tại <Link href="/bai-viet" className="font-bold text-[#1261ed] underline">Tin tức</Link>.</div>
        )}
      </section>
    </main>
  );
}

function RelatedCard({ a }: { a: Article }) {
  const src = articleCoverUrl(a);
  return (
    <Link href={`/bai-viet/${a.slug}`} className="group flex min-w-0 flex-col overflow-hidden rounded-xl bg-white transition-colors hover:bg-[#fdfefe]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={a.productName ?? a.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-[#e8eff8]"><Newspaper className="size-9 text-[#9cb4d2]" aria-hidden="true" /></div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-bold text-[#287be5]">{platformLabel[a.platform] ?? a.platform} · {normalizeArticleCategory(a.category)}</span>
        <h3 className="line-clamp-3 text-base font-black leading-snug text-[#11335e] group-hover:text-[#1261ed]">{a.title}</h3>
        {a.estimatedCashback && a.estimatedCashback > 0 ? <span className="mt-auto pt-1 text-xs font-bold text-[#32721d]">Hoàn tiền dự kiến ~{formatVnd(a.estimatedCashback)}</span> : null}
      </div>
    </Link>
  );
}
