"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, X } from "lucide-react";

export function LinkErrorNotice({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const closeRef = useRef(onClose);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setClosing(true), 6500);
    const removeTimer = window.setTimeout(() => closeRef.current(), 6700);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  return <div
    role="alert"
    className={`ww-link-error-notice fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex w-[min(25rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-[#f2d8d5] bg-white px-4 py-3 text-[#0d315d] shadow-[0_4px_8px_rgba(20,67,81,0.14)] lg:bottom-6 ${closing ? "ww-link-error-notice--closing" : ""}`}
  >
    <span className="ww-link-error-notice-icon grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0ed] text-[#c44234]" aria-hidden="true">
      <AlertCircle className="size-5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-0.5 text-sm leading-5 text-[#315674]">{message}</p>
    </div>
    <button type="button" onClick={onClose} aria-label="Đóng thông báo" className="grid size-8 shrink-0 place-items-center rounded-lg text-[#56728e] transition-colors hover:bg-[#fff0ed] hover:text-[#0d315d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c44234]">
      <X className="size-4" aria-hidden="true" />
    </button>
  </div>;
}
