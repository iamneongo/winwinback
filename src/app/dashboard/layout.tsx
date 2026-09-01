import { Bell, ChevronDown, Search, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { Dock } from "@/components/dashboard/Dock";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BrandLogo } from "@/components/BrandLogo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="winwin-root min-h-screen overflow-x-hidden bg-[#f5f8fc] text-[#0d315d]">
      <Sidebar />
      <div className="min-h-screen min-w-0 pb-24 lg:pl-64 lg:pb-0">
          <header className="flex h-[76px] items-center justify-between border-b border-[#e4edf8] bg-white px-4 sm:px-7 lg:px-8">
            <Link
              href="/dashboard"
              className="shrink-0 lg:hidden"
              aria-label="Win-Win Back"
            >
              <BrandLogo className="[&>span:last-child]:text-base" />
            </Link>
            <form action="/dashboard/don-hang" className="ml-auto hidden w-full max-w-[31rem] lg:block">
              <label className="relative block">
                <span className="sr-only">Tìm kiếm đơn hàng</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5678a7]" />
                <input
                  name="q"
                  placeholder="Tìm kiếm đơn hàng, sản phẩm, mã đơn..."
                  className="h-11 w-full rounded-full border border-[#dbe7f6] bg-[#f9fbff] px-11 text-sm text-[#244a7c] outline-none placeholder:text-[#7892b5] focus:border-[#9ddd5d] focus:ring-2 focus:ring-[#b7e961]/25"
                />
              </label>
            </form>
            <div className="ml-3 flex items-center gap-3 sm:ml-6 sm:gap-5">
              <div className="hidden items-center gap-2 rounded-full bg-[#eff9e7] px-3 py-2 text-sm sm:flex">
                <Wallet className="h-4 w-4 text-[#55a61b]" />
                <span className="font-bold text-[#377719]">
                  {formatVnd(user.balance)}
                </span>
              </div>
              <span
                aria-label="Thông báo mới"
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-[#315a90]"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff5c51]" />
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b7e961] text-sm font-black text-[#0a3b60]">
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[9rem] leading-4 sm:block">
                  <span className="block text-xs text-[#6681a7]">
                    Xin chào,
                  </span>
                  <span className="font-bold text-[#0d315d]">{user.name}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-[#6681a7] sm:block" />
              </div>
            </div>
          </header>
          <Dock role={user.role} />
          {children}
      </div>
    </div>
  );
}
