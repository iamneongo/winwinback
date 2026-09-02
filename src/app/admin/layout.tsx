import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { Dock } from "@/components/dashboard/Dock";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderMenus } from "@/components/dashboard/HeaderMenus";
import { BrandLogo } from "@/components/BrandLogo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <TooltipProvider>
      <SidebarProvider
        className="winwin-root overflow-x-hidden bg-[#f5f8fc] text-[#0d315d]"
        style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}
      >
        <Sidebar variant="admin" />
        <div className="flex min-h-svh min-w-0 flex-1 flex-col bg-[#f5f8fc] pb-24 lg:pb-0">
          <header className="flex h-[76px] items-center justify-between border-b border-[#e4edf8] bg-white px-4 sm:px-7 lg:px-8">
            <SidebarTrigger
              aria-label="Thu gọn / mở rộng thanh điều hướng"
              className="mr-1 hidden size-9 shrink-0 text-[#315a90] hover:bg-[#eef4fc] hover:text-[#0d315d] lg:flex [&_svg]:size-5"
            />
            <Link
              href="/admin"
              className="shrink-0 lg:hidden"
              aria-label="Win-Win Back"
            >
              <BrandLogo className="[&>span:last-child]:text-base" />
            </Link>
            <div className="ml-auto flex items-center gap-3 sm:gap-5">
              <span className="hidden items-center rounded-full bg-[#e8f1ff] px-3 py-1.5 text-xs font-bold text-[#1f66c2] sm:inline-flex">
                Khu quản trị
              </span>
              <HeaderMenus name={admin.name} role={admin.role} />
            </div>
          </header>
          <Dock variant="admin" />
          {children}
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
