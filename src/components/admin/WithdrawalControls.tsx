"use client";

import { useActionState } from "react";
import {
  processWithdrawalAction,
  type ActionState,
} from "@/app/admin/actions";

function ActionButton({
  withdrawalId,
  action,
  label,
  className,
}: {
  withdrawalId: string;
  action: "approve" | "reject" | "paid";
  label: string;
  className: string;
}) {
  const [, submit, pending] = useActionState<ActionState, FormData>(
    processWithdrawalAction,
    undefined,
  );
  return (
    <form action={submit} className="inline">
      <input type="hidden" name="withdrawalId" value={withdrawalId} />
      <input type="hidden" name="action" value={action} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-60 ${className}`}
      >
        {label}
      </button>
    </form>
  );
}

export function WithdrawalControls({
  withdrawalId,
  status,
}: {
  withdrawalId: string;
  status: string;
}) {
  if (status === "rejected" || status === "paid") {
    return <span className="text-xs text-[#8aa0bd]">—</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "pending" && (
        <ActionButton
          withdrawalId={withdrawalId}
          action="approve"
          label="Duyệt"
          className="bg-[#e8f1ff] text-[#1f66c2]"
        />
      )}
      {status === "approved" && (
        <ActionButton
          withdrawalId={withdrawalId}
          action="paid"
          label="Đã chi"
          className="bg-[#b7e961] text-[#173b5e]"
        />
      )}
      <ActionButton
        withdrawalId={withdrawalId}
        action="reject"
        label="Từ chối"
        className="bg-[#fee9e8] text-[#d34843]"
      />
    </div>
  );
}
