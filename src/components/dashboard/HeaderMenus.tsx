"use client";

import { useState, useTransition } from "react";
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
  Banknote,
  Package,
  Info,
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
import { markNotificationsReadAction } from "@/app/notifications/actions";

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
  withdrawal: Banknote,
  withdrawal_request: Banknote,
  order: Package,
  system: Info,
};

const typeTone: Record<string, string> = {
  cashback: "bg-[#e8f8eb] text-[#168146]",
  withdrawal: "bg-[#eef4ff] text-[#1766e7]",
  withdrawal_request: "bg-[#fff3dc] text-[#b7791f]",
  order: "bg-[#f0ecff] text-[#6b4de0]",
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
  const [dotVisible, setDotVisible] = useState(unreadCount > 0);
  const [, startTransition] = useTransition();

  function onBellOpenChange(open: boolean) {
    if (open && unreadCount > 0) {
      // Optimistically clear the dot, then persist + refresh server data.
      setDotVisible(false);
      startTransition(async () => {
        await markNotificationsReadAction();
        router.refresh();
      });
    }
  }

  return (
    <>
      <Popover onOpenChange={onBellOpenChange}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Thông báo"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#315a90] transition-colors hover:bg-[#eef4fc]"
            />
          }
        >
          <Bell className="h-5 w-5" />
          {dotVisible && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff5c51]" />
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[22rem] gap-0 p-0">
          <div className="flex items-center justify-between border-b border-[#e8eef6] px-4 py-3">
            <span className="text-sm font-bold text-[#0d315d]">Thông báo</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#ffe9e7] px-2 py-0.5 text-[11px] font-bold text-[#e5484d]">
                {unreadCount} mới
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#6681a7]">
              Không có thông báo mới
            </div>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-[#f0f4fa] overflow-y-auto">
              {notifications.map((n) => {
                const Icon = typeIcon[n.type] ?? Info;
                const tone = typeTone[n.type] ?? typeTone.system;
                const inner = (
                  <div
                    className={`flex gap-3 px-4 py-3 transition-colors ${n.read ? "" : "bg-[#f5faff]"} ${n.href ? "hover:bg-[#eef4fc]" : ""}`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-5 text-[#0d315d]">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-[#5c7a9c]">
                        {n.body}
                      </p>
                      <p className="mt-1 text-[11px] text-[#93a6c2]">
                        {relativeTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} className="block">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
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
