"use client";

import { usePathname } from "next/navigation";

const routeTitles = [
  { href: "/admin/nguoi-dung", title: "Quản lý người dùng" },
  { href: "/admin/don-hang", title: "Quản lý đơn hàng" },
  { href: "/admin/yeu-cau-hoan-tien", title: "Quản lý yêu cầu hoàn tiền" },
  { href: "/admin/rut-tien", title: "Yêu cầu rút tiền" },
  { href: "/admin/nhiem-vu", title: "Duyệt nhiệm vụ" },
  { href: "/admin/rut-tham", title: "Rút thăm may mắn" },
  { href: "/admin/bai-viet", title: "Bài viết SEO" },
  { href: "/admin/integrations", title: "Quản lý kết nối sàn" },
] as const;

export function AdminHeaderTitle() {
  const pathname = usePathname();
  const route = routeTitles.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  const title = route?.title ?? "Bảng điều khiển quản trị hoàn tiền";

  return (
    <div className="hidden min-w-0 items-center lg:flex">
      <h1 className="truncate text-xl font-black tracking-tight text-[#102e57]">{title}</h1>
    </div>
  );
}
