import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Standalone (public, no-auth) wrapper for the legal pages that must be
 * reachable by anyone — required for the Google OAuth consent screen
 * (privacy policy / terms of service links) and the site footer.
 */
export function PublicPolicyShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f8fc] text-[#0d315d]">
      <header className="border-b border-[#e4edf8] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Win-Win Back">
            <BrandLogo className="[&>span:last-child]:text-base" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1766e7] hover:underline"
          >
            <ArrowLeft className="size-4" /> Trang chủ
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-8 sm:py-10">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-[#58749a]">{subtitle}</p>}
        <div className="mt-6 space-y-6 text-sm leading-7 text-[#3a5578]">
          {children}
        </div>
      </article>
    </main>
  );
}
