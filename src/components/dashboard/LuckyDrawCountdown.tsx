"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "2-digit", month: "2-digit", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: false,
});

export function LuckyDrawCountdown({ endAt, periodName }: { endAt: string | null; periodName: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
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
    <div className="w-full max-w-[410px] overflow-hidden rounded-xl border border-[#f8d166] bg-[#071a3b]/80 text-white shadow-[0_0_0_3px_rgba(251,198,76,0.2)]">
      <div className="bg-gradient-to-r from-[#fff1a0] via-[#ffd75e] to-[#f4ad28] px-4 py-1.5 text-center text-xs font-black text-[#473000]">THỜI GIAN ĐẾN KỲ QUAY TIẾP THEO</div>
      <div className="grid grid-cols-4 gap-1.5 px-3 py-4 sm:gap-2 sm:px-5">
        {(["Ngày", "Giờ", "Phút", "Giây"] as const).map((label, index) => (
          <div key={label} className="min-w-0 text-center">
            <span className="block rounded-md border border-[#476a9b] bg-[#183663] py-2 font-mono text-[clamp(1.25rem,4vw,2rem)] font-black tabular-nums leading-none shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]">{units ? String(units[index]).padStart(2, "0") : "--"}</span>
            <span className="mt-1 block text-[10px] font-semibold text-[#dbeaff]">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-t border-[#b78b39] bg-[#fff3b6] px-2 py-2 text-center text-[11px] font-semibold text-[#5b4307]">
        <CalendarDays className="size-3.5" aria-hidden="true" />
        {!endAt ? "Chưa có lịch quay mới" : remaining === 0 ? `${periodName ?? "Kỳ quay"} đã đóng · chờ công bố kết quả` : `${periodName ?? "Kỳ quay"} · Dự kiến ${dateFormatter.format(new Date(endAt))}`}
      </div>
    </div>
  );
}
