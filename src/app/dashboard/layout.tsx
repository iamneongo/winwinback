import { Search, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { Dock } from "@/components/dashboard/Dock";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderMenus } from "@/components/dashboard/HeaderMenus";
import { BrandLogo } from "@/components/BrandLogo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <TooltipProvider>
      <SidebarProvider
        className="winwin-root overflow-x-hidden bg-[#f5f8fc] text-[#0d315d]"
        style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}
      >
        <Sidebar />
        <div className="flex min-h-svh min-w-0 flex-1 flex-col bg-[#f5f8fc] pb-24 lg:pb-0">
          <header className="flex h-[76px] items-center justify-between border-b border-[#e4edf8] bg-white px-4 sm:px-7 lg:px-8">
            <SidebarTrigger
              aria-label="Thu gọn / mở rộng thanh điều hướng"
              className="mr-1 hidden size-9 shrink-0 text-[#315a90] hover:bg-[#eef4fc] hover:text-[#0d315d] lg:flex [&_svg]:size-5"
            />
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
              <HeaderMenus name={user.name} role={user.role} />
            </div>
          </header>
          <Dock role={user.role} />
          {children}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
