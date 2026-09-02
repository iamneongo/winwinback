"use client";

import { usePathname } from "next/navigation";
import { BadgeDollarSign, Sparkles } from "lucide-react";

export function AdminHeaderTitle() {
  const pathname = usePathname();
  const requests = pathname.startsWith("/admin/yeu-cau-hoan-tien");
  const orders = pathname.startsWith("/admin/don-hang");
  const users = pathname.startsWith("/admin/nguoi-dung");
  const integrations = pathname.startsWith("/admin/integrations");
  const title = users
    ? "Quản lý người dùng"
    : orders
      ? "Quản lý đơn hàng"
      : requests
    ? "Quản lý yêu cầu hoàn tiền"
    : integrations
      ? "Quản lý kết nối sàn"
      : "Bảng điều khiển quản trị hoàn tiền";
  const Icon = requests ? BadgeDollarSign : Sparkles;

  return (
    <div className="hidden min-w-0 items-center gap-2 lg:flex">
      <Icon className={`size-5 ${requests ? "text-[#57ae21]" : "text-[#f0c328]"}`} fill={requests ? undefined : "currentColor"} />
      <h1 className="whitespace-nowrap text-xl font-black tracking-tight text-[#102e57]">{title}</h1>
    </div>
  );
}
