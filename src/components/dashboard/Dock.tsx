"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  Link2,
  List,
  ShoppingBag,
  Wallet,
  ArrowDownToLine,
  ShieldCheck,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";

interface DockItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const ITEMS: DockItem[] = [
  { id: "tong-quan", label: "Tổng quan", icon: Home },
  { id: "tao-link", label: "Tạo link", icon: Link2 },
  { id: "link-cua-ban", label: "Link của bạn", icon: List },
  { id: "don-hang", label: "Đơn hàng", icon: ShoppingBag },
  { id: "vi", label: "Ví của bạn", icon: Wallet },
  { id: "rut-tien", label: "Rút tiền", icon: ArrowDownToLine },
];

// Proximity magnification tuning (macOS-dock feel).
const MAX_SCALE = 0.9; // extra scale at the cursor's focus
const LIFT = 12; // px the focused icon rises
const SIGMA = 58; // px falloff radius of the magnification

export function Dock({ role }: { role: "user" | "admin" }) {
  const items = ITEMS;
  const iconRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [active, setActive] = useState<string>(items[0]!.id);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Highlight the dock item whose section is centred in the viewport.
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

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
      const scale = 1 + MAX_SCALE * influence;
      const lift = LIFT * influence;
      el.style.transform = `translateY(${-lift}px) scale(${scale})`;
    });
  }, []);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActive(id);
    el.scrollIntoView({
      behavior: reduced.current ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <nav
        aria-label="Điều hướng nhanh"
        onPointerMove={(e) => magnify(e.clientX)}
        onPointerLeave={() => magnify(null)}
        className="ww-dock pointer-events-auto flex items-end gap-1 rounded-[26px] border border-white/12 px-3 py-2.5 sm:gap-1.5 sm:px-4"
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "true" : undefined}
              className="ww-dock-item group relative flex flex-col items-center"
            >
              <span className="ww-dock-tip">{item.label}</span>
              <span
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                className={`ww-dock-icon flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  isActive
                    ? "border-[#b7e961]/60 bg-[#b7e961] text-[#0a2438]"
                    : "border-white/10 bg-white/5 text-white/70 group-hover:text-white"
                }`}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
              </span>
              <span
                className={`mt-1.5 h-1 w-1 rounded-full transition-all duration-300 ${
                  isActive ? "bg-[#b7e961] opacity-100" : "opacity-0"
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}

        <span className="mx-1 h-8 w-px self-center bg-white/10" aria-hidden="true" />

        {role === "admin" && (
          <a
            href="/admin"
            aria-label="Quản trị"
            className="ww-dock-item group relative flex flex-col items-center"
          >
            <span className="ww-dock-tip">Quản trị</span>
            <span
              ref={(el) => {
                iconRefs.current[items.length] = el;
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
                iconRefs.current[items.length + 1] = el;
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
