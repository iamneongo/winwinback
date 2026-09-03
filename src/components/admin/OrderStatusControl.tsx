"use client";

import { useActionState } from "react";
import {
  updateOrderStatusAction,
  type ActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
];

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    updateOrderStatusAction,
    undefined,
  );
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      <Select name="status" defaultValue={status} disabled={pending}>
        <SelectTrigger className="h-8 w-32 text-xs text-[#35537c]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="submit"
        disabled={pending}
        variant="cta"
        size="sm"
        className="text-xs font-semibold"
      >
        Lưu
      </Button>
    </form>
  );
}
