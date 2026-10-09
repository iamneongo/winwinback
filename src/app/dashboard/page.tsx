import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/db";
import { affiliateLinks, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { CreateLinkForm } from "@/components/dashboard/CreateLinkForm";
import { Empty, cardClass, sectionTitleClass } from "@/components/dashboard/ui";
import { formatVnd } from "@/lib/config";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { platformLabel } from "@/lib/labels";
import { MetricIcon, StepIcon } from "@/components/dashboard/MetricIcon";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { MyLinksTable } from "@/app/dashboard/MyLinksTable";
import { ShopeeIcon, TikTokIcon } from "@/components/sections/BrandIcons";

export const metadata = { title: "Tổng quan — Win-Win Back" };
export const dynamic = "force-dynamic";

const LINKS_PER_PAGE = 8;
const recentPanelClass = "overflow-hidden rounded-xl border border-[#e1eaf6] bg-white shadow-[0_5px_14px_rgba(26,73,124,0.04)]";

type MetricProps = {
  label: string;
  value: string;
  href: string;
  action: string;
  tone: "green" | "blue" | "gold" | "purple";
};
function Metric({ label, value, href, action, tone }: MetricProps) {
  return (
    <div className={`${cardClass} min-h-[8.5rem]`}>
      <div className="flex items-start gap-3">
        <MetricIcon tone={tone} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#536f98]">{label}</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-[#0d315d]">
            {value}
          </p>
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline"
          >
            {action} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlatformMark({ platform }: { platform: "shopee" | "tiktok" }) {
  return (
    <span
      aria-label={platformLabel[platform]}
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md shadow-[0_2px_4px_rgba(20,51,93,0.12)] ${platform === "shopee" ? "bg-[#ee4d2d]" : "bg-[#090b0f]"}`}
    >
      {platform === "shopee" ? (
        <ShopeeIcon className="h-3.5 w-3.5" white />
      ) : (
        <TikTokIcon className="h-4 w-4" />
      )}
    </span>
  );
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ url?: string; intent?: string; q?: string; trang?: string; linkPage?: string; sort?: string; dir?: string; platform?: string }> }) {
  const { url: prefillUrl, intent, q, trang, linkPage: legacyLinkPage, sort, dir, platform } = await searchParams;
  const user = await requireUser();
  const [linkSummary, orderRows] = await Promise.all([
    db
      .select({
        total: count(),
        clicks: sql<number>`coalesce(sum(${affiliateLinks.clicks}), 0)::int`,
      })
      .from(affiliateLinks)
      .where(eq(affiliateLinks.userId, user.id)),
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.orderedAt))
      .limit(20),
  ]);
  const totalLinks = linkSummary[0]?.total ?? 0;
  const linkConditions = [eq(affiliateLinks.userId, user.id)];
  const searchTerm = q?.trim();
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    const searchCondition = or(
      ilike(affiliateLinks.title, pattern),
      ilike(affiliateLinks.originalUrl, pattern),
      ilike(affiliateLinks.shortCode, pattern),
    );
    if (searchCondition) linkConditions.push(searchCondition);
  }
  const selectedPlatform = platform === "shopee" || platform === "tiktok" ? platform : "";
  if (selectedPlatform) linkConditions.push(eq(affiliateLinks.platform, selectedPlatform));
  const filteredLinkSummary = await db
    .select({ total: count() })
    .from(affiliateLinks)
    .where(and(...linkConditions));
  const filteredLinkCount = filteredLinkSummary[0]?.total ?? 0;
  const linkPages = Math.max(1, Math.ceil(filteredLinkCount / LINKS_PER_PAGE));
  const linkPage = Math.min(Math.max(1, Number(trang ?? legacyLinkPage) || 1), linkPages);
  const descending = dir !== "asc";
  const orderBy = sort === "title"
    ? [descending ? desc(affiliateLinks.title) : asc(affiliateLinks.title), desc(affiliateLinks.createdAt)]
    : sort === "platform"
      ? [descending ? desc(affiliateLinks.platform) : asc(affiliateLinks.platform), desc(affiliateLinks.createdAt)]
      : sort === "clicks"
        ? [descending ? desc(affiliateLinks.clicks) : asc(affiliateLinks.clicks), desc(affiliateLinks.createdAt)]
        : [descending ? desc(affiliateLinks.createdAt) : asc(affiliateLinks.createdAt)];
  const links = await db
    .select()
    .from(affiliateLinks)
    .where(and(...linkConditions))
    .orderBy(...orderBy)
    .limit(LINKS_PER_PAGE)
    .offset((linkPage - 1) * LINKS_PER_PAGE);
  const pending = orderRows
    .filter(
      (order) => order.status === "pending" || order.status === "confirmed",
    )
    .reduce((sum, order) => sum + order.cashbackAmount, 0);
  const clicks = linkSummary[0]?.clicks ?? 0;
  const recentOrders = orderRows.slice(0, 5);
  const baseUrl = await getRequestBaseUrl();
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <section className="ww-dashboard-link-banner relative isolate overflow-hidden rounded-xl px-5 py-6 text-white shadow-[0_8px_24px_rgba(9,54,95,0.14)] sm:h-[13.5rem] sm:px-7">
        <Image
          src="/images/dashboard-overview-banner-v9.png"
          alt=""
          width={1792}
          height={1024}
          priority
          sizes="(max-width: 1280px) 0px, 470px"
          className="pointer-events-none absolute right-8 top-1/2 z-0 hidden h-[15rem] w-auto max-w-none -translate-y-1/2 [mask-image:linear-gradient(90deg,transparent_0%,black_38%)] xl:block"
        />
        <div className="relative z-10 max-w-[44rem]">
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl">
            <span className="text-[#d7fb76]">✦</span> Nhập link sản phẩm để nhận
            hoàn tiền
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a3159] px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#ee4d2d] shadow-[0_2px_5px_rgba(238,77,45,0.38)]">
                <ShopeeIcon className="h-3 w-3" white />
              </span>
              Shopee
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a3159] px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#090b0f] shadow-[0_2px_5px_rgba(0,0,0,0.36)]">
                <TikTokIcon className="h-3.5 w-3.5" />
              </span>
              TikTok Shop
            </span>
          </div>
          <div id="tao-link" className="mt-3 max-w-[44rem] scroll-mt-6">
            <CreateLinkForm defaultUrl={prefillUrl} autoIntent={intent} />
          </div>
          <p className="mt-2 text-xs text-white/65">
            Hướng dẫn: Dán link → Mua hàng → Nhận hoàn tiền vào ví
          </p>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Số dư hoàn tiền"
          value={formatVnd(user.balance)}
          href="/dashboard/vi"
          action="Rút tiền"
          tone="green"
        />
        <Metric
          label="Đơn hàng đã mua"
          value={String(orderRows.length)}
          href="/dashboard/don-hang"
          action="Xem chi tiết"
          tone="blue"
        />
        <Metric
          label="Tổng tiền hoàn tạm tính"
          value={formatVnd(pending)}
          href="/dashboard/don-hang?status=waiting"
          action="Xem chi tiết"
          tone="gold"
        />
        <Metric
          label="Lượt truy cập qua link"
          value={String(clicks)}
          href="#link-cua-ban"
          action="Xem ngay"
          tone="purple"
        />
      </section>

      <section className="mt-5 grid items-start gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(19rem,1fr)]">
        <div className={recentPanelClass}>
          <div className="flex items-center justify-between border-b border-[#e8eef6] px-4 py-3 sm:px-5">
            <h2 className={sectionTitleClass}>Đơn hàng gần đây</h2>
            <Link
              href="/dashboard/don-hang"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-3 sm:p-4">
              <Empty compact text="Chưa có đơn hàng nào. Hãy tạo link hoàn tiền để bắt đầu." />
            </div>
          ) : (
            <RecentOrdersTable rows={recentOrders.map((order) => ({
              id: order.id,
              platform: order.platform,
              externalOrderId: order.externalOrderId,
              orderedAt: order.orderedAt.toISOString(),
              orderAmount: order.orderAmount,
              cashbackAmount: order.cashbackAmount,
              status: order.status,
            }))} />
          )}
        </div>
        <aside className={recentPanelClass}>
          <div className="flex items-center justify-between border-b border-[#e8eef6] px-4 py-3 sm:px-5">
            <h2 className={sectionTitleClass}>Giao dịch gần đây</h2>
            <Link
              href="/dashboard/vi"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-3 sm:p-4">
              <Empty compact text="Các giao dịch hoàn tiền sẽ hiển thị tại đây." />
            </div>
          ) : (
            <div className="divide-y divide-[#edf1f7] px-4 sm:px-5">
              {recentOrders.map((order) => (
                <Link key={order.id} href={`/dashboard/don-hang/${order.id}`} className="flex items-center gap-3 py-3 hover:bg-[#f6faff]">
                  <PlatformMark platform={order.platform} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-[#244a7c]">
                      {platformLabel[order.platform]}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-[#6681a7]">
                      Đơn #{order.externalOrderId}
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#168146]">
                    + {formatVnd(order.cashbackAmount)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section id="link-cua-ban" className="mt-5 scroll-mt-6">
        <div className={`${cardClass} overflow-hidden p-0`}>
          <div className="flex items-center justify-between gap-3 border-b border-[#e8eef6] px-4 py-4 sm:px-5">
            <h2 className={sectionTitleClass}>Link của bạn</h2>
            <span className="text-xs font-semibold text-[#6681a7]">
              {totalLinks} link
            </span>
          </div>
          {totalLinks === 0 ? (
            <div className="p-5">
              <Empty text="Chưa có link nào. Dán link sản phẩm ở trên để tạo link hoàn tiền." />
            </div>
          ) : (
            <MyLinksTable
              rows={links.map((link) => ({
                id: link.id,
                shortCode: link.shortCode,
                title: link.title,
                originalUrl: link.originalUrl,
                platform: link.platform,
                clicks: link.clicks,
                createdAt: link.createdAt.toISOString(),
              }))}
              total={filteredLinkCount}
              page={linkPage}
              baseUrl={baseUrl}
            />
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:items-stretch xl:grid-cols-[minmax(0,1.9fr)_minmax(19rem,1fr)]">
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            3 bước đơn giản để nhận hoàn tiền
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-0">
            <li className="relative flex items-start gap-4 sm:pr-7 after:absolute after:-right-3 after:top-2 after:hidden after:h-[5.75rem] after:w-px after:bg-[#e3ebf5] sm:after:block">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center [&_svg]:h-16 [&_svg]:w-16">
                <StepIcon tone="link" />
              </span>
              <div className="pt-1.5">
                <b className="text-sm font-bold text-[#173c6d]">Dán link sản phẩm</b>
                <p className="mt-3 text-xs leading-5 text-[#6681a7]">
                  Sao chép link từ Shopee, TikTok Shop.
                </p>
              </div>
            </li>
            <li className="relative flex items-start gap-4 sm:px-10 after:absolute after:-right-3 after:top-2 after:hidden after:h-[5.75rem] after:w-px after:bg-[#e3ebf5] sm:after:block">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center [&_svg]:h-16 [&_svg]:w-16">
                <StepIcon tone="cart" />
              </span>
              <div className="pt-1.5">
                <b className="text-sm font-bold text-[#173c6d]">Mua hàng</b>
                <p className="mt-3 text-xs leading-5 text-[#6681a7]">
                  Mua hàng như bình thường.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4 sm:pl-10">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center [&_svg]:h-16 [&_svg]:w-16">
                <StepIcon tone="cashback" />
              </span>
              <div className="pt-1.5">
                <b className="text-sm font-bold text-[#173c6d]">Nhận hoàn tiền</b>
                <p className="mt-3 text-xs leading-5 text-[#6681a7]">
                  Theo dõi đơn hàng và rút tiền về ví.
                </p>
              </div>
            </li>
          </ol>
        </div>
        <div className="relative min-h-40 overflow-hidden rounded-xl bg-[#062c52] p-5 text-white xl:h-full">
          <Image
            src="/images/dashboard-overview-wallet-promo-v4.png"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 25rem"
            className="object-cover object-center"
          />
          <div className="relative z-10 max-w-[11rem]">
            <p className="text-lg font-black leading-tight">
              Nhận hoàn tiền <span className="text-[#d7fb76]">lên đến 10%</span>
            </p>
            <Link
              href="#tao-link"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#b7e961] px-4 py-2 text-xs font-bold text-[#123758]"
            >
              Xem ngay <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
