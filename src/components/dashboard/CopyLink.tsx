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
      className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
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
