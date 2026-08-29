"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#cbd9ec] px-2.5 py-1 text-xs font-medium text-[#315a90] hover:bg-[#f1f6fc]"
      title="Sao chép link"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[#b7e961]" /> Đã chép
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Chép
        </>
      )}
    </button>
  );
}
