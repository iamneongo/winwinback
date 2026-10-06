"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarPlus, Dices } from "lucide-react";
import {
  createPeriodAction,
  runDrawAction,
  type ActionState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimeField } from "@/components/admin/DateTimeField";

function Submit({ label, pendingLabel, icon: Icon }: { label: string; pendingLabel: string; icon: typeof Dices }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" disabled={pending} className="h-11 gap-2 rounded-lg px-5 text-sm font-bold">
      <Icon className="h-4 w-4" />
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function CreatePeriodForm() {
  const [state, action] = useActionState<ActionState, FormData>(createPeriodAction, undefined);
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
      <label className="grid gap-1.5 text-xs font-bold text-[#213e67]">Tên kỳ
        <Input name="name" required placeholder="VD: Kỳ tháng 10/2026" className="h-11 border-[#d9e5f4] text-sm text-[#35537c] focus-visible:border-[#8bd950] focus-visible:ring-[#b7e961]/25" />
      </label>
      <div className="grid gap-1.5 text-xs font-bold text-[#213e67]"><span>Ngày mở</span><DateTimeField name="startAt" label="Ngày mở" /></div>
      <div className="grid gap-1.5 text-xs font-bold text-[#213e67]"><span>Ngày đóng</span><DateTimeField name="endAt" label="Ngày đóng" /></div>
      <Submit label="Tạo kỳ" pendingLabel="Đang tạo…" icon={CalendarPlus} />
      {state?.error && <p className="text-sm text-red-600 sm:col-span-4">{state.error}</p>}
      {state?.success && <p className="text-sm text-[#168146] sm:col-span-4">{state.success}</p>}
    </form>
  );
}

export function DrawButton({ periodId }: { periodId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(runDrawAction, undefined);
  return (
    <form action={action} className="flex flex-col items-start gap-1">
      <input type="hidden" name="periodId" value={periodId} />
      <Submit label="Quay số" pendingLabel="Đang quay…" icon={Dices} />
      {state?.error && <p className="max-w-xs text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="max-w-xs text-xs text-[#168146]">{state.success}</p>}
    </form>
  );
}
