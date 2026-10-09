"use client";

import { useActionState, useState } from "react";
import { Landmark, Pencil, Plus, X } from "lucide-react";
import { saveBankAccountAction, type ActionState } from "@/app/dashboard/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

type BankAccountDetails = {
  bankName: string;
  bankAccount: string;
  accountHolder: string;
};

const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-[#d9e5f4] bg-white px-3 text-sm text-[#244a7c] outline-none placeholder:text-[#8ba0bd] focus:border-[#8bd950] focus:ring-2 focus:ring-[#b7e961]/25";

export function BankAccountPanel({ account }: { account: BankAccountDetails | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveBankAccountAction, undefined);
  const [editing, setEditing] = useState(false);

  return (
    <section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
      <div className="flex items-center gap-2">
        <Landmark className="size-5 text-[#315a90]" />
        <h2 className="font-bold text-[#173861]">Liên kết ngân hàng</h2>
      </div>

      {account && !editing ? (
        <div className="mt-4 rounded-lg border border-[#e2eaf4] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <b className="block truncate text-sm text-[#244a7c]">{account.bankName}</b>
              <p className="mt-1 text-xs text-[#718bad]">•••• {account.bankAccount.slice(-4)} · {account.accountHolder}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[#e8f8eb] px-2.5 py-1 text-[10px] font-bold text-[#168146]">Đã liên kết</span>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d9e5f4] px-3 text-xs font-bold text-[#315a90] transition-colors hover:bg-[#f6f9fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1261ed]">
            <Pencil className="size-3.5" /> Cập nhật tài khoản
          </button>
        </div>
      ) : !editing ? (
        <div className="mt-4 rounded-lg border border-[#e2eaf4] p-4">
          <b className="text-sm text-[#244a7c]">Chưa có tài khoản liên kết</b>
          <p className="mt-1 text-xs leading-5 text-[#718bad]">Lưu tài khoản để điền sẵn thông tin khi yêu cầu rút tiền.</p>
          <button type="button" onClick={() => setEditing(true)} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#a9e75e] px-3 text-xs font-bold text-[#173b5e] transition-colors hover:bg-[#9ddd50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1261ed]">
            <Plus className="size-4" /> Thêm tài khoản
          </button>
        </div>
      ) : (
        <form action={action} className="mt-4 space-y-3">
          <label className="block text-xs font-semibold text-[#34537a]">
            Ngân hàng
            <input name="bankName" required maxLength={80} defaultValue={account?.bankName ?? ""} placeholder="Ví dụ: Vietcombank" className={inputClass} />
          </label>
          <label className="block text-xs font-semibold text-[#34537a]">
            Số tài khoản
            <input name="bankAccount" required minLength={4} maxLength={40} defaultValue={account?.bankAccount ?? ""} inputMode="numeric" autoComplete="off" className={inputClass} />
          </label>
          <label className="block text-xs font-semibold text-[#34537a]">
            Tên chủ tài khoản
            <input name="accountHolder" required maxLength={80} defaultValue={account?.accountHolder ?? ""} autoComplete="name" className={inputClass} />
          </label>
          {state?.error && <p role="alert" className="text-xs font-medium text-red-600">{state.error}</p>}
          {state?.success && <p role="status" className="text-xs font-medium text-[#168146]">{state.success}</p>}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <SubmitButton className="min-h-10 rounded-lg px-4 py-2 text-xs">Lưu tài khoản</SubmitButton>
            <button type="button" onClick={() => setEditing(false)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[#58749a] hover:bg-[#f6f9fd]">
              <X className="size-3.5" /> {account ? "Hủy" : "Đóng"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
