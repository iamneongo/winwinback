"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <Button
      type="submit"
      disabled={pending}
      variant={variant === "primary" ? "cta" : "ghost"}
      className={cn(
        "h-auto gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
        variant === "ghost" &&
          "border border-white/20 text-white hover:bg-white/10 hover:text-white",
        variant === "danger" &&
          "border border-red-400/40 text-red-200 hover:bg-red-500/10 hover:text-red-200",
        className,
      )}
    >
      {pending ? "Đang xử lý…" : children}
    </Button>
  );
}
