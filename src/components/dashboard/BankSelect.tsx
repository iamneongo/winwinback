"use client";

import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bankOptions } from "@/lib/banks";

const triggerClass = "h-11 rounded-lg border-[#d9e5f4] px-3 text-sm text-[#244a7c] focus-visible:border-[#8bd949] focus-visible:ring-[#b7e961]/25";

export function BankSelect({
  value,
  onValueChange,
  name = "bankName",
  required = true,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  required?: boolean;
  id?: string;
}) {
  const selected = bankOptions.find((bank) => bank.name === value);
  const legacyValue = value && !selected ? value : "";

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={selected?.code ?? (legacyValue ? "legacy" : "")} onValueChange={(code) => {
        const bank = bankOptions.find((option) => option.code === code);
        if (bank) onValueChange(bank.name);
      }}>
        <SelectTrigger id={id} aria-label="Chọn ngân hàng" aria-required={required} className={triggerClass}>
          <SelectValue placeholder="Chọn ngân hàng">
            {selected ? <BankOptionView name={selected.name} logo={selected.logo} /> : legacyValue || undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {legacyValue && <SelectItem value="legacy"><span className="text-sm">{legacyValue} (đã lưu)</span></SelectItem>}
          {bankOptions.map((bank) => (
            <SelectItem key={bank.code} value={bank.code} className="min-h-11 py-2">
              <BankOptionView name={bank.name} logo={bank.logo} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function BankOptionView({ name, logo }: { name: string; logo: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Image src={logo} alt="" width={26} height={26} unoptimized className="size-[26px] shrink-0 rounded-full bg-white object-contain" />
      <span className="truncate">{name}</span>
    </span>
  );
}
