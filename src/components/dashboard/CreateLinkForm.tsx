"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Link2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { createLinkAction, type ActionState } from "@/app/dashboard/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#14334c] whitespace-nowrap transition-all duration-200 hover:brightness-105 disabled:opacity-70"
      style={{
        background:
          "linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)",
        boxShadow:
          "0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 4px 8px rgba(183,233,97,0.35), 0 1px 2px rgba(0,0,0,0.12)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
        }}
        aria-hidden="true"
      />
      <span className="relative flex items-center gap-1.5">
        {pending ? "Đang kiểm tra…" : "Kiểm tra hoàn tiền"}
        <ArrowRight className="h-4 w-4" />
      </span>
    </button>
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
