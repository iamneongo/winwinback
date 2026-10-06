"use client";

import { useEffect, useState, useTransition } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollAreaContent, ScrollAreaCorner, ScrollAreaViewport, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type AdminTableFilter = {
  key: "status" | "platform" | "role";
  label: string;
  options: { value: string; label: string }[];
};

const ALL_FILTERS = "__all__";

type AdminDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  totalRows: number;
  page: number;
  pageSize: number;
  ariaLabel: string;
  searchPlaceholder?: string;
  filters?: AdminTableFilter[];
  emptyMessage?: string;
  minWidth?: string;
  mode?: "server" | "client";
};

export function AdminDataTable<TData>({
  data,
  columns,
  totalRows,
  page,
  pageSize,
  ariaLabel,
  searchPlaceholder = "Tìm kiếm...",
  filters = [],
  emptyMessage = "Không tìm thấy dữ liệu phù hợp.",
  minWidth = "900px",
  mode = "server",
}: AdminDataTableProps<TData>) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useQueryStates({
    q: parseAsString.withDefault(""),
    trang: parseAsInteger.withDefault(1),
    sort: parseAsString.withDefault(""),
    dir: parseAsString.withDefault("desc"),
    status: parseAsString.withDefault(""),
    platform: parseAsString.withDefault(""),
    role: parseAsString.withDefault(""),
  }, { shallow: false, history: "push", scroll: false, startTransition });
  const [draft, setDraft] = useState(query.q);
  const [localPage, setLocalPage] = useState(1);
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const [localFilters, setLocalFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => { if (mode === "server") setDraft(query.q); }, [mode, query.q]);
  useEffect(() => {
    if (mode === "client") return;
    if (draft === query.q) return;
    const timer = window.setTimeout(() => {
      void setQuery({ q: draft.trim(), trang: 1 });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, mode, query.q, setQuery]);

  const sorting: SortingState = mode === "client" ? localSorting : query.sort
    ? [{ id: query.sort, desc: query.dir !== "asc" }]
    : [];
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  // TanStack Table manages mutable table state; React Compiler intentionally skips this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId: (row, index) => {
      const id = (row as { id?: unknown }).id;
      return typeof id === "string" ? id : String(index);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: mode === "server",
    manualSorting: mode === "server",
    manualFiltering: mode === "server",
    pageCount: mode === "server" ? pageCount : undefined,
    state: { sorting, globalFilter: mode === "client" ? draft : "", columnFilters: localFilters, pagination: { pageIndex: (mode === "client" ? localPage : page) - 1, pageSize } },
  });
  const activeFilters = filters.some((filter) => mode === "client" ? localFilters.some((item) => item.id === filter.key && item.value) : Boolean(query[filter.key]));
  const currentPage = mode === "client" ? localPage : page;
  const visibleTotal = mode === "client" ? table.getFilteredRowModel().rows.length : totalRows;
  const visiblePageCount = mode === "client" ? Math.max(1, table.getPageCount()) : pageCount;
  const isLoading = mode === "server" && (pending || draft.trim() !== query.q);
  const pageNumbers = Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, visiblePageCount]))
    .filter((number) => number >= 1 && number <= visiblePageCount)
    .sort((a, b) => a - b);
  const goToPage = (target: number) => {
    if (mode === "client") setLocalPage(target);
    else void setQuery({ trang: target });
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[#dfe9f5] bg-white" aria-label={ariaLabel}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e8eef6] p-3 sm:p-4">
        <div className="relative min-w-[180px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#587298]" aria-hidden="true" />
          <Input
            aria-label={searchPlaceholder}
            value={draft}
            onChange={(event) => { setDraft(event.target.value); if (mode === "client") setLocalPage(1); }}
            placeholder={searchPlaceholder}
            className="h-10 pl-9 text-sm"
          />
        </div>
        {filters.map((filter) => {
          const selectedValue = (mode === "client" ? String(localFilters.find((item) => item.id === filter.key)?.value ?? "") : query[filter.key]) || ALL_FILTERS;
          const selectedLabel = selectedValue === ALL_FILTERS
            ? filter.label
            : filter.options.find((option) => option.value === selectedValue)?.label ?? filter.label;

          return (
            <Select
              key={filter.key}
              value={selectedValue}
              onValueChange={(selected) => {
                const value = selected === ALL_FILTERS ? "" : selected ?? "";
                if (mode === "client") {
                  setLocalFilters((current) => [...current.filter((item) => item.id !== filter.key), ...(value ? [{ id: filter.key, value }] : [])]);
                  setLocalPage(1);
                } else void setQuery({ [filter.key]: value, trang: 1 });
              }}
            >
              <SelectTrigger aria-label={filter.label} className="h-10 w-40 border-[#dbe6f3] text-sm font-medium text-[#34527d]">
                <SelectValue placeholder={filter.label}>{selectedLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTERS}>{filter.label}</SelectItem>
                {filter.options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
          );
        })}
        {(draft || activeFilters || sorting.length) ? (
          <Button variant="ghost" size="lg" onClick={() => { setDraft(""); if (mode === "client") { setLocalFilters([]); setLocalSorting([]); setLocalPage(1); } else void setQuery({ q: "", status: "", platform: "", role: "", sort: "", dir: "desc", trang: 1 }); }} className="text-[#49688f]">
            <X className="size-4" /> Xóa lọc
          </Button>
        ) : null}
      </div>

      <ScrollArea className="max-h-[65vh] lg:max-h-[720px]" aria-busy={isLoading}>
        <ScrollAreaViewport className="max-h-[65vh] overscroll-contain lg:max-h-[720px]">
          <ScrollAreaContent>
          <Table containerClassName="overflow-visible" className="table-fixed text-xs text-[#35537c]" style={{ minWidth }}>
        <TableHeader className="sticky top-0 z-10 bg-[#f8fbff] text-[#234168]">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const direction = header.column.getIsSorted();
                return (
                  <TableHead key={header.id} scope="col" style={{ width: header.getSize() }} className="px-3 py-3 text-xs font-bold">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          const next = direction === "asc" ? "desc" : direction === "desc" ? "" : "asc";
                          if (mode === "client") { setLocalSorting(next ? [{ id: header.column.id, desc: next === "desc" }] : []); setLocalPage(1); }
                          else void setQuery({ sort: next ? header.column.id : "", dir: next || "desc", trang: 1 });
                        }}
                        className="h-auto min-h-9 justify-start gap-1 px-0 text-left text-xs font-bold hover:bg-transparent hover:text-[#1261ed]"
                        aria-label={`Sắp xếp theo ${String(header.column.columnDef.header)}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {direction === "asc" ? <ArrowUp className="size-3.5" /> : direction === "desc" ? <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 text-[#8aa0bd]" />}
                      </Button>
                    ) : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? Array.from({ length: Math.min(pageSize, 8) }, (_, rowIndex) => (
            <TableRow key={`loading-${rowIndex}`} aria-hidden="true">
              {columns.map((column, cellIndex) => (
                <TableCell key={`loading-${rowIndex}-${cellIndex}`} className="px-3 py-3">
                  <Skeleton className={`h-4 ${cellIndex === 0 ? "w-3/4" : cellIndex === columns.length - 1 ? "w-1/3" : "w-1/2"}`} />
                </TableCell>
              ))}
            </TableRow>
          )) : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="min-w-0 px-3 py-3 align-top whitespace-normal">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          )) : (
            <TableRow><TableCell colSpan={columns.length} className="h-28 text-center text-sm text-[#587298]">{emptyMessage}</TableCell></TableRow>
          )}
        </TableBody>
          </Table>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
        <ScrollAreaCorner />
      </ScrollArea>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8eef6] px-3 py-3 text-sm text-[#49688f] sm:px-4">
        <p aria-live="polite">{visibleTotal ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, visibleTotal)} / ${visibleTotal}` : "0 kết quả"}{pending && mode === "server" ? " · Đang tải..." : ""}</p>
        <div className="flex items-center gap-1.5" role="navigation" aria-label={`Phân trang ${ariaLabel}`}>
          <Button variant="outline" size="icon-lg" aria-label="Trang trước" disabled={currentPage <= 1 || pending} onClick={() => goToPage(currentPage - 1)}><ChevronLeft className="size-4" /></Button>
          {pageNumbers.map((number, index) => <span key={number} className="contents">
            {index > 0 && number - pageNumbers[index - 1] > 1 ? <span className="hidden px-1 text-[#8aa0bd] sm:inline" aria-hidden="true">…</span> : null}
            <Button variant={number === currentPage ? "default" : "outline"} size="icon-lg" aria-label={`Trang ${number}`} aria-current={number === currentPage ? "page" : undefined} disabled={pending} className={number !== currentPage && number !== 1 && number !== visiblePageCount ? "hidden sm:inline-flex" : undefined} onClick={() => goToPage(number)}>{number}</Button>
          </span>)}
          <Button variant="outline" size="icon-lg" aria-label="Trang sau" disabled={currentPage >= visiblePageCount || pending} onClick={() => goToPage(currentPage + 1)}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
    </section>
  );
}
