import type { LucideIcon } from "lucide-react";

/** Shared surface for panels across the dashboard pages. */
export const cardClass =
  "rounded-xl border border-[#e1eaf6] bg-white p-4 shadow-[0_5px_14px_rgba(26,73,124,0.04)] sm:p-5";

export const sectionTitleClass = "text-base font-bold tracking-tight text-[#0d315d]";

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

export function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[#cbd9ec] bg-[#f8fbff] py-10 text-center text-sm text-[#6681a7]">
      {text}
    </p>
  );
}
