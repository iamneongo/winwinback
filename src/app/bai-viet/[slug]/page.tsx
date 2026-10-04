import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ShoppingBag, Sparkles } from "lucide-react";
import {
  getPublishedArticleBySlug,
  peekPublishedArticle,
  articleContentHtml,
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

  const buyHref = a.affiliateShortCode ? `/go/${a.affiliateShortCode}` : a.productUrl;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <article className="overflow-hidden rounded-2xl border border-[#e1eaf6] bg-white shadow-[0_8px_30px_rgba(26,73,124,0.06)]">
        {/* Product card */}
        <div className="border-b border-[#eef3f9] p-5 sm:p-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#6b8290]">
            <span className="rounded-md bg-[#eef6ff] px-2 py-1 text-[#287be5]">
              {platformLabel[a.platform] ?? a.platform}
            </span>
            <span>Thông tin sản phẩm</span>
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
        <div className="px-5 pb-6 sm:px-7">
          <p className="flex items-start gap-2 rounded-xl border border-[#dbeafe] bg-[#f5f9ff] px-4 py-3 text-xs leading-5 text-[#4a688f]">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#f5b613]" />
            Trang này được tối ưu chuẩn SEO. Mua qua Win-Win Back để nhận hoàn
            tiền thật vào ví — tiền hoàn chính xác được tính theo hoa hồng thực
            tế khi đơn hoàn tất.
          </p>
        </div>
      </article>

      <p className="mt-6 text-center text-sm text-[#6681a7]">
        <Link href="/" className="font-bold text-[#1261ed]">
          Win-Win Back
        </Link>{" "}
        — Dán link sản phẩm, mua hàng, nhận hoàn tiền vào ví.
      </p>
    </main>
  );
}
