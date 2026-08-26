"use client";

import { useActionState } from "react";
import {
  updateOrderStatusAction,
  type ActionState,
} from "@/app/admin/actions";

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
      <select
        name="status"
        defaultValue={status}
        disabled={pending}
        className="rounded-lg border border-white/15 bg-[#0d3557] px-2 py-1 text-xs text-white outline-none"
      >
        <option value="pending">Chờ duyệt</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="completed">Hoàn tất</option>
        <option value="cancelled">Đã huỷ</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#b7e961] px-2.5 py-1 text-xs font-semibold text-[#14334c] disabled:opacity-60"
      >
        Lưu
      </button>
    </form>
  );
}
