import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, Newspaper, ShoppingBag, Tag } from "lucide-react";
import type { Article } from "@/db/schema";
import {
  getPublishedArticleBySlug,
  peekPublishedArticle,
  articleContentHtml,
  listRelatedArticles,
  proxiedImageUrl,
} from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { platformLabel } from "@/lib/labels";

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
  return {
    title: `${a.title} | Win-Win Back`,
    description,
    openGraph: {
      title: a.title,
      description,
      images: a.imageUrl ? [{ url: a.imageUrl }] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await getPublishedArticleBySlug(slug);
  if (!a) notFound();

  const related = await listRelatedArticles(a, 3);
  const buyHref = a.affiliateShortCode ? `/go/${a.affiliateShortCode}` : a.productUrl;
  const catHref = a.category
    ? `/bai-viet?danh-muc=${encodeURIComponent(a.category)}`
    : "/bai-viet";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs font-semibold text-[#6b83a6]">
        <Link href="/" className="hover:text-[#1261ed]">Trang chủ</Link>
        <ChevronRight className="h-3.5 w-3.5 text-[#aab9cf]" />
        <Link href="/bai-viet" className="hover:text-[#1261ed]">Tin tức</Link>
        {a.category ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-[#aab9cf]" />
            <Link href={catHref} className="hover:text-[#1261ed]">{a.category}</Link>
          </>
        ) : null}
      </nav>

      <article className="overflow-hidden rounded-2xl border border-[#e1eaf6] bg-white shadow-[0_8px_30px_rgba(26,73,124,0.06)]">
        {/* Product card */}
        <div className="border-b border-[#eef3f9] p-5 sm:p-7">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold text-[#6b8290]">
            <span className="rounded-md bg-[#eef6ff] px-2 py-1 text-[#287be5]">
              {platformLabel[a.platform] ?? a.platform}
            </span>
            {a.category ? (
              <Link
                href={catHref}
                className="inline-flex items-center gap-1 rounded-md bg-[#f3fbe9] px-2 py-1 text-[#4a7d1e] hover:underline"
              >
                <Tag className="h-3 w-3" /> {a.category}
              </Link>
            ) : null}
          </div>
          <h1 className="text-xl font-black leading-snug tracking-tight text-[#11335e] sm:text-2xl">
            {a.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {a.price ? (
              <span className="text-2xl font-black text-[#ee4d2d]">
                {formatVnd(a.price)}
              </span>
            ) : null}
            {a.estimatedCashback ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3fbe9] px-2.5 py-1 text-sm font-bold text-[#2f7d1e]">
                <BadgeCheck className="h-4 w-4" />
                Hoàn tiền dự kiến ~{formatVnd(a.estimatedCashback)}
              </span>
            ) : null}
          </div>
          {buyHref ? (
            <Link
              href={buyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b7e961] px-4 py-3 font-bold text-[#173b5e] transition hover:bg-[#a9e75e]"
            >
              <ShoppingBag className="h-5 w-5" />
              Mua ngay &amp; nhận hoàn tiền trên {platformLabel[a.platform] ?? "sàn"}
            </Link>
          ) : null}
        </div>

        {/* Article body (editable rich HTML with inline images) */}
        <div
          className="article-body p-5 text-[15px] leading-7 text-[#45617f] sm:p-7 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#12335f] [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#12335f] [&_h3]:mt-5 [&_h3]:font-bold [&_h3]:text-[#12335f] [&_p]:mt-3 [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-xl [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1 [&_a]:font-semibold [&_a]:text-[#1261ed] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#b7e961] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#5a7596] [&_strong]:text-[#2a4669]"
          dangerouslySetInnerHTML={{ __html: articleContentHtml(a) }}
        />

        {/* Bottom CTA */}
        {buyHref ? (
          <div className="px-5 pb-6 sm:px-7">
            <Link
              href={buyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#11335e] px-4 py-3 font-bold text-white transition hover:bg-[#15406f]"
            >
              <ShoppingBag className="h-5 w-5" />
              Mua &amp; nhận hoàn tiền ngay
            </Link>
          </div>
        ) : null}
      </article>

      {/* Related articles */}
      {related.length > 0 ? (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#287be5]" />
            <h2 className="text-lg font-black tracking-tight text-[#11335e]">
              Bài viết liên quan
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <RelatedCard key={r.id} a={r} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-8 text-center text-sm text-[#6681a7]">
        <Link href="/bai-viet" className="font-bold text-[#1261ed]">
          ← Xem tất cả bài viết
        </Link>
      </p>
    </main>
  );
}

function RelatedCard({ a }: { a: Article }) {
  const src = proxiedImageUrl(a.imageUrl);
  return (
    <Link
      href={`/bai-viet/${a.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#e1eaf6] bg-white shadow-[0_5px_18px_rgba(26,73,124,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,73,124,0.12)]"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={a.productName ?? a.title} loading="lazy" className="h-36 w-full object-cover" />
      ) : (
        <div className="flex h-36 w-full items-center justify-center bg-[#eef3fa]">
          <Newspaper className="h-8 w-8 text-[#b7c9e0]" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-3 text-sm font-black leading-snug text-[#11335e] group-hover:text-[#1261ed]">
          {a.title}
        </h3>
        {a.estimatedCashback ? (
          <div className="mt-auto pt-3">
            <span className="inline-flex w-fit items-center gap-1 rounded-md bg-[#f3fbe9] px-2 py-0.5 text-xs font-bold text-[#2f7d1e]">
              <BadgeCheck className="h-3.5 w-3.5" /> Hoàn ~{formatVnd(a.estimatedCashback)}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
