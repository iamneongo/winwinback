"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";
import styles from "./Sidebar.module.css";
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
      className="ww-sidebar-shell border-r border-sidebar-border"
    >
      <SidebarHeader className="overflow-hidden px-3 pt-5 pb-0">
        {/* Constant padding => the mark never moves; only the name fades. */}
        <Link
          href={homeHref}
          aria-label={variant === "admin" ? "Win-Win Back Admin" : "Win-Win Back"}
          className="flex w-full items-center overflow-hidden px-0 py-2"
        >
          <BrandLogo
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
              : pathname.startsWith(item.href) && !items.some((other) => other.href !== item.href && other.href.startsWith(`${item.href}/`) && pathname.startsWith(other.href));
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.label}
                  className={`${styles.navItem} h-10 rounded-xl px-2 text-[13px] font-semibold text-[#315a78] [&_svg]:size-[18px]`}
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
      </SidebarContent>
      <SidebarFooter className="gap-3 overflow-hidden px-3 pt-4 pb-5">
        {/* Keep the promo outside the scrollable navigation so it stays pinned. */}
        <div className="ww-sidebar-promo relative h-56 shrink-0 overflow-hidden rounded-2xl p-4 group-data-[collapsible=icon]:hidden">
          <div className="relative z-10">
            <p className="text-lg font-black leading-tight text-[#0d315d]">Mua sắm<br />thông minh</p>
            <p className="mt-1 text-base font-black leading-tight text-[#198e2d]">Nhận cashback<br />về ví mỗi đơn!</p>
          </div>
          <Image
            src="/images/landing-hero-mascot-v3.webp"
            alt=""
            width={420}
            height={280}
            sizes="17rem"
            loading="eager"
            className="ww-sidebar-promo-art pointer-events-none absolute bottom-[-1.5rem] right-[-2.5rem] h-auto w-[105%] select-none"
          />
        </div>
      </SidebarFooter>
    </SidebarRoot>
  );
}
