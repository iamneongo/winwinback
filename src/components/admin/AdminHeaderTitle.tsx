"use client";

import { usePathname } from "next/navigation";

const routeTitles = [
  { href: "/admin/thong-bao", title: "Thông báo" },
  { href: "/admin/lien-he", title: "Liên hệ" },
  { href: "/admin/nguoi-dung", title: "Người dùng" },
  { href: "/admin/don-hang", title: "Đơn hàng" },
  { href: "/admin/yeu-cau-hoan-tien", title: "Hoàn tiền" },
  { href: "/admin/rut-tien", title: "Rút tiền" },
  { href: "/admin/nhiem-vu", title: "Nhiệm vụ" },
  { href: "/admin/rut-tham", title: "Rút thăm may mắn" },
  { href: "/admin/bai-viet/danh-muc", title: "Danh mục bài viết" },
  { href: "/admin/bai-viet", title: "Bài viết" },
  { href: "/admin/integrations", title: "Kết nối sàn" },
] as const;

export function AdminHeaderTitle() {
  const pathname = usePathname();
  const route = routeTitles.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  const title = route?.title ?? "Tổng quan";

  return (
    <div className="hidden min-w-0 items-center lg:flex">
      <h1 className="truncate text-lg font-bold tracking-tight text-[#102e57]">{title}</h1>
    </div>
  );
}
