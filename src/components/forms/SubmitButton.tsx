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
          "border border-[#d9e5f4] text-[#35537c] hover:bg-[#f1f6fc] hover:text-[#0d315d]",
        variant === "danger" &&
          "border border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700",
        className,
      )}
    >
      {pending ? "Đang xử lý…" : children}
    </Button>
  );
}
