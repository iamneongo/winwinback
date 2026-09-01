import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  List,
} from "lucide-react";
import { db } from "@/db";
import { affiliateLinks, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { CreateLinkForm } from "@/components/dashboard/CreateLinkForm";
import { Empty, cardClass, sectionTitleClass } from "@/components/dashboard/ui";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { MetricIcon, StepIcon } from "@/components/dashboard/MetricIcon";
import { ShopeeIcon, TikTokIcon } from "@/components/sections/BrandIcons";

export const metadata = { title: "Tổng quan — Win-Win Back" };
export const dynamic = "force-dynamic";

type MetricProps = {
  label: string;
  value: string;
  href: string;
  action: string;
  tone: "green" | "blue" | "gold" | "purple";
};
const platformTone: Record<string, string> = {
  shopee: "bg-[#fff0e8] text-[#ee6031]",
  tiktok: "bg-[#eef0ff] text-[#3d4aca]",
};
const orderStateTone: Record<string, string> = {
  pending: "bg-[#fff5df] text-[#d88700]",
  confirmed: "bg-[#e7f7ef] text-[#168146]",
  completed: "bg-[#e7f7ef] text-[#168146]",
  cancelled: "bg-[#fee9e8] text-[#d34843]",
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

function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${platformTone[platform] ?? "bg-[#eef4fc] text-[#315a90]"}`}
    >
      {platformLabel[platform]}
    </span>
  );
}

export default async function OverviewPage() {
  const user = await requireUser();
  const [links, orderRows] = await Promise.all([
    db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.userId, user.id))
      .orderBy(desc(affiliateLinks.createdAt))
      .limit(20),
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.orderedAt))
      .limit(20),
  ]);
  const pending = orderRows
    .filter(
      (order) => order.status === "pending" || order.status === "confirmed",
    )
    .reduce((sum, order) => sum + order.cashbackAmount, 0);
  const clicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const recentOrders = orderRows.slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-6 lg:pb-8 lg:pt-0">
      <section className="ww-dashboard-link-banner relative isolate overflow-hidden rounded-xl px-5 py-6 text-white shadow-[0_8px_24px_rgba(9,54,95,0.14)] sm:h-[13.5rem] sm:px-7">
        <div aria-hidden="true" className="pointer-events-none absolute right-[29%] top-5 hidden text-xl text-[#d9fb89]/80 sm:block">✦</div>
        <div aria-hidden="true" className="pointer-events-none absolute bottom-5 right-[35%] hidden text-sm text-[#f6c94c]/80 sm:block">✦</div>
        <div aria-hidden="true" className="pointer-events-none absolute right-[24%] top-16 hidden h-1.5 w-1.5 rounded-full bg-[#b7e961]/80 sm:block" />
        <div className="pointer-events-none absolute right-40 top-0 hidden h-[calc(100%+7rem)] w-[31%] sm:block">
          <Image
            src="/images/dashboard-overview-mascot-banner-v5.png"
            alt=""
            fill
            priority
            sizes="31vw"
            className="object-contain object-right"
          />
        </div>
        <div className="relative z-10 max-w-[44rem]">
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl">
            <span className="text-[#d7fb76]">✦</span> Nhập link sản phẩm để nhận
            hoàn tiền
          </h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <ShopeeIcon className="h-4 w-4" white />
              Shopee
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
              <TikTokIcon className="h-4 w-4" white />
              TikTok Shop
            </span>
          </div>
          <div id="tao-link" className="mt-3 max-w-[44rem] scroll-mt-6">
            <CreateLinkForm />
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

      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(19rem,1fr)]">
        <div className={`${cardClass} overflow-hidden p-0`}>
          <div className="flex items-center justify-between border-b border-[#e8eef6] px-4 py-4 sm:px-5">
            <h2 className={sectionTitleClass}>Đơn hàng gần đây</h2>
            <Link
              href="/dashboard/don-hang"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-5">
              <Empty text="Chưa có đơn hàng nào. Hãy tạo link hoàn tiền để bắt đầu." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="bg-[#f7faff] text-xs text-[#536f98]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Sàn</th>
                    <th className="px-4 py-3 font-semibold">Mã đơn hàng</th>
                    <th className="px-4 py-3 font-semibold">Ngày mua</th>
                    <th className="px-4 py-3 font-semibold">Giá trị đơn</th>
                    <th className="px-4 py-3 font-semibold">Hoàn tiền</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1f7]">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-5 py-3.5">
                        <PlatformBadge platform={order.platform} />
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#49688f]">
                        #{order.externalOrderId}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[#58759c]">
                        {order.orderedAt.toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[#173861]">
                        {formatVnd(order.orderAmount)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#168146]">
                        {formatVnd(order.cashbackAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orderStateTone[order.status]}`}
                        >
                          {orderStatusLabel[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <aside className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className={sectionTitleClass}>Giao dịch gần đây</h2>
            <Link
              href="/dashboard/vi"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="mt-4">
              <Empty text="Các giao dịch hoàn tiền sẽ hiển thị tại đây." />
            </div>
          ) : (
            <div className="mt-3 divide-y divide-[#edf1f7]">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 py-3">
                  <PlatformBadge platform={order.platform} />
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
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="mt-4 grid gap-4 xl:items-start xl:grid-cols-[minmax(0,1.9fr)_minmax(19rem,1fr)]">
        <div className={cardClass}>
          <h2 className={sectionTitleClass}>
            3 bước đơn giản để nhận hoàn tiền
          </h2>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            <li className="flex gap-3 sm:block">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                <StepIcon tone="link" />
                <span className="absolute -bottom-1 left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-[#58bf2d] text-[8px] font-black text-white">1</span>
              </span>
              <div className="sm:mt-3">
                <b className="text-sm text-[#244a7c]">Dán link sản phẩm</b>
                <p className="mt-1 text-xs leading-5 text-[#6681a7]">
                  Sao chép link từ Shopee hoặc TikTok Shop.
                </p>
              </div>
            </li>
            <li className="flex gap-3 sm:block">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                <StepIcon tone="cart" />
                <span className="absolute -bottom-1 left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-[#287be5] text-[8px] font-black text-white">2</span>
              </span>
              <div className="sm:mt-3">
                <b className="text-sm text-[#244a7c]">Mua hàng</b>
                <p className="mt-1 text-xs leading-5 text-[#6681a7]">
                  Mua hàng như bình thường qua link đã tạo.
                </p>
              </div>
            </li>
            <li className="flex gap-3 sm:block">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                <StepIcon tone="cashback" />
                <span className="absolute -bottom-1 left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full bg-[#9d52dd] text-[8px] font-black text-white">3</span>
              </span>
              <div className="sm:mt-3">
                <b className="text-sm text-[#244a7c]">Nhận hoàn tiền</b>
                <p className="mt-1 text-xs leading-5 text-[#6681a7]">
                  Theo dõi đơn hàng và rút tiền về ví.
                </p>
              </div>
            </li>
          </ol>
        </div>
        <div className="relative min-h-32 overflow-hidden rounded-xl bg-[#062c52] p-5 text-white">
          <Image
            src="/images/dashboard-wallet-promo-v3.png"
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
