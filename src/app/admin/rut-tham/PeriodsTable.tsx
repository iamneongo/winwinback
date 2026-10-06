"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Dices } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";
import { DrawButton } from "./LuckyDrawForms";

export type PeriodTableRow = {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  status: string;
  eligibleTickets: number;
  potTotal: number;
  winningNumber: string | null;
  exactMatch: boolean | null;
  paidOut: number;
  createdAt: string;
};

const fmtDate = (value: string) => new Date(value).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const columns: ColumnDef<PeriodTableRow>[] = [
  { accessorKey: "name", header: "Kỳ", size: 165, cell: ({ row }) => <b className="text-[#244a7c]">{row.original.name}</b> },
  { accessorKey: "startAt", header: "Khoảng thời gian", size: 220, cell: ({ row }) => <span className="leading-5">{fmtDate(row.original.startAt)}<br />→ {fmtDate(row.original.endAt)}</span> },
  { accessorKey: "status", header: "Trạng thái", size: 115, cell: ({ row }) => <Badge variant={row.original.status === "drawn" ? "info" : "success"}>{row.original.status === "drawn" ? "Đã quay" : "Đang mở"}</Badge> },
  { id: "tickets", header: "Phiếu", size: 100, enableSorting: false, cell: ({ row }) => row.original.status === "drawn" ? "—" : `${row.original.eligibleTickets} phiếu` },
  { accessorKey: "potTotal", header: "Quỹ / Số trúng", size: 150, cell: ({ row }) => row.original.status === "drawn" ? <span>{formatVnd(row.original.potTotal)}<br /><b className="tracking-widest text-[#aa34de]">{row.original.winningNumber}</b></span> : "—" },
  { id: "result", header: "Kết quả", size: 205, enableSorting: false, cell: ({ row }) => row.original.status !== "drawn" ? "—" : row.original.exactMatch === null ? "Không có phiếu → cộng dồn" : row.original.exactMatch ? <b className="text-[#168146]">Trùng! Chi {formatVnd(row.original.paidOut)}</b> : <span className="text-[#e68b00]">Gần nhất nhận {formatVnd(row.original.paidOut)}</span> },
  { id: "actions", header: "Thao tác", size: 130, enableSorting: false, cell: ({ row }) => row.original.status === "drawn" ? <span className="inline-flex items-center gap-1 text-[#9fb0c7]"><Dices className="size-4" /> Đã quay</span> : <DrawButton periodId={row.original.id} /> },
];

export function PeriodsTable({ rows, total, page }: { rows: PeriodTableRow[]; total: number; page: number }) {
  return <AdminDataTable data={rows} columns={columns} totalRows={total} page={page} pageSize={20} ariaLabel="Danh sách kỳ rút thăm" searchPlaceholder="Tìm tên kỳ rút thăm..." filters={[{ key: "status", label: "Mọi trạng thái", options: [{ value: "open", label: "Đang mở" }, { value: "drawn", label: "Đã quay" }] }]} minWidth="1100px" emptyMessage="Không có kỳ rút thăm phù hợp." />;
}
