"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  customerMobileNav,
  adminMobileNav,
  type NavItem,
} from "@/components/dashboard/nav";

export function Dock({
  variant = "customer",
}: {
  variant?: "customer" | "admin";
}) {
  const pathname = usePathname();
  const items: NavItem[] = variant === "admin" ? adminMobileNav : customerMobileNav;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4edf8] bg-white/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(13,49,93,0.06)] backdrop-blur lg:hidden">
      <nav
        aria-label="Điều hướng"
        className="mx-auto flex w-full max-w-md items-start justify-around gap-0 overflow-hidden px-2"
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
              <span className="max-w-full truncate">{item.short ?? item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
