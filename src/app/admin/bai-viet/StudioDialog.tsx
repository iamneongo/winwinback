"use client";

import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function StudioDialog({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="flex max-h-[min(88dvh,720px)] max-w-2xl flex-col overflow-hidden p-0">
      <DialogHeader className="shrink-0 border-b border-[#e5edf6] px-5 py-4 sm:px-6">
        <DialogTitle className="text-lg text-[#11335e]">{title}</DialogTitle>
        {description && <DialogDescription className="mt-1">{description}</DialogDescription>}
      </DialogHeader>
      <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
    </DialogContent>
  </Dialog>;
}
