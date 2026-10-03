import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, HelpCircle, ShoppingBag, Sparkles } from "lucide-react";
import {
  getPublishedArticleBySlug,
  peekPublishedArticle,
  parseSections,
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

  const sections = parseSections(a.sections);
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
          <div className="flex flex-col gap-4 sm:flex-row">
            {a.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.imageUrl}
                alt={a.productName ?? a.title}
                className="h-28 w-28 flex-shrink-0 rounded-xl border border-[#e2eaf4] object-cover"
                loading="lazy"
              />
            ) : null}
            <div className="min-w-0">
              <h1 className="text-xl font-black leading-snug tracking-tight text-[#11335e] sm:text-2xl">
                {a.title}
              </h1>
              {a.price ? (
                <p className="mt-2 text-2xl font-black text-[#ee4d2d]">
                  {formatVnd(a.price)}
                </p>
              ) : null}
              {a.estimatedCashback ? (
                <p className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#f3fbe9] px-2.5 py-1 text-sm font-bold text-[#2f7d1e]">
                  <BadgeCheck className="h-4 w-4" />
                  Hoàn tiền dự kiến ~{formatVnd(a.estimatedCashback)}
                </p>
              ) : null}
            </div>
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

        {/* AI article body */}
        <div className="space-y-6 p-5 sm:p-7">
          {a.intro ? (
            <p className="text-[15px] leading-7 text-[#35527d]">{a.intro}</p>
          ) : null}
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="flex items-center gap-2 text-base font-bold text-[#12335f]">
                <HelpCircle className="h-5 w-5 shrink-0 text-[#287be5]" />
                {s.q}
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-[#45617f]">{s.a}</p>
            </section>
          ))}

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
