"use client";

import { useState } from "react";
import { vi } from "date-fns/locale";
import { CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateTimeValue(date: Date | undefined, hour: string, minute: string): string {
  if (!date || !hour || !minute) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${hour}:${minute}:00+07:00`;
}

export function DateTimeField({
  name,
  label,
  initialValue,
}: {
  name: string;
  label: string;
  /** Calendar fields in Vietnam time: YYYY-MM-DDTHH:mm. */
  initialValue?: string;
}) {
  const initial = initialValue?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  const [date, setDate] = useState<Date | undefined>(() => initial
    ? new Date(Number(initial[1]), Number(initial[2]) - 1, Number(initial[3]))
    : undefined);
  const [hour, setHour] = useState(initial?.[4] ?? "");
  const [minute, setMinute] = useState(initial?.[5] ?? "");
  const time = hour && minute ? `${hour}:${minute}` : "";
  const formattedDate = date?.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const selectedLabel = formattedDate
    ? `${formattedDate}${time ? ` · ${time}` : ""}`
    : `Chọn ${label.toLocaleLowerCase()}`;

  return (
    <>
      <input type="hidden" name={name} value={toDateTimeValue(date, hour, minute)} />
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-2 border-[#d9e5f4] px-3 text-left text-sm font-normal text-[#35537c] hover:bg-[#f8fbff]"
              aria-label={`${label}: ${selectedLabel}`}
              aria-required="true"
            />
          }
        >
          <CalendarDays className="size-4 shrink-0 text-[#6681a7]" />
          <span className={date ? "truncate" : "truncate text-[#6681a7]"}>
            {selectedLabel}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto gap-3 p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={vi}
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-[#e7edf5] pt-3 text-xs font-semibold text-[#34527d]">
            <Clock3 className="size-4 text-[#6681a7]" />
            <span>Giờ</span>
            <Select value={hour} onValueChange={(value) => setHour(value ?? "")}>
              <SelectTrigger aria-label={`Giờ ${label.toLocaleLowerCase()}`} className="ml-auto h-9 w-[76px]">
                <SelectValue placeholder="Giờ" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, index) => pad(index)).map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span aria-hidden="true">:</span>
            <Select value={minute} onValueChange={(value) => setMinute(value ?? "")}>
              <SelectTrigger aria-label={`Phút ${label.toLocaleLowerCase()}`} className="h-9 w-[76px]">
                <SelectValue placeholder="Phút" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 60 }, (_, index) => pad(index)).map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] leading-4 text-[#6681a7]">
            Thời gian theo múi giờ Việt Nam (UTC+7).
          </p>
        </PopoverContent>
      </Popover>
    </>
  );
}
