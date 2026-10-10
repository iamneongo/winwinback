import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bell,
  Check,
  Coins,
  Gift,
  Info,
  Package,
  RotateCcw,
} from "lucide-react";
import type { Notification } from "@/db/schema";
import type { NotificationFilter } from "@/lib/notifications";
import { MarkAllNotificationsRead } from "@/components/dashboard/NotificationActions";

const notificationMeta = {
  cashback: { label: "Hoàn tiền", Icon: Coins, tone: "bg-[#e8f8eb] text-[#168146]" },
  cashback_reversed: { label: "Điều chỉnh hoàn tiền", Icon: RotateCcw, tone: "bg-[#fff3dc] text-[#b7791f]" },
  withdrawal: { label: "Rút tiền", Icon: Banknote, tone: "bg-[#eef4ff] text-[#1766e7]" },
  withdrawal_request: { label: "Yêu cầu rút tiền", Icon: ArrowDownLeft, tone: "bg-[#fff3dc] text-[#b7791f]" },
  order: { label: "Đơn hàng", Icon: Package, tone: "bg-[#f0ecff] text-[#6b4de0]" },
  reward: { label: "Phần thưởng", Icon: Gift, tone: "bg-[#eafbe0] text-[#3f8a2e]" },
  system: { label: "Hệ thống", Icon: Info, tone: "bg-[#eef2f8] text-[#526b90]" },
} as const;

const filterOptions: { label: string; value: NotificationFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Chưa đọc", value: "unread" },
  { label: "Hoàn tiền", value: "cashback" },
  { label: "Điều chỉnh", value: "cashback_reversed" },
  { label: "Rút tiền", value: "withdrawal" },
  { label: "Yêu cầu rút", value: "withdrawal_request" },
  { label: "Đơn hàng", value: "order" },
  { label: "Phần thưởng", value: "reward" },
  { label: "Hệ thống", value: "system" },
];

function formatDate(date: Date) {
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function safeInternalHref(href: string | null) {
  return href?.startsWith("/") && !href.startsWith("//") ? href : null;
}

export function NotificationsInbox({
  basePath,
  items,
  total,
  unreadCount,
  page,
  pages,
  filter,
}: {
  basePath: "/dashboard/thong-bao" | "/admin/thong-bao";
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
  filter: NotificationFilter;
}) {
  const adminView = basePath.startsWith("/admin");
  return (
    <main className="mx-auto w-full min-w-0 max-w-[1100px] px-4 py-5 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`text-2xl font-black tracking-tight text-[#11335e] sm:text-[28px] ${adminView ? "lg:hidden" : ""}`}>Thông báo</h1>
          <p className="mt-1 text-sm leading-6 text-[#58749a]">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc.` : "Cập nhật mới nhất về đơn hàng, hoàn tiền và tài khoản của bạn."}
          </p>
        </div>
        <MarkAllNotificationsRead unreadCount={unreadCount} />
      </header>

      <section className="overflow-hidden rounded-xl border border-[#e1eaf6] bg-white">
        <nav aria-label="Lọc thông báo" className="flex gap-2 overflow-x-auto border-b border-[#e8eef6] px-3 py-3 sm:px-4">
          {filterOptions.map((option) => {
            const active = filter === option.value;
            const href = option.value === "all" ? basePath : `${basePath}?filter=${option.value}`;
            return (
              <Link
                key={option.value}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${active ? "border-[#9bdc4e] bg-[#effbdc] text-[#376f1d]" : "border-[#e2eaf5] text-[#567397] hover:bg-[#f6f9fd]"}`}
              >
                {option.label}
              </Link>
            );
          })}
        </nav>

        {items.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-[#f0f5fb] text-[#6681a7]"><Bell className="size-5" /></span>
            <h2 className="mt-4 text-sm font-bold text-[#173861]">{filter === "unread" ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo"}</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-[#6681a7]">Các cập nhật mới sẽ xuất hiện tại đây khi có hoạt động trên tài khoản của bạn.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#edf1f7]">
            {items.map((item) => {
              const meta = notificationMeta[item.type as keyof typeof notificationMeta] ?? notificationMeta.system;
              const href = safeInternalHref(item.href);
              const detailHref = `${basePath}/${item.id}`;
              return (
                <li key={item.id} className={`relative px-4 py-4 transition-colors sm:px-5 ${item.readAt ? "bg-white" : "bg-[#f7fbff]"}`}>
                  {!item.readAt && <span className="absolute inset-y-0 left-0 w-1 bg-[#a5df54]" aria-label="Chưa đọc" />}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-full ${meta.tone}`}><meta.Icon className="size-[18px]" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={detailHref} className="min-w-0 text-sm font-bold leading-5 text-[#173861] hover:text-[#1766e7]">{item.title}</Link>
                        {!item.readAt && <span className="rounded-full bg-[#eaf7d9] px-2 py-0.5 text-[10px] font-bold text-[#477e20]">Mới</span>}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#58749a]">{item.body}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8196b2]">
                        <span>{formatDate(item.createdAt)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{meta.label}</span>
                        {href && <Link className="font-bold text-[#1766e7] hover:underline" href={detailHref}>Xem chi tiết</Link>}
                      </div>
                    </div>
                    <Link href={detailHref} aria-label={`Mở thông báo: ${item.title}`} className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-[#6d87a8] hover:bg-[#edf4fc] hover:text-[#1766e7]"><ArrowRight className="size-4" /></Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <footer className="flex flex-col gap-3 border-t border-[#e8eef6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-[#7188a6]">{total === 0 ? "0 thông báo" : `${(page - 1) * 20 + 1}–${Math.min(page * 20, total)} / ${total} thông báo`}</p>
          <div className="flex items-center gap-2">
            <Link
              href={`${basePath}?page=${Math.max(1, page - 1)}${filter === "all" ? "" : `&filter=${filter}`}`}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
              className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs font-bold ${page <= 1 ? "pointer-events-none border-[#edf1f7] text-[#a5b4c8]" : "border-[#dbe7f6] text-[#315a90] hover:bg-[#f2f7fd]"}`}
            ><ArrowLeft className="size-3.5" /> Trước</Link>
            <span className="min-w-14 text-center text-xs font-semibold text-[#6681a7]">{page} / {pages}</span>
            <Link
              href={`${basePath}?page=${Math.min(pages, page + 1)}${filter === "all" ? "" : `&filter=${filter}`}`}
              aria-disabled={page >= pages}
              tabIndex={page >= pages ? -1 : undefined}
              className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-xs font-bold ${page >= pages ? "pointer-events-none border-[#edf1f7] text-[#a5b4c8]" : "border-[#dbe7f6] text-[#315a90] hover:bg-[#f2f7fd]"}`}
            >Sau <ArrowRight className="size-3.5" /></Link>
          </div>
        </footer>
      </section>
    </main>
  );
}

export function NotificationDetail({
  item,
  basePath,
}: {
  item: Notification;
  basePath: "/dashboard/thong-bao" | "/admin/thong-bao";
}) {
  const meta = notificationMeta[item.type as keyof typeof notificationMeta] ?? notificationMeta.system;
  const href = safeInternalHref(item.href);
  return (
    <main className="mx-auto w-full min-w-0 max-w-[900px] px-4 py-5 sm:px-7 lg:px-8 lg:py-7">
      <Link href={basePath} className="inline-flex items-center gap-2 text-sm font-bold text-[#52749e] hover:text-[#1766e7]"><ArrowLeft className="size-4" /> Tất cả thông báo</Link>
      <article className="mt-4 overflow-hidden rounded-xl border border-[#e1eaf6] bg-white">
        <header className="flex items-start gap-4 border-b border-[#e8eef6] px-5 py-5 sm:px-7 sm:py-6">
          <span className={`grid size-11 shrink-0 place-items-center rounded-full ${meta.tone}`}><meta.Icon className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-[#6681a7]">{meta.label}</span>
            <h1 className="mt-1 break-words text-xl font-black leading-snug tracking-tight text-[#11335e] sm:text-2xl">{item.title}</h1>
            <p className="mt-2 text-xs text-[#8196b2]">{formatDate(item.createdAt)}</p>
          </div>
          {item.readAt && <span className="hidden shrink-0 items-center gap-1 rounded-full bg-[#f1f5fa] px-2.5 py-1 text-[11px] font-semibold text-[#6681a7] sm:inline-flex"><Check className="size-3.5" /> Đã đọc</span>}
        </header>
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#34577f]">{item.body}</p>
          {href && <Link href={href} className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#b7e961] px-4 text-sm font-bold text-[#173b5e] shadow-[0_3px_8px_rgba(142,198,63,0.22)] transition-colors hover:bg-[#a8dd4c]">Đi tới nội dung liên quan <ArrowRight className="size-4" /></Link>}
        </div>
      </article>
    </main>
  );
}
