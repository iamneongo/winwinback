"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { BrandLogo } from "@/components/BrandLogo";
import {
  customerNav,
  adminNav,
  customerAdminLink,
  type NavItem,
} from "@/components/dashboard/nav";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function Sidebar({
  variant = "customer",
  showAdminLink = false,
}: {
  variant?: "customer" | "admin";
  showAdminLink?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items: NavItem[] =
    variant === "admin"
      ? adminNav
      : showAdminLink
        ? [...customerNav, customerAdminLink]
        : customerNav;
  const homeHref = variant === "admin" ? "/admin" : "/dashboard";
  return (
    <SidebarRoot
      collapsible="icon"
      className="ww-sidebar-shell border-r border-sidebar-border text-white"
    >
      <SidebarHeader className="overflow-hidden px-3 pt-5 pb-0">
        {/* Constant padding => the mark never moves; only the name fades. */}
        <Link
          href={homeHref}
          aria-label={variant === "admin" ? "Win-Win Back Admin" : "Win-Win Back"}
          className="flex w-full items-center overflow-hidden px-0 py-2"
        >
          <BrandLogo
            light
            subtitle={variant === "admin" ? "Admin" : undefined}
            className="[&>span:last-child]:transition-opacity [&>span:last-child]:duration-200 group-data-[collapsible=icon]:[&>span:last-child]:opacity-0"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-6 pb-5">
        <SidebarMenu className="gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  className={`h-10 rounded-lg px-2 text-[13px] font-semibold text-white/75 [&_svg]:size-[18px] hover:bg-white/7 hover:text-white data-active:bg-[#b7e961]/18 data-active:text-[#d9fb89] ${active ? "ring-1 ring-inset ring-[#b7e961]/25" : ""}`}
                  render={
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    />
                  }
                >
                  <Icon strokeWidth={2} />
                  <span className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
                    {item.label}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        {/* Promo lives in the scrollable content, pinned to the bottom via
            mt-auto, so it scrolls into view on short screens instead of the
            old height-based display:none. Hidden only in the icon rail. */}
        <div className="ww-sidebar-promo relative mt-auto h-56 shrink-0 overflow-hidden rounded-2xl bg-[#062c52] p-4 transition-opacity duration-200 group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:opacity-0">
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
      </SidebarContent>
      <SidebarFooter className="overflow-hidden px-3 pt-0 pb-5">
        <div className="ww-sidebar-logout shrink-0">
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="flex h-11 w-full items-center gap-3 overflow-hidden whitespace-nowrap rounded-xl px-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/8 hover:text-white"
          >
            <LogOut className="size-[18px] shrink-0" />
            <span className="transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
              Đăng xuất
            </span>
          </button>
        </div>
      </SidebarFooter>
    </SidebarRoot>
  );
}
