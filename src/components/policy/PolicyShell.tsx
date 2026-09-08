import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

/** Shared light-theme wrapper for the public policy / support pages. */
export function PolicyShell({
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
            href="/dashboard/tai-khoan"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1766e7] hover:underline"
          >
            <ArrowLeft className="size-4" /> Tài khoản
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

/** A titled block within a policy page. */
export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
      <h2 className="text-base font-bold text-[#173861]">{heading}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}
