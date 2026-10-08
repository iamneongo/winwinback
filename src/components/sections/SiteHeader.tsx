import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";

/**
 * Solid header for public content pages (e.g. articles). Unlike the landing
 * NavBar (absolute overlay with white text over the dark hero), this sits in
 * normal flow on its own dark band so the logo/links are visible on any page.
 */
export function SiteHeader() {
  return (
    <header className="bg-[#0d315d]">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-2 px-4 sm:px-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo light />
        </Link>
        <nav className="ml-7 mr-auto hidden items-center gap-6 text-[15px] font-semibold text-white/85 lg:flex" aria-label="Điều hướng chính">
          <Link href="/#cach-hoat-dong" className="transition hover:text-white">Cách hoạt động</Link>
          <Link href="/#doi-tac" className="transition hover:text-white">Đối tác</Link>
          <Link href="/#giai-dap" className="transition hover:text-white">Giải đáp</Link>
          <Link href="/bai-viet" className="transition hover:text-white">Tin tức</Link>
        </nav>
        <Button
          variant="cta"
          nativeButton={false}
          className="h-auto min-h-11 gap-1.5 rounded-full px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm"
          render={<a href="/login" />}
        >
          Đăng nhập <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
        </Button>
      </div>
    </header>
  );
}
