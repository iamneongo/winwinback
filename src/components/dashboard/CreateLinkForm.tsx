"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Link2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { createLinkAction, type ActionState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="cta"
      disabled={pending}
      className="h-auto w-full gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 sm:w-auto"
    >
      {pending ? "Đang kiểm tra…" : "Kiểm tra hoàn tiền"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function CreateLinkForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    createLinkAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 transition-colors focus-within:border-[#b7e961] sm:flex-row sm:items-center sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link2 className="ml-1 h-4 w-4 flex-shrink-0 text-[#6b8290]" />
          <input
          name="url"
          type="url"
          required
          placeholder="Dán link sản phẩm TikTok Shop hoặc Shopee…"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="w-full sm:w-auto"><SubmitButton /></div>
      </div>
      {state?.error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-[#3f8a2e]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.success}
        </p>
      )}
    </form>
  );
}
