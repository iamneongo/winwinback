"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { WithdrawalControls } from "@/components/admin/WithdrawalControls";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";
import { withdrawalStatusLabel } from "@/lib/labels";

export type WithdrawalTableRow = {
  id: string;
  name: string;
  email: string;
  amount: number;
  bankName: string;
  bankAccountLast4: string;
  accountHolder: string;
  status: "pending" | "approved" | "rejected" | "paid";
  requestedAt: string;
  processedAt: string | null;
};

const statusVariant = { pending: "warning", approved: "default", rejected: "destructive", paid: "success" } as const;
const columns: ColumnDef<WithdrawalTableRow>[] = [
  { id: "code", header: "Mã YC", size: 115, enableSorting: false, cell: ({ row }) => <Link href={`/admin/rut-tien/${row.original.id}`} className="font-bold text-[#1261ed] hover:underline">RT{row.original.id.slice(0, 8).toUpperCase()}</Link> },
  { id: "user", header: "Người dùng", size: 190, enableSorting: false, cell: ({ row }) => <span><b className="block text-[#2f4f78]">{row.original.name}</b><small className="break-all text-[#8aa0bd]">{row.original.email}</small></span> },
  { accessorKey: "amount", header: "Số tiền", size: 120, cell: ({ row }) => <b className="text-[#c0392b]">{formatVnd(row.original.amount)}</b> },
  { accessorKey: "bankName", header: "Ngân hàng", size: 200, cell: ({ row }) => <span><b className="block text-[#35557e]">{row.original.bankName}</b><small className="text-[#8aa0bd]">**** {row.original.bankAccountLast4} · {row.original.accountHolder}</small></span> },
  { accessorKey: "status", header: "Trạng thái", size: 120, cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{withdrawalStatusLabel[row.original.status]}</Badge> },
  { accessorKey: "requestedAt", header: "Ngày yêu cầu", size: 150, cell: ({ row }) => new Date(row.original.requestedAt).toLocaleString("vi-VN") },
  { accessorKey: "processedAt", header: "Ngày xử lý", size: 150, cell: ({ row }) => row.original.processedAt ? new Date(row.original.processedAt).toLocaleString("vi-VN") : "—" },
  { id: "actions", header: "Hành động", size: 160, enableSorting: false, cell: ({ row }) => <WithdrawalControls withdrawalId={row.original.id} status={row.original.status} /> },
];

export function WithdrawalsTable({ rows, total, page }: { rows: WithdrawalTableRow[]; total: number; page: number }) {
  return <AdminDataTable data={rows} columns={columns} totalRows={total} page={page} pageSize={25} ariaLabel="Danh sách yêu cầu rút tiền" searchPlaceholder="Tìm người dùng, chủ tài khoản..." filters={[{ key: "status", label: "Tất cả trạng thái", options: [{ value: "pending", label: "Chờ xử lý" }, { value: "approved", label: "Đã duyệt" }, { value: "paid", label: "Đã chi" }, { value: "rejected", label: "Từ chối" }] }]} minWidth="1200px" emptyMessage="Không tìm thấy yêu cầu rút tiền phù hợp." getRowHref={(row) => `/admin/rut-tien/${row.id}`} />;
}
