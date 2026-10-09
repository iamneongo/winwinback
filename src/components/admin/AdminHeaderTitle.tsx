"use client";

import { usePathname } from "next/navigation";
import { BadgeDollarSign, Banknote, ClipboardCheck, FileText, Plug, ShoppingBag, Sparkles, Ticket, UsersRound } from "lucide-react";

const routeTitles = [
  { href: "/admin/nguoi-dung", title: "Quản lý người dùng", icon: UsersRound },
  { href: "/admin/don-hang", title: "Quản lý đơn hàng", icon: ShoppingBag },
  { href: "/admin/yeu-cau-hoan-tien", title: "Quản lý yêu cầu hoàn tiền", icon: BadgeDollarSign },
  { href: "/admin/rut-tien", title: "Yêu cầu rút tiền", icon: Banknote },
  { href: "/admin/nhiem-vu", title: "Duyệt nhiệm vụ", icon: ClipboardCheck },
  { href: "/admin/rut-tham", title: "Rút thăm may mắn", icon: Ticket },
  { href: "/admin/bai-viet", title: "Bài viết SEO", icon: FileText },
  { href: "/admin/integrations", title: "Quản lý kết nối sàn", icon: Plug },
] as const;

export function AdminHeaderTitle() {
  const pathname = usePathname();
  const route = routeTitles.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  const title = route?.title ?? "Bảng điều khiển quản trị hoàn tiền";
  const Icon = route?.icon ?? Sparkles;
  const isOverview = !route;

  return (
    <div className="hidden min-w-0 items-center gap-2 lg:flex">
      <Icon className={`size-5 shrink-0 ${isOverview ? "text-[#f0c328]" : "text-[#57ae21]"}`} fill={isOverview ? "currentColor" : undefined} />
      <h1 className="truncate text-xl font-black tracking-tight text-[#102e57]">{title}</h1>
    </div>
  );
}
