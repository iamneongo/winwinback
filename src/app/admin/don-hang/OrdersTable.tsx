"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";

export type OrderTableRow = {
  id: string;
  externalOrderId: string;
  name: string;
  email: string;
  productName: string;
  platform: "shopee" | "tiktok";
  orderAmount: number;
  commissionAmount: number;
  cashbackAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

const statusVariant = { pending: "warning", confirmed: "default", completed: "success", cancelled: "destructive" } as const;
const columns: ColumnDef<OrderTableRow>[] = [
  { accessorKey: "externalOrderId", header: "Mã đơn", size: 165, cell: ({ row }) => <b className="break-all text-[#365780]">{row.original.externalOrderId}</b> },
  { id: "user", header: "Người dùng", size: 180, enableSorting: false, cell: ({ row }) => <span><b className="block text-[#2f4f78]">{row.original.name}</b><small className="break-all text-[#8aa0bd]">{row.original.email}</small></span> },
  { accessorKey: "productName", header: "Sản phẩm", size: 220, cell: ({ row }) => <span className="line-clamp-2">{row.original.productName}</span> },
  { accessorKey: "platform", header: "Sàn", size: 105, cell: ({ row }) => platformLabel[row.original.platform] },
  { accessorKey: "orderAmount", header: "Giá trị đơn", size: 120, cell: ({ row }) => formatVnd(row.original.orderAmount) },
  { accessorKey: "commissionAmount", header: "Hoa hồng", size: 110, cell: ({ row }) => formatVnd(row.original.commissionAmount) },
  { accessorKey: "cashbackAmount", header: "Hoàn tiền", size: 110, cell: ({ row }) => <b className="text-[#168146]">{formatVnd(row.original.cashbackAmount)}</b> },
  { accessorKey: "status", header: "Trạng thái", size: 115, cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{orderStatusLabel[row.original.status]}</Badge> },
  { accessorKey: "createdAt", header: "Ngày tạo", size: 110, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN") },
  { id: "actions", header: "Cập nhật", size: 160, enableSorting: false, cell: ({ row }) => <OrderStatusControl orderId={row.original.id} status={row.original.status} /> },
];

export function OrdersTable({ rows, total, page }: { rows: OrderTableRow[]; total: number; page: number }) {
  return <AdminDataTable data={rows} columns={columns} totalRows={total} page={page} pageSize={25} ariaLabel="Danh sách đơn hàng" searchPlaceholder="Tìm mã đơn, sản phẩm, người dùng..." filters={[
    { key: "status", label: "Tất cả trạng thái", options: [{ value: "pending", label: "Chờ duyệt" }, { value: "confirmed", label: "Đã xác nhận" }, { value: "completed", label: "Hoàn tất" }, { value: "cancelled", label: "Đã hủy" }] },
    { key: "platform", label: "Tất cả sàn", options: [{ value: "shopee", label: "Shopee" }, { value: "tiktok", label: "TikTok Shop" }] },
  ]} minWidth="1400px" emptyMessage="Không tìm thấy đơn hàng phù hợp." />;
}
