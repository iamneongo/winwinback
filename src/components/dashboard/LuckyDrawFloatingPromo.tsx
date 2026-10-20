"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { formatVnd } from "@/lib/config";

export function LuckyDrawFloatingPromo({
  prizeAmount,
  isActive,
  placement = "dashboard",
}: {
  prizeAmount: number;
  isActive: boolean;
  placement?: "dashboard" | "landing";
}) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Thông tin rút thăm may mắn"
      className={`ww-draw-float fixed right-3 z-30 w-[194px] sm:right-5 lg:right-7 lg:w-[213px] ${placement === "landing" ? "bottom-[calc(1rem+env(safe-area-inset-bottom))] lg:bottom-6" : "bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:bottom-6"}`}
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Ẩn thông tin rút thăm"
        className="absolute right-0 top-0 z-20 grid size-6 place-items-center rounded-full bg-white text-[#315a78] shadow-sm transition-colors hover:bg-[#e9f7e4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#258b3e]"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
      <Link
        href={pathname === "/dashboard/rut-tham" ? "#prizes-heading" : "/dashboard/rut-tham"}
        className="ww-draw-float-link relative mt-5 flex min-h-[74px] items-center justify-end overflow-visible rounded-2xl bg-[#b7e961] py-2 pl-[60px] pr-3 text-[#0d315d] shadow-[inset_0_2px_0_rgba(255,255,255,0.75),inset_0_-4px_0_rgba(89,159,41,0.24),0_5px_8px_rgba(39,113,64,0.2)] outline-none transition-[transform,filter] duration-200 ease-out hover:-translate-y-1 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-[#258b3e] focus-visible:ring-offset-2 active:translate-y-0"
        aria-label={`${isActive ? "Kỳ rút thăm đang mở" : "Kỳ rút thăm sắp mở"}, quỹ thưởng tạm tính ${formatVnd(prizeAmount)}. Xem chi tiết`}
      >
        <span className="ww-draw-float-shine pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden="true" />
        <Image
          src="/images/lucky-draw-mascot-v1.webp"
          alt=""
          width={768}
          height={552}
          sizes="96px"
          className="ww-draw-float-mascot pointer-events-none absolute -bottom-1 -left-3 z-10 h-auto w-[99px] select-none drop-shadow-[0_4px_3px_rgba(27,90,38,0.24)]"
          aria-hidden="true"
        />
        <span className="relative z-10 block min-w-0 text-right">
          <span className="block text-[10px] font-bold leading-4 text-[#214b70]">
            {isActive ? "Kỳ thưởng đang mở" : "Kỳ thưởng sắp mở"}
          </span>
          <strong className="block whitespace-nowrap text-[18px] font-black leading-[1.15] tracking-tight tabular-nums text-[#082b4b] lg:text-[20px]">
            {formatVnd(prizeAmount)}
          </strong>
          <span className="mt-1 inline-flex items-center justify-end gap-0.5 rounded-full bg-[#0d315d] px-2 py-0.5 text-[10px] font-bold leading-4 text-white">
            Xem rút thăm <ArrowUpRight className="size-3" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </aside>
  );
}
