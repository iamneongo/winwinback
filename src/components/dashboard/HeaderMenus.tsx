"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Bell, ChevronDown, LogOut, Settings, ShieldCheck, Store } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Interactive header cluster: notifications bell + profile menu. */
export function HeaderMenus({
  name,
  role,
  variant = "customer",
}: {
  name: string;
  role: "user" | "admin";
  variant?: "customer" | "admin";
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  const router = useRouter();
  return (
    <>
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-label="Thông báo mới"
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#315a90] transition-colors hover:bg-[#eef4fc]"
            />
          }
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff5c51]" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-0 p-0">
          <div className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#0d315d]">
            Thông báo
          </div>
          <div className="px-4 py-10 text-center text-sm text-[#6681a7]">
            Không có thông báo mới
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2 rounded-full text-sm outline-none"
            />
          }
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b7e961] text-sm font-black text-[#0a3b60]">
            {initial}
          </span>
          <span className="hidden max-w-[9rem] min-w-0 text-left leading-4 sm:block">
            <span className="block text-xs text-[#6681a7]">Xin chào,</span>
            <span className="block truncate font-bold text-[#0d315d]" title={name}>{name}</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-[#6681a7] sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="min-w-0 px-2 py-1.5 text-left leading-4 sm:hidden">
            <span className="block text-xs text-[#6681a7]">Xin chào,</span>
            <span className="block truncate font-bold text-[#0d315d]" title={name}>{name}</span>
          </div>
          <DropdownMenuSeparator className="sm:hidden" />
          <DropdownMenuItem render={<Link href="/dashboard/tai-khoan" />}>
            <Settings /> Cài đặt
          </DropdownMenuItem>
          {variant === "admin" ? (
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              <Store /> Trang khách hàng
            </DropdownMenuItem>
          ) : (
            role === "admin" && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                <ShieldCheck /> Quản trị
              </DropdownMenuItem>
            )
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            <LogOut /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
