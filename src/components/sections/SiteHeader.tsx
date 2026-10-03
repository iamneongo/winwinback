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
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <BrandLogo light />
        </Link>
        <Button
          variant="cta"
          nativeButton={false}
          className="h-auto gap-1.5 rounded-full px-4 py-2 text-sm font-bold"
          render={<a href="/register" />}
        >
          Nhận hoàn tiền ngay <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </header>
  );
}
