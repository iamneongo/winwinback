import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { getBellData } from "@/lib/notifications";
import { Dock } from "@/components/dashboard/Dock";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderMenus } from "@/components/dashboard/HeaderMenus";
import { adminMobileMoreNav } from "@/components/dashboard/nav";
import { BrandLogo } from "@/components/BrandLogo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AdminHeaderTitle } from "@/components/admin/AdminHeaderTitle";
import { AdminSearchInput } from "@/components/admin/AdminFilters";
import { HeaderDateRange } from "@/components/admin/HeaderDateRange";
import { dashboardFrameClass } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const bell = await getBellData(admin.id);

  return (
    <NuqsAdapter>
      <TooltipProvider>
        <SidebarProvider
        className="ww-dashboard-shell winwin-root overflow-x-hidden text-[#0d315d]"
        style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}
      >
        <Sidebar variant="admin" />
        <div className={dashboardFrameClass}>
          <header className="flex h-16 items-center justify-between border-b border-[#e4edf8] bg-white px-4 sm:px-6 lg:rounded-t-2xl lg:px-5">
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
            <AdminHeaderTitle />
            <div className="ml-auto flex items-center gap-3 sm:gap-4">
              <AdminSearchInput
                action="/admin/don-hang"
                placeholder="Tìm kiếm đơn hàng, người dùng, mã đơn..."
              />
              <HeaderDateRange />
              <HeaderMenus
                key={`${bell.unreadCount}:${bell.items[0]?.id ?? ""}`}
                name={admin.name}
                role={admin.role}
                variant="admin"
                notifications={bell.items}
                unreadCount={bell.unreadCount}
                mobileMoreItems={adminMobileMoreNav}
              />
            </div>
          </header>
          <Dock variant="admin" />
          {children}
        </div>
        </SidebarProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );
}
