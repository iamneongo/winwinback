"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarPlus, Dices, Save } from "lucide-react";
import {
  createPeriodAction,
  runDrawAction,
  updatePeriodAction,
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

type PeriodFieldsProps = {
  period?: {
    name: string;
    startAt: string;
    endAt: string;
    adminContribution: number;
    includeCommissionFund: boolean;
    fundingNote: string | null;
  };
};

function PeriodFields({ period }: PeriodFieldsProps) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-xs font-bold text-[#213e67]">Tên kỳ
          <Input name="name" required maxLength={120} defaultValue={period?.name} placeholder="VD: Kỳ giải thưởng 2 triệu" className="h-11 border-[#d9e5f4] text-sm text-[#35537c]" />
        </label>
        <div className="grid gap-1.5 text-xs font-bold text-[#213e67]"><span>Ngày mở (giờ Việt Nam)</span><DateTimeField name="startAt" label="Ngày mở" initialValue={period?.startAt} /></div>
        <div className="grid gap-1.5 text-xs font-bold text-[#213e67]"><span>Ngày đóng (giờ Việt Nam)</span><DateTimeField name="endAt" label="Ngày đóng" initialValue={period?.endAt} /></div>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(250px,1.3fr)] md:items-end">
        <label className="grid gap-1.5 text-xs font-bold text-[#213e67]">Admin tài trợ (đ)
          <Input name="adminContribution" type="number" min={0} max={100000000} step={1000} required defaultValue={period?.adminContribution ?? 0} className="h-11 border-[#d9e5f4] text-sm text-[#35537c]" />
        </label>
        <label className="flex min-h-11 items-center gap-2.5 rounded-lg border border-[#d9e5f4] px-3 text-sm font-semibold text-[#213e67]">
          <input name="includeCommissionFund" type="checkbox" defaultChecked={period?.includeCommissionFund ?? true} className="size-4 accent-[#49ae43]" />
          Cộng quỹ tích lũy từ 10% hoa hồng và kỳ trước
        </label>
      </div>
      <label className="grid gap-1.5 text-xs font-bold text-[#213e67]">Ghi chú ngân sách (nội bộ)
        <Input name="fundingNote" maxLength={500} defaultValue={period?.fundingNote ?? ""} placeholder="Nguồn ngân sách, mã phê duyệt..." className="h-11 border-[#d9e5f4] text-sm text-[#35537c]" />
      </label>
      <p className="text-xs leading-5 text-[#58749a]">Khoản tài trợ được ghi nhận cho kỳ này; hệ thống không tự chuyển tiền từ tài khoản ngân hàng. Sau khi quay, tiền trúng được ghi Có vào ví và phần chưa trao cộng dồn.</p>
    </>
  );
}

export function CreatePeriodForm() {
  const [state, action] = useActionState<ActionState, FormData>(createPeriodAction, undefined);
  return <form action={action} className="space-y-4">
    <PeriodFields />
    <Submit label="Tạo kỳ" pendingLabel="Đang tạo…" icon={CalendarPlus} />
    {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state?.success && <p role="status" className="text-sm text-[#168146]">{state.success}</p>}
  </form>;
}

export function UpdatePeriodForm({ periodId, period }: { periodId: string; period: NonNullable<PeriodFieldsProps["period"]> }) {
  const [state, action] = useActionState<ActionState, FormData>(updatePeriodAction, undefined);
  return <form action={action} className="space-y-4">
    <input type="hidden" name="periodId" value={periodId} />
    <PeriodFields period={period} />
    <Submit label="Lưu thay đổi" pendingLabel="Đang lưu…" icon={Save} />
    {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    {state?.success && <p role="status" className="text-sm text-[#168146]">{state.success}</p>}
  </form>;
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
