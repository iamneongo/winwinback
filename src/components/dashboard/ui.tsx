import type { LucideIcon } from "lucide-react";

/** Shared surface for panels across the dashboard pages. */
export const cardClass =
  "rounded-xl border border-[#e1eaf6] bg-white p-4 shadow-[0_5px_14px_rgba(26,73,124,0.04)] sm:p-5";

export const sectionTitleClass = "text-base font-bold tracking-tight text-[#0d315d]";

/** Consistent heading for customer dashboard pages (the overview uses a hero instead). */
export function DashboardPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">{title}</h1>
      <p className="mt-1 text-sm leading-6 text-[#58749a]">{description}</p>
    </header>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebf9df] text-[#57af20]">
        <Icon className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <div>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-[#0d315d] sm:text-[28px]">
          {title}
        </h1>
        {hint && <p className="mt-1 text-sm text-[#6681a7]">{hint}</p>}
      </div>
    </div>
  );
}

export function Empty({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <p className={`rounded-xl border border-dashed border-[#cbd9ec] bg-[#f8fbff] px-3 text-center text-sm text-[#6681a7] ${compact ? "py-5" : "py-10"}`}>
      {text}
    </p>
  );
}
