"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Save } from "lucide-react";
import { type ActionState, updateProfileAction } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

function SaveButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" variant="cta" disabled={pending} className="h-auto min-h-10 gap-2 rounded-lg px-4 text-sm font-bold">{pending ? "Đang lưu…" : <><Save className="h-4 w-4" /> Lưu thay đổi</>}</Button>;
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfileAction, undefined);
  return <form action={action} className="mt-5"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label htmlFor="display-name" className="block"><span className="mb-1.5 block text-xs font-medium text-[#6681a7]">Tên hiển thị</span><div className="flex items-center gap-2 rounded-lg border border-[#d7e3f1] bg-white px-3 focus-within:border-[#8bd949] focus-within:ring-2 focus-within:ring-[#b7e961]/25"><Pencil className="h-4 w-4 text-[#6681a7]" /><input id="display-name" name="name" defaultValue={name} required maxLength={80} className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-medium text-[#244a7c] outline-none" /></div></label><div className="flex items-end"><SaveButton /></div></div><p className="mt-3 text-xs text-[#6681a7]">Email đăng nhập: <span className="font-medium text-[#315a90]">{email}</span></p>{state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}{state?.success && <p className="mt-2 text-sm font-medium text-[#318516]">{state.success}</p>}</form>;
}
