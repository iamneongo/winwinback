"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Wallet,
  User,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

interface DockItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const ITEMS: DockItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: Home, exact: true },
  { href: "/dashboard/don-hang", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/dashboard/vi", label: "Ví của bạn", icon: Wallet },
  { href: "/dashboard/tai-khoan", label: "Tài khoản", icon: User },
];

// Proximity magnification tuning (macOS-dock feel).
const MAX_SCALE = 0.9;
const LIFT = 12;
const SIGMA = 58;

function isActive(pathname: string, item: DockItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

export function Dock({ role }: { role: "user" | "admin" }) {
  const pathname = usePathname();
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const magnify = useCallback((cursorX: number | null) => {
    iconRefs.current.forEach((el) => {
      if (!el) return;
      if (cursorX === null || reduced.current) {
        el.style.transform = "translateY(0) scale(1)";
        return;
      }
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = cursorX - center;
      const influence = Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
      el.style.transform = `translateY(${-LIFT * influence}px) scale(${
        1 + MAX_SCALE * influence
      })`;
    });
  }, []);

  const iconClass = (active: boolean) =>
    `ww-dock-icon flex h-11 w-11 items-center justify-center rounded-2xl border ${
      active
        ? "border-[#b7e961]/60 bg-[#b7e961] text-[#0a2438]"
        : "border-white/10 bg-white/5 text-white/70 group-hover:text-white"
    }`;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <nav
        aria-label="Điều hướng"
        onPointerMove={(e) => magnify(e.clientX)}
        onPointerLeave={() => magnify(null)}
        className="ww-dock pointer-events-auto flex items-end gap-1 rounded-[26px] border border-white/12 px-3 py-2.5 sm:gap-1.5 sm:px-4"
      >
        {ITEMS.map((item, i) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="ww-dock-item group relative flex flex-col items-center"
            >
              <span className="ww-dock-tip">{item.label}</span>
              <span
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                className={iconClass(active)}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
              </span>
              <span
                className={`mt-1.5 h-1 w-1 rounded-full transition-all duration-300 ${
                  active ? "bg-[#b7e961] opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        })}

        <span
          className="mx-1 h-8 w-px self-center bg-white/10"
          aria-hidden="true"
        />

        {role === "admin" && (
          <a
            href="/admin"
            aria-label="Quản trị"
            className="ww-dock-item group relative flex flex-col items-center"
          >
            <span className="ww-dock-tip">Quản trị</span>
            <span
              ref={(el) => {
                iconRefs.current[ITEMS.length] = el;
              }}
              className="ww-dock-icon flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 group-hover:text-white"
            >
              <ShieldCheck className="h-[19px] w-[19px]" strokeWidth={2.1} />
            </span>
            <span className="mt-1.5 h-1 w-1 opacity-0" aria-hidden="true" />
          </a>
        )}

        <form action={logoutAction} className="flex">
          <button
            type="submit"
            aria-label="Đăng xuất"
            className="ww-dock-item group relative flex flex-col items-center"
          >
            <span className="ww-dock-tip">Đăng xuất</span>
            <span
              ref={(el) => {
                iconRefs.current[ITEMS.length + 1] = el;
              }}
              className="ww-dock-icon flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 group-hover:border-red-300/40 group-hover:text-red-200"
            >
              <LogOut className="h-[19px] w-[19px]" strokeWidth={2.1} />
            </span>
            <span className="mt-1.5 h-1 w-1 opacity-0" aria-hidden="true" />
          </button>
        </form>
      </nav>
    </div>
  );
}
