"use client";

import { useActionState } from "react";
import {
  processWithdrawalAction,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [state, submit, pending] = useActionState<ActionState, FormData>(
    processWithdrawalAction,
    undefined,
  );
  return (
    <form action={submit} className="inline-flex flex-col gap-1">
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
      {state?.error && <span role="alert" className="max-w-48 text-xs text-red-600">{state.error}</span>}
    </form>
  );
}

function NeedsInfoButton({ withdrawalId }: { withdrawalId: string }) {
  const [state, submit, pending] = useActionState<ActionState, FormData>(processWithdrawalAction, undefined);
  return <Dialog>
    <DialogTrigger render={<Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs">Yêu cầu sửa</Button>} />
    <DialogContent>
      <DialogHeader><DialogTitle>Yêu cầu khách sửa thông tin</DialogTitle><DialogDescription>Lý do sẽ hiển thị trong dashboard và gửi qua email để khách cập nhật đúng yêu cầu này. Tiền vẫn được giữ trong lúc chờ.</DialogDescription></DialogHeader>
      <form action={submit} className="mt-5 space-y-4">
        <input type="hidden" name="withdrawalId" value={withdrawalId} />
        <input type="hidden" name="action" value="needs_info" />
        <label className="block text-sm font-semibold text-[#244a7c]">Thông tin cần sửa
          <textarea name="reason" required minLength={10} maxLength={500} rows={4} placeholder="Ví dụ: Số tài khoản không khớp tên chủ tài khoản. Vui lòng kiểm tra và gửi lại." className="mt-2 w-full rounded-lg border border-[#d7e3f1] px-3 py-2 font-normal outline-none focus:border-[#8bd949]" />
        </label>
        {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p role="status" className="text-sm text-[#168146]">Đã gửi yêu cầu sửa.</p>}
        <Button type="submit" variant="cta" disabled={pending} className="min-h-10 px-4">{pending ? "Đang gửi…" : "Gửi yêu cầu sửa"}</Button>
      </form>
    </DialogContent>
  </Dialog>;
}

export function WithdrawalControls({
  withdrawalId,
  status,
}: {
  withdrawalId: string;
  status: string;
}) {
  if (status === "rejected" || status === "paid" || status === "needs_info") {
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
      <NeedsInfoButton withdrawalId={withdrawalId} />
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
