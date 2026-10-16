import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronRight, Clock3, Newspaper } from "lucide-react";
import type { Article } from "@/db/schema";
import { articleCoverUrl } from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { ArticleShareActions } from "./ArticleShareActions";

type TocItem = { id: string; title: string };

function articleDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

/** The stored HTML is sanitized by articleContentHtml before it reaches here. */
function prepareBody(html: string, hasCover: boolean): { html: string; toc: TocItem[] } {
  const withoutCover = hasCover ? html.replace(/^<p>\s*<img\b[^>]*\/?>(?:\s|&nbsp;)*<\/p>\s*/i, "") : html;
  const toc: TocItem[] = [];
  const withAnchors = withoutCover.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attrs: string, heading: string) => {
    const id = `muc-${toc.length + 1}`;
    const title = heading.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    toc.push({ id, title });
    return `<h2${attrs} id="${id}">${heading}</h2>`;
  });
  return { html: withAnchors, toc };
}

function RelatedCard({ article }: { article: Article }) {
  const cover = articleCoverUrl(article);
  return (
    <Link href={`/bai-viet/${article.slug}`} className="group grid min-w-0 overflow-hidden rounded-xl bg-white shadow-[0_4px_12px_rgba(27,72,64,0.07)] sm:grid-cols-[38%_1fr]">
      <div className="relative aspect-[1.8] overflow-hidden bg-[#e8f4df] sm:aspect-auto">
        {cover ? <Image src={cover} alt={article.productName ?? article.title} fill sizes="(max-width: 639px) 100vw, 300px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : <div className="grid size-full place-items-center"><Newspaper className="size-9 text-[#76ad60]" aria-hidden="true" /></div>}
      </div>
      <div className="flex min-w-0 flex-col px-4 py-4">
        <h3 className="line-clamp-2 text-balance text-base font-extrabold leading-snug text-[#12365a] group-hover:text-[#238b39]">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#526f8e]">{article.metaDescription ?? article.intro}</p>
        <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-[#617f9b]">
          <CalendarDays className="size-4" aria-hidden="true" />
          <time dateTime={article.createdAt.toISOString()}>{articleDate(article.createdAt)}</time>
          <span className="ml-auto grid size-8 place-items-center rounded-full bg-[#edf4f8] text-[#16436b]" aria-hidden="true"><ArrowRight className="size-4" /></span>
        </div>
      </div>
    </Link>
  );
}

export function RealArticleDetail({
  article,
  related,
  buyHref,
  platform,
  category,
  contentHtml,
}: {
  article: Article;
  related: Article[];
  buyHref: string | null;
  platform: string;
  category: string;
  contentHtml: string;
}) {
  const cover = articleCoverUrl(article);
  const body = prepareBody(contentHtml, Boolean(cover));
  const wordCount = contentHtml.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));
  const summary = article.metaDescription ?? article.intro;

  return (
    <main className="news-detail-page min-h-screen bg-[#f8fbf6] text-[#12365a]">
      <section className="news-detail-hero relative isolate overflow-hidden">
        <Image src="/images/landing-sky-v2.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-bottom" aria-hidden="true" />
        <div className="news-detail-hero-wash absolute inset-0 -z-10" aria-hidden="true" />
        <div className="marketing-container relative pb-20 pt-24 sm:pb-24 sm:pt-28">
          <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#4f6e89]">
            <Link href="/" className="hover:text-[#218d39]">Trang chủ</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <Link href="/bai-viet" className="hover:text-[#218d39]">Tin tức</Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="max-w-[48ch] truncate" aria-current="page">{article.title}</span>
          </nav>
          <span className="mt-5 inline-flex rounded-full bg-[#e4f6d8] px-3 py-1.5 text-xs font-extrabold tracking-[0.04em] text-[#287c3c]">{category}</span>
          <h1 className="marketing-page-title mt-3 max-w-[960px]">{article.title}</h1>
          {summary && <p className="mt-3 max-w-[760px] text-pretty text-base leading-6 text-[#426381] sm:text-lg sm:leading-7">{summary}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#5c7894] sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Image src="/images/news-reading-mascot-v1.png" alt="" width={44} height={44} className="size-11 rounded-full bg-[#e8f8dc] object-cover" />
              <div className="leading-5"><p className="font-bold text-[#12365a]">Win-Win Back</p><time dateTime={article.createdAt.toISOString()}>{articleDate(article.createdAt)}</time></div>
            </div>
            <span className="hidden text-[#2e6e96] sm:inline" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" aria-hidden="true" />{readingMinutes} phút đọc</span>
          </div>
        </div>
      </section>

      <div className="marketing-container relative z-10 -mt-10 pb-12 sm:-mt-14">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(250px,1fr)] lg:gap-8">
          <div className="relative aspect-[1.72] overflow-hidden rounded-xl bg-[#e8f4df] sm:aspect-[2.1] lg:col-start-1 lg:row-start-1">
            {cover ? <Image src={cover} alt={article.productName ?? article.title} fill priority sizes="(max-width: 1023px) 100vw, 900px" className="object-cover" /> : <div className="grid size-full place-items-center"><Newspaper className="size-16 text-[#76ad60]" aria-hidden="true" /></div>}
          </div>
          <aside className="rounded-xl bg-white px-5 py-6 shadow-[0_4px_14px_rgba(27,72,64,0.07)] lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto" aria-label="Mục lục và chia sẻ bài viết">
            {body.toc.length > 0 && <>
              <h2 className="text-base font-extrabold">Nội dung bài viết</h2>
              <ol className="mt-4 space-y-1">
                {body.toc.map((item, index) => (
                  <li key={item.id}><a href={`#${item.id}`} className="flex min-h-11 items-center gap-3 text-[13px] leading-5 text-[#55718e] hover:text-[#238b39]"><span className="shrink-0 font-extrabold text-[#358b47]">{String(index + 1).padStart(2, "0")}</span><span>{item.title}</span></a></li>
                ))}
              </ol>
            </>}
            <div className={body.toc.length > 0 ? "mt-6 border-t border-[#e5edf0] pt-5" : ""}><ArticleShareActions /></div>
          </aside>
          <article className="article-body news-real-article-body mt-4 max-w-[990px] lg:col-start-1 lg:row-start-2 lg:mt-2" dangerouslySetInnerHTML={{ __html: body.html }} />
        </div>

        <section className="news-article-cta relative isolate mt-12 overflow-hidden rounded-xl sm:mt-16" aria-labelledby="article-cta-title">
          <div className="news-article-cta-art pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-44 sm:inset-0 sm:h-full" aria-hidden="true">
            <Image src="/images/news-cta-shopping-banner-v1.png" alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1280px) 100vw, 1280px" className="object-cover object-[70%_center] sm:object-center" />
          </div>
          <div className="news-cta-wash absolute inset-0 -z-10" aria-hidden="true" />
          <div className="relative z-10 max-w-[670px] px-6 pb-44 pt-8 sm:px-12 sm:py-10">
            <h2 id="article-cta-title" className="text-balance text-2xl font-black leading-tight tracking-[-0.025em] sm:text-3xl">Mua sắm cùng Win-Win Back<br /><span className="text-[#218d39]">và kiểm tra tiền hoàn trước khi đặt hàng</span></h2>
            <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#426381] sm:text-base">
              {article.price ? `Giá ghi nhận lúc đăng: ${formatVnd(article.price)}. ` : ""}Thông tin sản phẩm và mức hoàn tiền có thể thay đổi; hãy kiểm tra lại trên {platform} trước khi thanh toán.
            </p>
            <Link href={buyHref ?? "/register"} target={buyHref ? "_blank" : undefined} rel={buyHref ? "noopener noreferrer" : undefined} className="news-cta-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold text-[#173b5e]">{buyHref ? `Xem sản phẩm trên ${platform}` : "Bắt đầu mua sắm ngay"} <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="mt-10 sm:mt-12" aria-labelledby="related-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="related-title" className="text-2xl font-black tracking-[-0.02em] sm:text-3xl">Bài viết liên quan</h2>
            <Link href="/bai-viet" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#238b39] hover:underline">Xem tất cả tin tức <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
          {related.length > 0 ? <div className="mt-4 grid gap-5 lg:grid-cols-2">{related.slice(0, 2).map((item) => <RelatedCard key={item.id} article={item} />)}</div> : <p className="mt-4 text-sm text-[#526f8e]">Chưa có bài viết liên quan.</p>}
        </section>
      </div>
    </main>
  );
}
