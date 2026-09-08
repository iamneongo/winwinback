"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveClaimAction,
  rejectClaimAction,
} from "@/app/admin/nhiem-vu/actions";

/** Approve / reject controls for one pending mission claim. */
export function MissionClaimControls({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ error?: string; success?: string } | null>(
    null,
  );

  function approve() {
    startTransition(async () => {
      const res = await approveClaimAction(claimId);
      setMsg(res);
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const res = await rejectClaimAction(claimId, note.trim());
      setMsg(res);
      if (res.success) setRejecting(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {rejecting ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Lý do từ chối (không bắt buộc)"
            className="min-w-0 flex-1 rounded-lg border border-[#e2ebf6] px-3 py-1.5 text-xs text-[#3a557c] outline-none focus:border-[#9ddd5d]"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              disabled={pending}
              onClick={reject}
              className="h-auto rounded-lg px-3 py-1.5 text-xs font-bold"
            >
              Xác nhận từ chối
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRejecting(false)}
              className="h-auto rounded-lg px-3 py-1.5 text-xs"
            >
              Huỷ
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="cta"
            disabled={pending}
            onClick={approve}
            className="h-auto gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
          >
            <Check className="h-3.5 w-3.5" /> Duyệt & cộng thưởng
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => setRejecting(true)}
            className="h-auto gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#b4322f]"
          >
            <X className="h-3.5 w-3.5" /> Từ chối
          </Button>
        </div>
      )}
      {msg?.error && <p className="text-xs text-red-600">{msg.error}</p>}
      {msg?.success && (
        <p className="text-xs font-medium text-[#2f7a1c]">{msg.success}</p>
      )}
    </div>
  );
}
