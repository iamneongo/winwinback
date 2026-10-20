"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";

type LuckyDrawWheelProps = {
  winningNumber: string | null;
  periodName: string | null;
};

const center = 200;
const radius = 168;

function point(angle: number, distance: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: center + Math.cos(radians) * distance, y: center + Math.sin(radians) * distance };
}

function sectorPath(index: number) {
  const start = point(index * 45 - 22.5, radius);
  const end = point(index * 45 + 22.5, radius);
  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`;
}

function PrizeIcon({ index, x, y }: { index: number; x: number; y: number }) {
  const type = index % 4;
  return <g transform={`translate(${x} ${y})`} aria-hidden="true">
    {type === 0 && <>
      <rect x="-21" y="-14" width="42" height="35" rx="5" fill="url(#giftFill)" stroke="#c96505" strokeWidth="2" />
      <rect x="-24" y="-18" width="48" height="11" rx="3" fill="#ffc74d" stroke="#c96505" strokeWidth="2" />
      <path d="M -4 -17 V 21 M 4 -17 V 21" stroke="#fff2af" strokeWidth="4" />
      <path d="M 0 -19 C -24 -25 -13 -39 -2 -24 M 0 -19 C 24 -25 13 -39 2 -24" fill="none" stroke="#f27f15" strokeWidth="4" />
    </>}
    {type === 1 && <>
      <circle r="25" fill="url(#coinFill)" stroke="#d57907" strokeWidth="3" />
      <circle r="19" fill="none" stroke="#fff4a0" strokeWidth="2" />
      <text y="11" textAnchor="middle" fill="#a95a00" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900">₫</text>
    </>}
    {type === 2 && <>
      <path d="M -25 -15 H 25 V -7 C 17 -5 17 5 25 7 V 15 H -25 V 7 C -17 5 -17 -5 -25 -7 Z" fill="url(#giftFill)" stroke="#d4790d" strokeWidth="2" />
      <path d="M -6 -14 V 14" stroke="#fff1ab" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="8" r="6" fill="#fff1ab" />
    </>}
    {type === 3 && <>
      <path d="M -18 -10 H 18 L 15 22 H -15 Z" fill="url(#giftFill)" stroke="#b66007" strokeWidth="2" />
      <path d="M -9 -10 C -9 -31 9 -31 9 -10" fill="none" stroke="#d88210" strokeWidth="4" />
      <path d="M -3 0 L 3 -4 L 1 7" fill="none" stroke="#fff3b4" strokeWidth="3" strokeLinecap="round" />
    </>}
  </g>;
}

export function LuckyDrawWheel({ winningNumber, periodName }: LuckyDrawWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const timer = useRef<number | null>(null);
  const validNumber = winningNumber && /^\d{4}$/.test(winningNumber) ? winningNumber : null;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  function finish() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    setIsSpinning(false);
    setHasRevealed(true);
  }

  function replayResult() {
    if (!validNumber || isSpinning) return;
    // A display-only replay of the official four-digit result; prizes and
    // payouts were already determined server-side when the period was drawn.
    const offset = (Number(validNumber) / 10000) * 360 - 22.5;
    const nextTurn = Math.ceil(rotation / 360) * 360 + 360 * 5 - offset;
    setHasRevealed(false);
    setRotation(nextTurn);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasRevealed(true);
      return;
    }
    setIsSpinning(true);
    timer.current = window.setTimeout(finish, 4900);
  }

  return (
    <div className="relative mx-auto w-full max-w-[430px] text-center" aria-label={periodName ? `Vòng quay kết quả ${periodName}` : "Vòng quay chờ kỳ tiếp theo"}>
      <div className="absolute left-1/2 top-[-12px] z-20 -translate-x-1/2 drop-shadow-[0_4px_2px_rgba(22,13,0,0.45)]" aria-hidden="true">
        <div className="size-8 rounded-full border-[5px] border-[#ffe475] bg-[#fa9a29]" />
        <div className="mx-auto -mt-1 h-0 w-0 border-x-[16px] border-t-[27px] border-x-transparent border-t-[#ffd34f]" />
      </div>
      <div className="relative aspect-square rounded-full border-[12px] border-[#e1a62c] bg-[#ffdc60] p-[7px] shadow-[inset_0_0_0_5px_#ffefa3,0_10px_15px_rgba(4,14,34,0.55)] sm:border-[15px] sm:p-[9px]">
        <div
          className={`h-full w-full rounded-full ${isSpinning ? "transition-transform duration-[4800ms] ease-[cubic-bezier(0.1,0.72,0.08,1)] motion-reduce:duration-0" : ""}`}
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && event.propertyName === "transform") finish();
          }}
        >
          <svg className="h-full w-full rounded-full" viewBox="0 0 400 400" role="img" aria-label="Vòng quay minh họa gồm tám ô quà; số trúng chính thức được công bố riêng">
            <defs>
              <linearGradient id="giftFill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffde62" /><stop offset="0.55" stopColor="#ffa92b" /><stop offset="1" stopColor="#ed7411" /></linearGradient>
              <radialGradient id="coinFill"><stop stopColor="#fff8ae" /><stop offset="0.6" stopColor="#ffd750" /><stop offset="1" stopColor="#e79212" /></radialGradient>
            </defs>
            <circle cx="200" cy="200" r="195" fill="#0a7e21" />
            {Array.from({ length: 8 }, (_, index) => {
              const icon = point(index * 45, 122);
              return <g key={index}>
                <path d={sectorPath(index)} fill={index % 2 === 0 ? "#fffef1" : "#8be251"} stroke="#2b9e26" strokeWidth="2" />
                <PrizeIcon index={index} x={icon.x} y={icon.y} />
              </g>;
            })}
            <circle cx="200" cy="200" r="169" fill="none" stroke="#fff5a0" strokeWidth="4" />
            {Array.from({ length: 24 }, (_, index) => {
              const dot = point(index * 15, 183);
              return <circle key={index} cx={dot.x} cy={dot.y} r="5" fill={index % 2 === 0 ? "#fff8c7" : "#ffbd36"} />;
            })}
          </svg>
        </div>
        <button
          type="button"
          onClick={replayResult}
          disabled={!validNumber || isSpinning}
          aria-label={validNumber ? "Xem lại hoạt ảnh kết quả kỳ quay" : "Chờ công bố kết quả kỳ quay"}
          className="absolute left-1/2 top-1/2 z-10 flex size-[27%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[5px] border-[#ffe475] bg-gradient-to-b from-[#fbab37] to-[#e26419] text-center text-[clamp(10px,2.1vw,17px)] font-black leading-tight text-white shadow-[0_4px_0_#a94412,0_6px_9px_rgba(62,33,0,0.4)] transition-[filter,scale] hover:brightness-110 active:scale-95 disabled:cursor-default disabled:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <TrendingUp className="mb-1 size-5 sm:size-7" strokeWidth={3} aria-hidden="true" />
          {isSpinning ? <>ĐANG<br />QUAY</> : validNumber ? <>XEM<br />KẾT QUẢ</> : <>CHỜ<br />QUAY</>}
        </button>
      </div>
      <p className="mt-3 min-h-5 text-xs font-semibold leading-5 text-[#ffefad]" aria-live="polite">
        {validNumber ? (hasRevealed ? <>Số trúng đã công bố: <span className="font-mono text-sm font-black text-white">{validNumber}</span></> : "Nhấn giữa vòng quay để xem lại kết quả đã công bố") : "Vòng quay chỉ phát lại kết quả chính thức sau khi đóng kỳ"}
      </p>
    </div>
  );
}
