import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function RecordDetail({
  backHref,
  backLabel,
  title,
  description,
  actions,
  children,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <main className="mx-auto w-full min-w-0 max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8">
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#315c90] hover:text-[#1261ed] hover:underline"><ArrowLeft className="size-4" />{backLabel}</Link>
        <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-[#102e5c]">{title}</h1>
        {description && <p className="mt-1 max-w-[72ch] text-sm leading-6 text-[#49688f]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
    <div className="grid gap-4">{children}</div>
  </main>;
}

export function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
    <h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">{title}</h2>
    <dl className="grid gap-x-8 gap-y-4 p-4 sm:grid-cols-2 sm:p-5">{children}</dl>
  </section>;
}

export function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0"><dt className="text-xs font-medium text-[#58749a]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-[#173861]">{children || "—"}</dd></div>;
}
