import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Megaphone, Newspaper } from "lucide-react";
import type { Article } from "@/db/schema";
import { articleCoverUrl, type CategoryCount } from "@/lib/articles/service";
import { UNCATEGORIZED } from "@/lib/articles/categories";

const displayArticleCategory = (category: string | null) => category ?? UNCATEGORIZED;

function articleDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
}

function Category({ children }: { children: string }) {
  return <span className="inline-flex w-fit items-center rounded-full bg-[#e7f5df] px-3 py-1 text-[10px] font-extrabold tracking-[0.08em] text-[#347b46]">{children}</span>;
}

function Cover({ article, sizes }: { article: Article; sizes: string }) {
  const src = articleCoverUrl(article);
  return src ? <Image src={src} alt={article.productName ?? article.title} fill sizes={sizes} className="object-cover" /> : <div className="grid size-full place-items-center bg-[#e8f4df]"><Newspaper className="size-10 text-[#76ad60]" aria-hidden="true" /></div>;
}

function ArticleCard({ article }: { article: Article }) {
  return <Link href={`/bai-viet/${article.slug}`} className="news-article-card group flex min-w-0 flex-col rounded-xl bg-white p-2.5 transition-transform duration-200 hover:-translate-y-0.5">
    <div className="relative aspect-[2.03] overflow-hidden rounded-[9px]"><Cover article={article} sizes="(max-width: 639px) calc(100vw - 3rem), (max-width: 1023px) 270px, 350px" /></div>
    <div className="flex flex-1 flex-col px-2 pb-1 pt-3 sm:px-2.5"><Category>{displayArticleCategory(article.category)}</Category><h3 className="mt-2.5 line-clamp-3 text-[17px] font-black leading-[1.2] tracking-[-0.02em] text-[#12365a] transition-colors group-hover:text-[#24943c] lg:text-[19px]">{article.title}</h3><p className="mt-2 line-clamp-3 text-[13px] leading-[1.45] text-[#607a97] lg:text-sm">{article.metaDescription ?? article.intro}</p><div className="mt-auto flex items-center gap-2 pt-5 text-[11px] text-[#6a829b]"><CalendarDays className="size-4 shrink-0 text-[#5b80a1]" aria-hidden="true" /><time dateTime={article.createdAt.toISOString()}>{articleDate(article.createdAt)}</time><span className="ml-auto grid size-8 place-items-center rounded-full bg-[#f1f6f8] text-[#1b466a] transition-colors group-hover:bg-[#e7f5df] group-hover:text-[#25833a]"><ArrowRight className="size-4" aria-hidden="true" /></span></div></div>
  </Link>;
}

type CuratedNewsPageProps = {
  featured: Article | null;
  articles: Article[];
  categories: CategoryCount[];
  activeCategory: string | null;
  page: number;
  pageCount: number;
  total: number;
};

function pageHref(category: string | null, page: number) {
  const params = new URLSearchParams();
  if (category) params.set("danh-muc", category);
  if (page > 1) params.set("trang", String(page));
  const query = params.toString();
  return `/bai-viet${query ? `?${query}` : ""}`;
}

export function CuratedNewsPage({ featured, articles, categories, activeCategory, page, pageCount, total }: CuratedNewsPageProps) {
  return <main className="news-page news-curated-page">
    <section className="news-hero relative isolate overflow-hidden"><Image src="/images/landing-sky-v2.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-bottom" aria-hidden="true" /><div className="news-hero-wash absolute inset-0 -z-10" aria-hidden="true" /><div className="marketing-container relative grid min-h-[420px] items-center pb-14 pt-28 sm:pt-16 lg:min-h-[460px] lg:pb-20 lg:pt-24"><div className="relative z-10 max-w-[480px] pb-5 sm:-translate-y-1 sm:pb-0 lg:max-w-[565px]"><span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.08em] text-[#1b5c87] ring-1 ring-white/70"><Megaphone className="size-3.5 text-[#29a848]" aria-hidden="true" />TIN TỨC</span><h1 className="marketing-page-title mt-2.5 text-[#0b3153]">Cập nhật tin tức<br className="hidden sm:block" /> mới nhất từ<span className="block text-[#24943c]">Win-Win Back</span></h1><p className="mt-2 max-w-[480px] text-pretty text-[15px] leading-6 text-[#315674] sm:text-base sm:leading-7">Khám phá bài viết, gợi ý mua sắm và thông tin hoàn tiền từ Win-Win Back.</p></div><div className="pointer-events-none absolute bottom-0 right-[2%] z-0 w-[54%] max-w-[470px] sm:bottom-[20px] sm:right-[2%] lg:bottom-[-24px] lg:right-[1%] lg:w-[48%] lg:max-w-[550px]"><Image src="/images/news-reading-mascot-v1.png" alt="" width={1536} height={1024} priority sizes="(max-width: 639px) 58vw, (max-width: 1023px) 460px, 550px" className="h-auto w-full drop-shadow-[0_12px_12px_rgba(21,86,44,0.15)]" aria-hidden="true" /></div></div></section>
    <div className="marketing-container news-main news-curated-main relative z-10">
      {featured && (
        <article className="news-featured-card grid gap-4 overflow-hidden rounded-xl bg-white p-2.5 md:grid-cols-[1fr_1fr] md:gap-7">
          <Link href={`/bai-viet/${featured.slug}`} className="relative block min-h-[250px] overflow-hidden rounded-[9px] md:min-h-0" aria-label={featured.title}>
            <Cover article={featured} sizes="(max-width: 767px) calc(100vw - 3rem), (max-width: 1023px) 393px, 540px" />
          </Link>
          <div className="flex flex-col justify-center px-3 pb-4 pt-1 md:px-1 md:py-4 lg:px-3">
            <Category>{displayArticleCategory(featured.category)}</Category>
            <h2 className="mt-3 line-clamp-3 text-balance text-[28px] font-black leading-[1.06] tracking-[-0.03em] text-[#12365a] md:text-[30px] lg:text-[38px]">{featured.title}</h2>
            <p className="mt-3 line-clamp-3 text-[13px] leading-[1.5] text-[#607a97] lg:text-base">{featured.metaDescription ?? featured.intro}</p>
            <div className="mt-5 flex items-center justify-between gap-3 lg:mt-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <Image src="/images/news-reading-mascot-v1.png" alt="" width={38} height={38} className="size-9 rounded-full bg-[#e5f7d7] object-cover" />
                <div className="min-w-0 text-[11px] leading-5 text-[#6d83a0]"><p className="font-bold text-[#12365a]">Win-Win Back</p><time dateTime={featured.createdAt.toISOString()}>{articleDate(featured.createdAt)}</time></div>
              </div>
              <Link href={`/bai-viet/${featured.slug}`} className="ww-btn-cta inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#65a935] lg:px-5 lg:text-sm">Đọc ngay <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </article>
      )}
      <section className="news-latest" aria-labelledby="latest-title">
        <div className="mx-auto max-w-[800px] text-center">
          <p className="news-section-kicker">BÀI REVIEW MỚI NHẤT</p>
          <h2 id="latest-title" className="mt-2 text-balance text-3xl font-black tracking-[-0.025em] text-[#12365a] sm:text-[38px]">Bài viết <span className="text-[#23933b]">mới nhất</span></h2>
          <p className="mt-2 text-sm leading-6 text-[#526f8e] sm:text-base">Khám phá các bài viết mới và chọn nội dung phù hợp với bạn.</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <nav aria-label="Lọc bài viết theo danh mục" className="news-category-tabs flex min-w-0 items-center gap-1">
            <Link href="/bai-viet" aria-current={!activeCategory ? "page" : undefined} className={`news-category-chip shrink-0 ${!activeCategory ? "news-category-chip-active" : ""}`}>Tất cả</Link>
            {categories.length > 0 && (
              <details key={activeCategory ?? "all"} className="news-category-picker group relative min-w-0">
                <summary className={`news-category-chip flex max-w-[min(14rem,calc(100vw-8rem))] cursor-pointer items-center gap-2 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#65a935] ${activeCategory ? "news-category-chip-active" : ""}`}>
                  <span className="min-w-0 truncate">{activeCategory ?? "Danh mục"}</span>
                  <ChevronDown className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="absolute left-1/2 top-[calc(100%+0.5rem)] z-30 max-h-72 w-[min(20rem,calc(100vw-2.5rem))] -translate-x-1/2 overflow-y-auto rounded-xl bg-white p-1.5 shadow-[0_6px_16px_rgba(17,58,79,0.14)]">
                  {categories.map((category) => (
                    <Link key={category.name} href={pageHref(category.name, 1)} aria-current={activeCategory === category.name ? "page" : undefined} className={`flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#315674] transition-colors hover:bg-[#edf8e9] hover:text-[#245f32] focus-visible:ring-2 focus-visible:ring-[#65a935] focus-visible:outline-none ${activeCategory === category.name ? "bg-[#e1f2d2] text-[#245f32]" : ""}`}>
                      <span className="min-w-0 break-words">{category.name}</span>
                      <span className="shrink-0 text-xs text-[#627e91]">{category.count}</span>
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </nav>
          <p className="whitespace-nowrap text-xs font-semibold text-[#526f8e]" aria-live="polite">{total} bài viết</p>
        </div>
        {articles.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-5">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div>
        ) : total === 0 ? (
          <div className="news-empty mx-auto mt-5 max-w-xl rounded-xl bg-white px-6 py-10 text-center text-sm text-[#526f8e]">Chưa có bài viết nào trong danh mục này.</div>
        ) : null}
        {pageCount > 1 && (
          <nav aria-label="Phân trang bài viết" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && <Link href={pageHref(activeCategory, page - 1)} className="news-page-button"><ChevronLeft className="size-4" aria-hidden="true" /> Trước</Link>}
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <Link key={number} href={pageHref(activeCategory, number)} aria-current={page === number ? "page" : undefined} aria-label={`Trang ${number}`} className={`news-page-number ${page === number ? "news-page-number-active" : ""}`}>{number}</Link>
            ))}
            {page < pageCount && <Link href={pageHref(activeCategory, page + 1)} className="news-page-button">Sau <ChevronRight className="size-4" aria-hidden="true" /></Link>}
          </nav>
        )}
      </section>
      <section className="news-cta news-curated-cta relative isolate mt-8 overflow-hidden rounded-xl sm:mt-[30px]" aria-labelledby="news-cta-title">
        <Image src="/images/news-cta-shopping-banner-v1.png" alt="" fill sizes="(max-width: 1280px) 100vw, 1280px" className="-z-20 hidden object-cover object-center sm:block" aria-hidden="true" />
        <div className="news-curated-cta-mobile-art pointer-events-none absolute inset-x-0 bottom-0 h-[190px] sm:hidden" aria-hidden="true">
          <Image src="/images/news-cta-shopping-banner-v1.png" alt="" fill sizes="100vw" className="object-cover object-[70%_center]" />
        </div>
        <div className="news-cta-wash absolute inset-0 -z-10" aria-hidden="true" />
        <div className="relative z-10 max-w-[400px] px-6 pb-44 pt-7 sm:py-6 sm:pl-[68px] sm:pr-4 lg:max-w-[650px]">
          <h2 id="news-cta-title" className="text-balance text-2xl font-black leading-[1.06] tracking-[-0.025em] text-[#12365a] lg:text-[28px]">
            Cùng Win-Win Back<br /><span className="text-[#218c38]">Mua sắm thông minh hơn mỗi ngày!</span>
          </h2>
          <p className="mt-3 max-w-[410px] text-sm leading-5 text-[#426483]">Khám phá ngay các ưu đãi mới và bắt đầu nhận hoàn tiền từ những đơn hàng đầu tiên.</p>
          <Link href="/register" className="ww-btn-cta mt-3 inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3 text-sm font-extrabold focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#65a935]">
            Bắt đầu mua sắm ngay <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  </main>;
}
