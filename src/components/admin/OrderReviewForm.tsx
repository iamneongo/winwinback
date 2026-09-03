"use client";

import { useActionState, useState } from "react";
import { reviewOrderAction, type ActionState } from "@/app/admin/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/SubmitButton";

const options = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "confirmed", label: "Duyệt" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Từ chối" },
];

export function OrderReviewForm({
  orderId,
  status,
  adminNote,
}: {
  orderId: string;
  status: string;
  adminNote: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    reviewOrderAction,
    undefined,
  );
  const [value, setValue] = useState(status);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-xs font-semibold text-[#526b90]">
        Kết quả kiểm duyệt
        <div className="mt-1.5">
          <Select
            name="status"
            value={value}
            onValueChange={(v) => setValue(v ?? status)}
          >
            <SelectTrigger className="h-9 w-full text-xs text-[#3a557c]">
              <SelectValue placeholder="Chọn kết quả" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </label>

      <label className="block text-xs font-semibold text-[#526b90]">
        Ghi chú / phản hồi
        <Textarea
          name="adminNote"
          defaultValue={adminNote ?? ""}
          className="mt-1.5 h-20 text-xs"
          placeholder="Nhập ghi chú nội bộ hoặc phản hồi cho người dùng..."
        />
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton>Lưu kết quả</SubmitButton>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        {state?.success && (
          <p className="text-xs font-medium text-[#2f7a1c]">{state.success}</p>
        )}
      </div>
    </form>
  );
}
