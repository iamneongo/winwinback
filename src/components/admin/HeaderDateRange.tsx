"use client";

import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function fmt(date: Date) {
  return date.toLocaleDateString("vi-VN");
}

export function HeaderDateRange({
  defaultRange,
}: {
  defaultRange?: { from: Date; to: Date };
}) {
  const [range, setRange] = useState<DateRange | undefined>(defaultRange);

  const label =
    range?.from && range?.to
      ? `${fmt(range.from)} - ${fmt(range.to)}`
      : range?.from
        ? fmt(range.from)
        : "Chọn khoảng ngày";

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            className="hidden text-xs font-medium text-[#7187a6] xl:inline-flex"
          />
        }
      >
        <CalendarDays className="size-4" />
        {label}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-2">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={range}
          onSelect={setRange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
