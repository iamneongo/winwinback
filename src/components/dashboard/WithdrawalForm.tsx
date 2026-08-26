"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  requestWithdrawalAction,
  type ActionState,
} from "@/app/dashboard/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { formatVnd } from "@/lib/config";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#b7e961]/60";

export function WithdrawalForm({
  balance,
  minWithdrawal,
}: {
  balance: number;
  minWithdrawal: number;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    requestWithdrawalAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="amount"
          type="number"
          min={minWithdrawal}
          step={1000}
          required
          placeholder={`Số tiền (tối thiểu ${formatVnd(minWithdrawal)})`}
          className={inputClass}
        />
        <input
          name="bankName"
          type="text"
          required
          placeholder="Ngân hàng (VD: Vietcombank)"
          className={inputClass}
        />
        <input
          name="bankAccount"
          type="text"
          required
          placeholder="Số tài khoản"
          className={inputClass}
        />
        <input
          name="accountHolder"
          type="text"
          required
          placeholder="Tên chủ tài khoản"
          className={inputClass}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-white/60">
          Số dư khả dụng:{" "}
          <span className="font-semibold text-[#b7e961]">
            {formatVnd(balance)}
          </span>
        </span>
        <SubmitButton>Yêu cầu rút tiền</SubmitButton>
      </div>
      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-[#b7e961]">{state.success}</p>
      )}
    </form>
  );
}
