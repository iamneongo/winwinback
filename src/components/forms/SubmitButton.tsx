"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-60",
        variant === "primary" &&
          "bg-[#b7e961] text-[#14334c] hover:brightness-105",
        variant === "ghost" &&
          "border border-white/20 text-white hover:bg-white/10",
        variant === "danger" &&
          "border border-red-400/40 text-red-200 hover:bg-red-500/10",
        className,
      )}
    >
      {pending ? "Đang xử lý…" : children}
    </button>
  );
}
