"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dock as MagicDock, DockIcon } from "@/components/ui/dock";
import glassNavStyles from "@/components/sections/NavBar.module.css";
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
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-2 lg:hidden">
      <nav aria-label="Điều hướng dashboard" className="pointer-events-auto max-w-full">
        <MagicDock
          iconSize={54}
          iconMagnification={60}
          iconDistance={100}
          className="mt-0 h-[72px] max-w-full gap-0 rounded-full border-white/85 bg-[linear-gradient(180deg,rgba(181,226,249,0.78),rgba(219,244,252,0.94))] px-1.5 shadow-[inset_0_2px_0_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(92,184,215,0.18),0_4px_12px_rgba(38,129,175,0.16)] backdrop-blur-xl min-[360px]:gap-1.5"
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <DockIcon
                key={item.href}
                width={active ? 72 : 54}
                className={`relative shrink-0 !rounded-full ${glassNavStyles.navLink} ${active ? `${glassNavStyles.active} text-[#188437]` : "text-[#285577]"}`}
              >
                <Link
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#188437] focus-visible:ring-offset-2"
                >
                  <Icon className="size-[21px] shrink-0" aria-hidden="true" />
                  <span className={`max-w-full text-center text-[10px] font-semibold leading-[10px] tracking-tight ${active ? "whitespace-nowrap text-[#0d315d]" : "text-[#315a78]"}`} aria-hidden="true">
                    {item.short ?? item.label}
                  </span>
                </Link>
              </DockIcon>
            );
          })}
        </MagicDock>
      </nav>
    </div>
  );
}
