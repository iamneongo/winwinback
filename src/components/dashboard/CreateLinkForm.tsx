"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLinkAction, type ActionState } from "@/app/dashboard/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

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
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="url"
          type="url"
          required
          placeholder="Dán link sản phẩm Shopee hoặc TikTok Shop…"
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#b7e961]/60"
        />
        <SubmitButton className="shrink-0">Tạo link</SubmitButton>
      </div>
      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-[#b7e961]">{state.success}</p>
      )}
    </form>
  );
}
