"use client";

import { useActionState, useState } from "react";
import { correctWithdrawalAction, type ActionState } from "@/app/dashboard/actions";
import { BankSelect } from "@/components/dashboard/BankSelect";
import { Button } from "@/components/ui/button";

const inputClass = "mt-1.5 w-full rounded-lg border border-[#d7e3f1] bg-white px-3 py-2.5 text-sm text-[#244a7c] outline-none focus:border-[#8bd949]";

export function WithdrawalCorrectionForm({ item }: { item: { id: string; bankName: string; bankAccount: string; accountHolder: string; contactPhone: string | null } }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(correctWithdrawalAction, undefined);
  const [bankName, setBankName] = useState(item.bankName);
  return <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
    <input type="hidden" name="withdrawalId" value={item.id} />
    <label className="text-sm font-semibold text-[#244a7c]">Ngân hàng<span className="mt-1.5 block"><BankSelect value={bankName} onValueChange={setBankName} /></span></label>
    <label className="text-sm font-semibold text-[#244a7c]">Số tài khoản<input name="bankAccount" defaultValue={item.bankAccount} required inputMode="numeric" pattern="[0-9]{4,40}" maxLength={40} className={inputClass} /></label>
    <label className="text-sm font-semibold text-[#244a7c]">Tên chủ tài khoản<input name="accountHolder" defaultValue={item.accountHolder} required maxLength={80} className={inputClass} /></label>
    <label className="text-sm font-semibold text-[#244a7c]">Số điện thoại liên hệ<input name="contactPhone" defaultValue={item.contactPhone ?? ""} type="tel" required maxLength={20} className={inputClass} /></label>
    <div className="sm:col-span-2"><Button type="submit" variant="cta" disabled={pending} className="min-h-10 px-5">{pending ? "Đang gửi…" : "Gửi lại thông tin"}</Button></div>
    {state?.error && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
    {state?.success && <p role="status" className="text-sm text-[#168146] sm:col-span-2">{state.success}</p>}
  </form>;
}
