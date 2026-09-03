"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

// Format tokens instead of function props — functions cannot cross the
// server→client boundary, so formatting is resolved here on the client.
export type NumberFormat = "int" | "vnd" | "compact";

function fmt(value: number, format: NumberFormat = "int"): string {
  if (format === "vnd") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === "compact") {
    return `${new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)}đ`;
  }
  return new Intl.NumberFormat("vi-VN").format(value);
}

export interface TrendSeries {
  name: string;
  color: string;
  fill?: boolean;
  format?: NumberFormat;
}

/**
 * Interactive multi-series line/area chart. Each series is normalized to its
 * own maximum so series with different magnitudes (e.g. VND vs order count)
 * stay readable; hovering a day reveals a guide line + tooltip with the real
 * values.
 */
export function TrendChart({
  labels,
  data,
  series,
  ariaLabel,
}: {
  labels: string[];
  data: number[][];
  series: TrendSeries[];
  ariaLabel?: string;
}) {
  const gid = useId();
  const [active, setActive] = useState<number | null>(null);

  const W = 720;
  const H = 160;
  const padX = 14;
  const padTop = 12;
  const padBottom = 6;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;
  const n = labels.length;

  const x = (i: number) =>
    padX + (n <= 1 ? innerW / 2 : (innerW * i) / (n - 1));
  const maxes = series.map((_, si) => Math.max(1, ...data[si]));
  const y = (si: number, i: number) =>
    padTop + innerH * (1 - data[si][i] / maxes[si]);

  const linePath = (si: number) =>
    data[si]
      .map((_, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(si, i).toFixed(1)}`)
      .join(" ");
  const areaPath = (si: number) =>
    `${linePath(si)} L ${x(n - 1).toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-[160px] w-full"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          {series.map(
            (s, si) =>
              s.fill && (
                <linearGradient
                  key={si}
                  id={`${gid}-${si}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop stopColor={s.color} stopOpacity=".2" />
                  <stop offset="1" stopColor={s.color} stopOpacity="0" />
                </linearGradient>
              ),
          )}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={W - padX}
            y1={padTop + innerH * t}
            y2={padTop + innerH * t}
            stroke="#e8eef6"
            strokeWidth={1}
          />
        ))}
        {series.map(
          (s, si) =>
            s.fill && <path key={si} d={areaPath(si)} fill={`url(#${gid}-${si})`} />,
        )}
        {series.map((s, si) => (
          <path
            key={si}
            d={linePath(si)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {active !== null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={padTop}
            y2={padTop + innerH}
            stroke="#94a9c6"
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {active !== null &&
          series.map((s, si) => (
            <circle
              key={si}
              cx={x(active)}
              cy={y(si, active)}
              r={4}
              fill="#fff"
              stroke={s.color}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        {labels.map((_, i) => {
          const w = innerW / Math.max(1, n);
          return (
            <rect
              key={i}
              x={x(i) - w / 2}
              y={0}
              width={w}
              height={H}
              fill="transparent"
              onMouseEnter={() => setActive(i)}
            />
          );
        })}
      </svg>

      <div className="mt-1 flex justify-between px-2 text-[10px] text-[#7890b0]">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>

      {active !== null && (
        <div
          className="pointer-events-none absolute -top-1 z-10 rounded-md bg-[#0e2b59] px-2 py-1 text-[10px] whitespace-nowrap text-white shadow-md"
          style={{
            left: `${(x(active) / W) * 100}%`,
            transform:
              active > n / 2 ? "translateX(-100%)" : "translateX(-4px)",
          }}
        >
          <p className="font-bold">{labels[active]}</p>
          {series.map((s, si) => (
            <p key={si} className="flex items-center gap-1">
              <i
                className="size-1.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.name}: {fmt(data[si][active], s.format)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

/**
 * Interactive donut chart. Hovering a segment (or its legend row) highlights
 * the slice and swaps the centre readout to that segment's value.
 */
export function DonutChart({
  segments,
  centerTitle = "Tổng",
  format = "int",
  size = 144,
}: {
  segments: DonutSegment[];
  centerTitle?: string;
  format?: NumberFormat;
  size?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const r = 42;
  const c = 50;
  const circ = 2 * Math.PI * r;
  const stroke = 14;

  const arcs = segments.map((seg, i) => {
    const prev = segments.slice(0, i).reduce((sum, s) => sum + s.value, 0);
    const dash = (seg.value / total) * circ;
    return { seg, dash, gap: circ - dash, offset: -(prev / total) * circ };
  });

  const shown = active !== null ? segments[active] : null;

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#eef2f8"
            strokeWidth={stroke}
          />
          {arcs.map((a, i) => (
            <circle
              key={a.seg.label}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={a.seg.color}
              strokeWidth={active === i ? stroke + 3 : stroke}
              strokeDasharray={`${a.dash} ${a.gap}`}
              strokeDashoffset={a.offset}
              strokeLinecap="butt"
              className="cursor-pointer transition-[stroke-width] duration-150"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <span className="block text-[10px] text-[#7890b0]">
              {shown ? shown.label : centerTitle}
            </span>
            <strong className="text-sm text-[#112f5b]">
              {fmt(shown ? shown.value : total, format)}
            </strong>
          </div>
        </div>
      </div>

      <ul className="min-w-0 space-y-2 text-[11px]">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={cn(
              "flex cursor-pointer items-center gap-2 font-bold text-[#314e75] transition-opacity",
              active !== null && active !== i && "opacity-45",
            )}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <i
              className="size-2 shrink-0 rounded-full"
              style={{ background: seg.color }}
            />
            <span className="flex-1">{seg.label}</span>
            <span className="text-[#537098]">{fmt(seg.value, format)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
