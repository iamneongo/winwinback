"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type DockItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};
const items: DockItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: Home, exact: true },
  { href: "/dashboard/don-hang", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/dashboard/vi", label: "Ví", icon: Wallet },
  { href: "/dashboard/tai-khoan", label: "Cài đặt", icon: Settings },
];

export function Dock({ role }: { role: "user" | "admin" }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4edf8] bg-white/95 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(13,49,93,0.06)] backdrop-blur lg:hidden">
      <nav
        aria-label="Điều hướng"
        className="mx-auto flex max-w-md items-start justify-center"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 text-[10px] font-semibold ${active ? "text-[#397b1d]" : "text-[#6681a7]"}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${active ? "bg-[#b7e961] text-[#0a3b60] shadow-[0_4px_8px_rgba(142,198,63,0.28)]" : "text-[#6681a7]"}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
        {role === "admin" && (
          <a
            href="/admin"
            aria-label="Quản trị"
            className="flex min-w-0 flex-1 flex-col items-center gap-1 text-[10px] font-semibold text-[#6681a7]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Quản trị
          </a>
        )}
        <div className="flex min-w-0 flex-1">
          <button
            type="button"
            aria-label="Đăng xuất"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="flex w-full flex-col items-center gap-1 text-[10px] font-semibold text-[#6681a7]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-[#6681a7]">
              <LogOut className="h-5 w-5" />
            </span>
            Thoát
          </button>
        </div>
      </nav>
    </div>
  );
}
