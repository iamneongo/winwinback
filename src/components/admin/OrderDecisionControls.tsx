"use client";

import { useActionState } from "react";
import { Check, X } from "lucide-react";
import { updateOrderStatusAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

function DecisionButton({
  orderId,
  status,
  label,
  icon: Icon,
  variant,
  className,
}: {
  orderId: string;
  status: "confirmed" | "cancelled";
  label: string;
  icon: typeof Check;
  variant: "cta" | "outline";
  className?: string;
}) {
  const [, action, pending] = useActionState<ActionState, FormData>(
    updateOrderStatusAction,
    undefined,
  );

  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="status" value={status} />
      <Button
        type="submit"
        disabled={pending}
        variant={variant}
        size="xs"
        className={className}
      >
        <Icon className="size-3" />
        {label}
      </Button>
    </form>
  );
}

export function OrderDecisionControls({ orderId }: { orderId: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <DecisionButton
        orderId={orderId}
        status="confirmed"
        label="Duyệt"
        icon={Check}
        variant="cta"
      />
      <DecisionButton
        orderId={orderId}
        status="cancelled"
        label="Từ chối"
        icon={X}
        variant="outline"
        className="border-[#ff8f86] text-[#f04e43] hover:bg-red-50"
      />
    </div>
  );
}
