"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export interface AdminFilterConfig {
  name: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

export function AdminFilters({
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
}: {
  searchPlaceholder?: string;
  filters?: AdminFilterConfig[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");

  function commit(next: URLSearchParams) {
    const query = next.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    commit(next);
  }

  // Debounce the free-text search so we don't push a route on every keystroke.
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q === current) return;
    const id = setTimeout(() => setParam("q", q || null), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasActive = q.length > 0 || filters.some((f) => params.get(f.name));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex h-9 w-56 items-center gap-2 rounded-lg border border-[#dbe6f2] px-3 text-xs text-[#8298b6]">
        <Search className="size-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-transparent outline-none placeholder:text-[#9aabc3]"
          placeholder={searchPlaceholder}
        />
      </label>

      {filters.map((filter) => (
        <Select
          key={filter.name}
          value={params.get(filter.name) ?? ALL}
          onValueChange={(value) =>
            setParam(filter.name, !value || value === ALL ? null : value)
          }
        >
          <SelectTrigger className="h-9 w-40 text-xs">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{filter.placeholder}</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActive && (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="text-xs text-[#506a90]"
          onClick={() => {
            setQ("");
            const next = new URLSearchParams(params.toString());
            next.delete("q");
            filters.forEach((f) => next.delete(f.name));
            commit(next);
          }}
        >
          <X className="size-4" />
          Xoá lọc
        </Button>
      )}
    </div>
  );
}

export function AdminSearchInput({
  action,
  placeholder,
  defaultValue,
}: {
  action: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form action={action} className="hidden xl:block">
      <label className="flex h-9 w-[264px] items-center gap-2 rounded-lg border border-[#e4ebf5] px-3 text-xs text-[#8aa0bd]">
        <Search className="size-4" />
        <input
          name="q"
          defaultValue={defaultValue}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9aabc3]"
          placeholder={placeholder}
        />
      </label>
    </form>
  );
}
