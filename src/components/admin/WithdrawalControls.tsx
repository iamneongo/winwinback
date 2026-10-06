"use client";

import { useActionState } from "react";
import {
  processWithdrawalAction,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

function ActionButton({
  withdrawalId,
  action,
  label,
  variant,
  className,
}: {
  withdrawalId: string;
  action: "approve" | "reject" | "paid";
  label: string;
  variant: "outline" | "cta";
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
      <Button
        type="submit"
        variant={variant}
        size="sm"
        disabled={pending}
        className={`h-8 rounded-lg px-2.5 text-xs font-semibold ${className}`}
      >
        {label}
      </Button>
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
          variant="outline"
          className="border-[#c8dcf5] bg-[#e8f1ff] text-[#1f66c2] hover:bg-[#dcecff]"
        />
      )}
      {status === "approved" && (
        <ActionButton
          withdrawalId={withdrawalId}
          action="paid"
          label="Đã chi"
          variant="cta"
          className="text-[#173b5e]"
        />
      )}
      <ActionButton
        withdrawalId={withdrawalId}
        action="reject"
        label="Từ chối"
        variant="outline"
        className="border-[#f3c6d0] bg-[#fff5f6] text-[#d34843] hover:bg-[#fee9ee]"
      />
    </div>
  );
}
