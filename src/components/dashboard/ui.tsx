import type { LucideIcon } from "lucide-react";

/** Shared surface for panels across the dashboard pages. */
export const cardClass =
  "rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-sm";

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
    <div className="mb-7 flex items-center gap-3.5">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b7e961]/12 text-[#b7e961]">
        <Icon className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <div>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-white">
          {title}
        </h1>
        {hint && <p className="mt-0.5 text-sm text-white/45">{hint}</p>}
      </div>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center text-sm text-white/40">
      {text}
    </p>
  );
}
