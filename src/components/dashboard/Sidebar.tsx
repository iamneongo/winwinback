"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogOut,
  Settings,
  ShoppingBag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { logoutAction } from "@/app/(auth)/actions";
import { BrandLogo } from "@/components/BrandLogo";

type NavigationItem = {
  href: string;
  icon: LucideIcon;
  label: string;
  exact?: boolean;
};
const navigation: NavigationItem[] = [
  { href: "/dashboard", icon: Home, label: "Tổng quan", exact: true },
  { href: "/dashboard/don-hang", icon: ShoppingBag, label: "Đơn hàng của tôi" },
  { href: "/dashboard/vi", icon: Wallet, label: "Ví hoàn tiền" },
  { href: "/dashboard/tai-khoan", icon: Settings, label: "Cài đặt" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="ww-sidebar fixed inset-y-0 left-0 z-30 hidden h-screen w-64 flex-col overflow-hidden border-r border-white/5 p-5 text-white lg:flex">
      <Link href="/dashboard" className="px-2 py-2">
        <BrandLogo light />
      </Link>
      <nav aria-label="Điều hướng chính" className="mt-7 space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center gap-2.5 rounded-lg px-3.5 text-[13px] font-semibold transition-colors ${active ? "bg-[#b7e961]/18 text-[#d9fb89] ring-1 ring-inset ring-[#b7e961]/25" : "text-white/75 hover:bg-white/7 hover:text-white"}`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="ww-sidebar-promo relative mt-auto h-56 shrink-0 overflow-hidden rounded-2xl bg-[#062c52] p-4">
        <Image
          src="/images/dashboard-sidebar-mascot-v2.png"
          alt=""
          fill
          sizes="17rem"
          className="object-cover object-bottom"
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#062c52] via-[#062c52]/90 to-transparent" />
        <div className="relative z-10 max-w-[11rem]">
          <p className="text-base font-bold">Mua sắm thông minh</p>
          <p className="mt-0.5 font-bold text-[#d9fb89]">Hoàn tiền thật</p>
        </div>
      </div>
      <form action={logoutAction} className="ww-sidebar-logout mt-3 shrink-0">
        <button
          type="submit"
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-white/75 transition-colors hover:bg-white/8 hover:text-white"
        >
          <LogOut className="h-5 w-5" /> Đăng xuất
        </button>
      </form>
    </aside>
  );
}
