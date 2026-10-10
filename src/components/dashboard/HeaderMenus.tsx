"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  ShieldCheck,
  Store,
  Coins,
  RotateCcw,
  Banknote,
  Package,
  Info,
  Gift,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type HeaderNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string; // ISO string
};

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  cashback: Coins,
  cashback_reversed: RotateCcw,
  withdrawal: Banknote,
  withdrawal_request: Banknote,
  order: Package,
  reward: Gift,
  system: Info,
};

const typeTone: Record<string, string> = {
  cashback: "bg-[#e8f8eb] text-[#168146]",
  cashback_reversed: "bg-[#fff3dc] text-[#b7791f]",
  withdrawal: "bg-[#eef4ff] text-[#1766e7]",
  withdrawal_request: "bg-[#fff3dc] text-[#b7791f]",
  order: "bg-[#f0ecff] text-[#6b4de0]",
  reward: "bg-[#eafbe0] text-[#3f8a2e]",
  system: "bg-[#eef2f8] text-[#526b90]",
};

/** Format an ISO timestamp as a short Vietnamese relative time. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "vừa xong";
  if (min < 60) return `${min} phút trước`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

/** Interactive header cluster: notifications bell + profile menu. */
export function HeaderMenus({
  name,
  role,
  variant = "customer",
  notifications = [],
  unreadCount = 0,
}: {
  name: string;
  role: "user" | "admin";
  variant?: "customer" | "admin";
  notifications?: HeaderNotification[];
  unreadCount?: number;
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  const router = useRouter();
  const notificationsHref = variant === "admin" ? "/admin/thong-bao" : "/dashboard/thong-bao";
  const [currentNotifications, setCurrentNotifications] = useState(notifications);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);

  useEffect(() => {
    let mounted = true;
    const refreshNotifications = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as {
          unreadCount: number;
          items: HeaderNotification[];
        };
        if (!mounted) return;
        setCurrentNotifications(data.items);
        setCurrentUnreadCount(data.unreadCount);
      } catch {
        // Keep the last good snapshot; the next poll will retry.
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshNotifications();
    };
    const timer = window.setInterval(refreshNotifications, 45_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      mounted = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <>
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label={currentUnreadCount > 0 ? `Thông báo, ${currentUnreadCount} chưa đọc` : "Thông báo"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#315a90] transition-colors hover:bg-[#eef4fc]"
            />
          }
        >
          <Bell className="h-5 w-5" />
          {currentUnreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff5c51]" />
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(22rem,calc(100vw-1.5rem))] gap-0 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[#e8eef6] px-4 py-3">
            <span className="text-sm font-bold text-[#0d315d]">Thông báo</span>
            {currentUnreadCount > 0 && (
              <span className="rounded-full bg-[#ffe9e7] px-2 py-0.5 text-[11px] font-bold text-[#e5484d]">
                {currentUnreadCount} mới
              </span>
            )}
          </div>
          {currentNotifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#6681a7]">
              Bạn chưa có thông báo nào.
            </div>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-[#f0f4fa] overflow-y-auto">
              {currentNotifications.map((n) => {
                const Icon = typeIcon[n.type] ?? Info;
                const tone = typeTone[n.type] ?? typeTone.system;
                return (
                  <li key={n.id}>
                    <Link href={`${notificationsHref}/${n.id}`} className={`flex gap-3 px-4 py-3 transition-colors hover:bg-[#eef4fc] ${n.read ? "" : "bg-[#f5faff]"}`}>
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-5 text-[#0d315d]">
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[#5c7a9c]">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-[#93a6c2]">
                        {relativeTime(n.createdAt)}
                      </p>
                    </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link href={notificationsHref} className="flex h-11 items-center justify-center gap-2 border-t border-[#e8eef6] text-xs font-bold text-[#1766e7] transition-colors hover:bg-[#f6f9fd]">
            Xem tất cả thông báo <ChevronDown className="size-3.5 -rotate-90" />
          </Link>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2 rounded-full text-sm outline-none"
            />
          }
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b7e961] text-sm font-black text-[#0a3b60]">
            {initial}
          </span>
          <span className="hidden max-w-[9rem] min-w-0 text-left leading-4 sm:block">
            <span className="block text-xs text-[#6681a7]">Xin chào,</span>
            <span className="block truncate font-bold text-[#0d315d]" title={name}>{name}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-[#6681a7] sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="min-w-0 px-2 py-1.5 text-left leading-4 sm:hidden">
            <span className="block text-xs text-[#6681a7]">Xin chào,</span>
            <span className="block truncate font-bold text-[#0d315d]" title={name}>{name}</span>
          </div>
          <DropdownMenuSeparator className="sm:hidden" />
          <DropdownMenuItem render={<Link href="/dashboard/tai-khoan" />}>
            <Settings /> Cài đặt
          </DropdownMenuItem>
          {variant === "admin" ? (
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              <Store /> Trang khách hàng
            </DropdownMenuItem>
          ) : (
            role === "admin" && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                <ShieldCheck /> Quản trị
              </DropdownMenuItem>
            )
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            <LogOut /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
