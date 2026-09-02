"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import { updateOrderStatusAction, type ActionState } from "@/app/admin/actions";

function DecisionButton({
  orderId,
  status,
  label,
  tone,
  icon: Icon,
}: {
  orderId: string;
  status: "confirmed" | "cancelled";
  label: string;
  tone: string;
  icon: typeof Check;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    updateOrderStatusAction,
    undefined,
  );

  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-bold transition-opacity disabled:opacity-50 ${tone}`}
      >
        <Icon className="size-3" />
        {label}
      </button>
    </form>
  );
}

export function OrderDecisionControls({ orderId }: { orderId: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <DecisionButton orderId={orderId} status="confirmed" label="Duyệt" icon={Check} tone="bg-[#36aa45] text-white" />
      <DecisionButton orderId={orderId} status="cancelled" label="Từ chối" icon={X} tone="border border-[#ff8f86] bg-white text-[#f04e43]" />
    </div>
  );
}
