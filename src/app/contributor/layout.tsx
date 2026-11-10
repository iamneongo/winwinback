import Link from "next/link";
import { requireContributor } from "@/lib/auth/guards";
import { getBellData } from "@/lib/notifications";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Dock } from "@/components/dashboard/Dock";
import { HeaderMenus } from "@/components/dashboard/HeaderMenus";
import { BrandLogo } from "@/components/BrandLogo";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { dashboardFrameClass } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function ContributorLayout({ children }: { children: React.ReactNode }) {
  const contributor = await requireContributor();
  const bell = await getBellData(contributor.id);

  return (
    <NuqsAdapter>
      <TooltipProvider>
        <SidebarProvider className="ww-dashboard-shell winwin-root overflow-x-clip text-[#0d315d]" style={{ "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}>
          <Sidebar variant="contributor" />
          <div className={dashboardFrameClass}>
            <header className="flex h-16 items-center justify-between border-b border-[#e4edf8] bg-white px-4 sm:px-6 lg:rounded-t-2xl lg:px-5">
              <SidebarTrigger aria-label="Thu gọn / mở rộng thanh điều hướng" className="mr-1 hidden size-9 shrink-0 text-[#315a90] hover:bg-[#eef4fc] hover:text-[#0d315d] lg:flex [&_svg]:size-5" />
              <Link href="/contributor" className="shrink-0 lg:hidden" aria-label="Win-Win Back Cộng tác viên"><BrandLogo className="[&>span:last-child]:text-base" /></Link>
              <h1 className="hidden text-lg font-bold tracking-tight text-[#102e57] lg:block">Cổng cộng tác viên</h1>
              <div className="ml-auto flex items-center gap-3 sm:gap-4">
                <HeaderMenus name={contributor.name} role={contributor.role} variant="contributor" notifications={bell.items} unreadCount={bell.unreadCount} />
              </div>
            </header>
            <Dock variant="contributor" />
            {children}
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </NuqsAdapter>
  );
}
