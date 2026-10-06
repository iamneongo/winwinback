import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Newspaper, Tag } from "lucide-react";
import type { Article } from "@/db/schema";
import {
  listPublishedArticles,
  listArticleCategories,
  proxiedImageUrl,
} from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { platformLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tin tức & Review sản phẩm hoàn tiền | Win-Win Back",
  description:
    "Tổng hợp bài đánh giá, review sản phẩm Shopee & TikTok Shop — mua ở đâu rẻ nhất và cách nhận hoàn tiền thật về ví qua Win-Win Back.",
};

function excerpt(text: string | null, max = 150): string | null {
  if (!text) return null;
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ "danh-muc"?: string }>;
}) {
  const { "danh-muc": rawCat } = await searchParams;
  const activeCat = rawCat?.trim() || null;

  const [categories, articles] = await Promise.all([
    listArticleCategories(),
    listPublishedArticles({ category: activeCat ?? undefined }),
  ]);

  const total = categories.reduce((s, c) => s + c.count, 0);
  const featured = !activeCat ? articles[0] : undefined;
  const rest = featured ? articles.slice(1) : articles;

  return (
    <>
      {/* Hero band */}
      <section className="ww-hero-bg">
        <div className="mx-auto max-w-screen-xl px-5 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#cfe6a4]">
            <Newspaper className="h-3.5 w-3.5" /> Tin tức &amp; Review
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-[42px]">
            Review sản phẩm &amp;{" "}
            <span className="ww-lime-text-gradient">mẹo nhận hoàn tiền</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#b9cbe3]">
            Đánh giá chi tiết sản phẩm hot trên Shopee &amp; TikTok Shop — nên
            mua không, giá bao nhiêu, và mua ở đâu để được hoàn tiền thật về ví.
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-screen-xl px-5 py-8 sm:py-10">
        {/* Category filter */}
        <nav className="mb-8 flex flex-wrap gap-2">
          <CategoryChip label="Tất cả" href="/bai-viet" active={!activeCat} count={total} />
          {categories.map((c) => (
            <CategoryChip
              key={c.name}
              label={c.name}
              href={`/bai-viet?danh-muc=${encodeURIComponent(c.name)}`}
              active={activeCat === c.name}
              count={c.count}
            />
          ))}
        </nav>

        {articles.length === 0 ? (
          <div className="rounded-2xl border border-[#e1eaf6] bg-white py-20 text-center text-[#6681a7]">
            Chưa có bài viết nào trong mục này.
          </div>
        ) : (
          <div className="space-y-8">
            {featured ? <FeaturedCard a={featured} /> : null}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a.id} a={a} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function CategoryChip({
  label,
  href,
  active,
  count,
}: {
  label: string;
  href: string;
  active: boolean;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold transition " +
        (active
          ? "border-[#11335e] bg-[#11335e] text-white"
          : "border-[#dbe6f3] bg-white text-[#34527d] hover:border-[#b7c9e0] hover:bg-[#f6f9fd]")
      }
    >
      {label}
      <span className={active ? "text-[#b7e961]" : "text-[#8aa0bf]"}>{count}</span>
    </Link>
  );
}

function CardImage({
  a,
  className,
}: {
  a: { imageUrl: string | null; productName: string | null; title: string };
  className?: string;
}) {
  const src = proxiedImageUrl(a.imageUrl);
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-[#eef3fa] ${className ?? ""}`}>
        <Newspaper className="h-10 w-10 text-[#b7c9e0]" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={a.productName ?? a.title}
      loading="lazy"
      className={`object-cover ${className ?? ""}`}
    />
  );
}

function CatTag({ platform, category }: { platform: string; category: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
      <span className="rounded-md bg-[#eef6ff] px-2 py-1 text-[#287be5]">
        {platformLabel[platform] ?? platform}
      </span>
      {category ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#f3fbe9] px-2 py-1 text-[#4a7d1e]">
          <Tag className="h-3 w-3" /> {category}
        </span>
      ) : null}
    </div>
  );
}

function FeaturedCard({ a }: { a: Article }) {
  return (
    <Link
      href={`/bai-viet/${a.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-[#e1eaf6] bg-white shadow-[0_8px_30px_rgba(26,73,124,0.06)] transition hover:shadow-[0_12px_38px_rgba(26,73,124,0.12)] md:grid-cols-2"
    >
      <CardImage a={a} className="h-56 w-full md:h-full" />
      <div className="flex flex-col p-6 sm:p-8">
        <CatTag platform={a.platform} category={a.category} />
        <h2 className="mt-3 text-xl font-black leading-snug tracking-tight text-[#11335e] group-hover:text-[#1261ed] sm:text-2xl">
          {a.title}
        </h2>
        {excerpt(a.metaDescription ?? a.intro, 200) ? (
          <p className="mt-3 text-[15px] leading-7 text-[#5a7596]">
            {excerpt(a.metaDescription ?? a.intro, 200)}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
          {a.price ? (
            <span className="text-lg font-black text-[#ee4d2d]">{formatVnd(a.price)}</span>
          ) : null}
          {a.estimatedCashback ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3fbe9] px-2.5 py-1 text-sm font-bold text-[#2f7d1e]">
              <BadgeCheck className="h-4 w-4" /> Hoàn ~{formatVnd(a.estimatedCashback)}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-sm font-bold text-[#1261ed]">
            Đọc tiếp <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ a }: { a: Article }) {
  return (
    <Link
      href={`/bai-viet/${a.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#e1eaf6] bg-white shadow-[0_5px_18px_rgba(26,73,124,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(26,73,124,0.12)]"
    >
      <CardImage a={a} className="h-44 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <CatTag platform={a.platform} category={a.category} />
        <h3 className="mt-2.5 line-clamp-3 font-black leading-snug tracking-tight text-[#11335e] group-hover:text-[#1261ed]">
          {a.title}
        </h3>
        {excerpt(a.metaDescription ?? a.intro, 110) ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5a7596]">
            {excerpt(a.metaDescription ?? a.intro, 110)}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
          {a.price ? (
            <span className="font-black text-[#ee4d2d]">{formatVnd(a.price)}</span>
          ) : null}
          {a.estimatedCashback ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#f3fbe9] px-2 py-0.5 text-xs font-bold text-[#2f7d1e]">
              <BadgeCheck className="h-3.5 w-3.5" /> ~{formatVnd(a.estimatedCashback)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
