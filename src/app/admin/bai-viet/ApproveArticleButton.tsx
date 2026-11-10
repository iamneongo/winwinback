"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { approveContributorArticleAction } from "./review-actions";

export function ApproveArticleButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return <div className="flex flex-col items-start gap-1"><Button type="button" variant="cta" disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try {
      const result = await approveContributorArticleAction(id);
      if (result.ok) router.refresh(); else setError(result.error);
    } catch { setError("Không duyệt được bài. Vui lòng thử lại."); }
    finally { setBusy(false); }
  }}>{busy ? "Đang duyệt…" : "Duyệt và xuất bản"}</Button>{error && <span role="alert" className="text-xs text-red-700">{error}</span>}</div>;
}
