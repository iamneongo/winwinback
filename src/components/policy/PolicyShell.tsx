import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Content wrapper for the policy / support pages. Rendered INSIDE the dashboard
 * layout (sidebar + header persist), so navigation stays client-side and the
 * back link doesn't reload the whole shell.
 */
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
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/dashboard/tai-khoan"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1766e7] hover:underline"
      >
        <ArrowLeft className="size-4" /> Tài khoản
      </Link>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-[#0d315d] sm:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-[#58749a]">{subtitle}</p>}
      <div className="mt-6 space-y-6 text-sm leading-7 text-[#3a5578]">
        {children}
      </div>
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
