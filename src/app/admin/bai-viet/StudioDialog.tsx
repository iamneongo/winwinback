"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
export function StudioDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} onCancel={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-label={title} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl border border-[#dfe9f5] bg-white p-5 text-[#173b5e] backdrop:bg-slate-950/40"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{title}</h2><Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Đóng"><X className="size-4" /></Button></div>{children}</dialog>;
}
