"use client";

import { useActionState } from "react";
import {
  fetchCollabProductsAction,
  type CollabState,
} from "@/app/admin/integrations/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

/**
 * Open-collaboration product fetch (schema confirmation step). Shows the count
 * and the raw JSON so we can lock the exact product fields before building the
 * customer-facing "săn sale" page.
 */
export function TikTokCollabPanel() {
  const [state, action] = useActionState<CollabState, FormData>(
    () => fetchCollabProductsAction(),
    undefined,
  );
  return (
    <div className="space-y-3 rounded-2xl border border-[#e1eaf6] bg-[#f9fbff] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#173861]">
            Sản phẩm Open Collaboration (hoa hồng cao)
          </p>
          <p className="text-xs text-[#6681a7]">
            Nguồn cho mục “Săn sale”. Bước xác nhận dữ liệu thật trước khi dựng
            giao diện cho khách.
          </p>
        </div>
        <form action={action}>
          <SubmitButton variant="ghost">Tải sản phẩm</SubmitButton>
        </form>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {state?.raw && (
        <>
          <p className="text-xs text-[#6681a7]">
            Tải {state.count ?? 0} sản phẩm
            {typeof state.total === "number" ? ` / tổng ${state.total}` : ""} lúc{" "}
            {state.fetchedAt}.
          </p>
          <pre className="max-h-[28rem] overflow-auto rounded-lg bg-[#0d1b2a] p-3 text-[11px] leading-4 text-[#d7e6f5]">
            {state.raw}
          </pre>
        </>
      )}
    </div>
  );
}
