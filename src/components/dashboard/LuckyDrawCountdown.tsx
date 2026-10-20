"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

export function LuckyDrawCountdown({ endAt }: { endAt: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const initialTick = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initialTick);
      window.clearInterval(timer);
    };
  }, []);

  const target = endAt ? new Date(endAt).getTime() : null;
  const remaining = target !== null && now !== null ? Math.max(0, target - now) : null;
  const units = remaining === null ? null : [
    Math.floor(remaining / 86_400_000),
    Math.floor(remaining / 3_600_000) % 24,
    Math.floor(remaining / 60_000) % 60,
    Math.floor(remaining / 1000) % 60,
  ];

  return (
    <div className="w-full max-w-[410px] overflow-hidden rounded-xl border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.48),rgba(255,255,255,0.86))] text-[#0a3151] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_4px_8px_rgba(38,129,175,0.09)] backdrop-blur-[10px] backdrop-saturate-[125%]">
      <div className="flex items-center justify-center gap-1.5 px-3 pt-3 text-center text-[11px] font-bold tracking-[0.03em] text-[#315a78]"><Clock3 className="size-3.5 text-[#188437]" aria-hidden="true" /> THỜI GIAN ĐẾN KỲ QUAY TIẾP THEO</div>
      <div className="mt-2 grid grid-cols-4 px-2 pb-3 sm:px-3" role="timer" aria-live="off">
        {(["Ngày", "Giờ", "Phút", "Giây"] as const).map((label, index) => (
          <div key={label} className={`min-w-0 text-center ${index < 3 ? "border-r border-[#95c8d5]/50" : ""}`}>
            <span key={units ? `${label}-${units[index]}` : label} className="block font-mono text-[1.75rem] font-bold tabular-nums leading-none text-[#0d315d] animate-in fade-in duration-200 motion-reduce:animate-none sm:text-[2rem]">{units ? String(units[index]).padStart(2, "0") : "--"}</span>
            <span className="mt-1 block text-[11px] font-medium text-[#315a78]">{label}</span>
          </div>
        ))}
      </div>
      {(!endAt || remaining === 0) && (
        <p className="border-t border-white/65 bg-white/30 px-3 py-2 text-center text-[11px] font-medium text-[#315a78]">
          {!endAt ? "Chưa có lịch quay mới" : "Kỳ quay đã đóng · chờ công bố kết quả"}
        </p>
      )}
    </div>
  );
}
