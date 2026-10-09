"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { OrderDecisionControls } from "@/components/admin/OrderDecisionControls";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";

export type CashbackTableRow = {
  id: string;
  externalOrderId: string;
  name: string;
  email: string;
  platform: "shopee" | "tiktok";
  orderAmount: number;
  cashbackAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

const statusVariant = { pending: "warning", confirmed: "success", completed: "success", cancelled: "destructive" } as const;
const columns: ColumnDef<CashbackTableRow>[] = [
  { accessorKey: "externalOrderId", header: "Mã YC / Mã đơn", size: 180, cell: ({ row }) => <Link href={`/admin/yeu-cau-hoan-tien/${row.original.id}`} className="font-semibold text-[#1261ed] hover:underline">YC{row.original.externalOrderId}</Link> },
  { id: "user", header: "Người dùng", size: 180, enableSorting: false, cell: ({ row }) => <span><b className="block text-[#2f4f78]">{row.original.name}</b><small className="break-all text-[#8aa0bd]">{row.original.email}</small></span> },
  { accessorKey: "platform", header: "Sàn", size: 110, cell: ({ row }) => platformLabel[row.original.platform] },
  { accessorKey: "orderAmount", header: "Giá trị đơn", size: 130, cell: ({ row }) => formatVnd(row.original.orderAmount) },
  { accessorKey: "cashbackAmount", header: "Hoàn tiền", size: 130, cell: ({ row }) => <b className="text-[#168146]">{formatVnd(row.original.cashbackAmount)}</b> },
  { accessorKey: "status", header: "Trạng thái", size: 120, cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{orderStatusLabel[row.original.status]}</Badge> },
  { accessorKey: "createdAt", header: "Ngày tạo", size: 115, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN") },
  { id: "actions", header: "Hành động", size: 170, enableSorting: false, cell: ({ row }) => row.original.status === "pending" ? <OrderDecisionControls orderId={row.original.id} /> : <span className="text-[#8ba0bb]">Đã xử lý</span> },
];

export function CashbackTable({ rows, total, page }: { rows: CashbackTableRow[]; total: number; page: number }) {
  return <AdminDataTable data={rows} columns={columns} totalRows={total} page={page} pageSize={20} ariaLabel="Danh sách yêu cầu hoàn tiền" searchPlaceholder="Tìm mã đơn, người dùng..." filters={[
    { key: "status", label: "Tất cả trạng thái", options: [{ value: "pending", label: "Chờ duyệt" }, { value: "confirmed", label: "Đã duyệt" }, { value: "completed", label: "Hoàn tất" }, { value: "cancelled", label: "Từ chối" }] },
    { key: "platform", label: "Tất cả sàn", options: [{ value: "shopee", label: "Shopee" }, { value: "tiktok", label: "TikTok Shop" }] },
  ]} minWidth="1150px" emptyMessage="Không tìm thấy yêu cầu phù hợp." getRowHref={(row) => `/admin/yeu-cau-hoan-tien/${row.id}`} />;
}
