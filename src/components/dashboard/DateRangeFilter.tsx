"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const WEEKDAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
function toInputValue(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function toLabel(date?: Date): string {
  return date ? date.toLocaleDateString("vi-VN") : "";
}

/**
 * Range picker for the orders filter. Submits `from`/`to` via hidden inputs so
 * the surrounding GET form keeps working exactly as the server page reads them.
 */
export function DateRangeFilter({
  defaultFrom,
  defaultTo,
}: {
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const [range, setRange] = React.useState<DateRange | undefined>(() => {
    const from = parseDate(defaultFrom);
    const to = parseDate(defaultTo);
    return from || to ? { from, to } : undefined;
  });

  const text = range?.from
    ? `${toLabel(range.from)}${range.to ? ` — ${toLabel(range.to)}` : ""}`
    : "";

  return (
    <label className="grid gap-1.5 text-xs font-bold text-[#213e67]">
      <span>Thời gian</span>
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className="flex h-11 items-center gap-2 rounded-lg border border-[#d9e5f4] bg-white px-3 text-sm font-medium text-[#35537c] outline-none transition focus:border-[#8bd950] focus:ring-2 focus:ring-[#b7e961]/25 aria-expanded:border-[#8bd950] aria-expanded:ring-2 aria-expanded:ring-[#b7e961]/25"
            />
          }
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-[#3d70b6]" />
          <span
            className={`min-w-0 flex-1 truncate text-left text-xs ${
              text ? "text-[#35537c]" : "text-[#8ba0bd]"
            }`}
          >
            {text || "Chọn khoảng thời gian"}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-2">
          <Calendar
            mode="range"
            numberOfMonths={2}
            weekStartsOn={1}
            defaultMonth={range?.from}
            selected={range}
            onSelect={setRange}
            formatters={{
              formatCaption: (date) =>
                date.toLocaleDateString("vi-VN", {
                  month: "long",
                  year: "numeric",
                }),
              formatWeekdayName: (date) => WEEKDAYS_VI[date.getDay()],
            }}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name="from" value={toInputValue(range?.from)} />
      <input type="hidden" name="to" value={toInputValue(range?.to)} />
    </label>
  );
}
