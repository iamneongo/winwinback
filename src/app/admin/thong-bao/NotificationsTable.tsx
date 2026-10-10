"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import type { Notification } from "@/db/schema";

const typeLabels: Record<string, string> = {
  cashback: "Hoàn tiền",
  cashback_reversed: "Điều chỉnh hoàn tiền",
  withdrawal: "Rút tiền",
  withdrawal_request: "Yêu cầu rút tiền",
  order: "Đơn hàng",
  reward: "Phần thưởng",
  system: "Hệ thống",
};

const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: "title",
    header: "Thông báo",
    size: 270,
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link href={`/admin/thong-bao/${row.original.id}`} className="font-semibold text-[#234168] hover:text-[#1261ed] hover:underline">
          {row.original.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7188a6]">{row.original.body}</p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Danh mục",
    size: 155,
    cell: ({ row }) => typeLabels[row.original.type] ?? typeLabels.system,
  },
  {
    accessorKey: "readAt",
    header: "Trạng thái",
    size: 120,
    cell: ({ row }) => row.original.readAt
      ? <Badge variant="secondary">Đã đọc</Badge>
      : <Badge variant="warning">Chưa đọc</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Thời gian",
    size: 185,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "medium",
      timeStyle: "short",
    }),
  },
];

export function NotificationsTable({ rows, total, page }: { rows: Notification[]; total: number; page: number }) {
  return (
    <AdminDataTable
      data={rows}
      columns={columns}
      totalRows={total}
      page={page}
      pageSize={20}
      ariaLabel="Danh sách thông báo quản trị"
      searchPlaceholder="Tìm tiêu đề hoặc nội dung..."
      filters={[
        { key: "type", label: "Tất cả danh mục", options: Object.entries(typeLabels).map(([value, label]) => ({ value, label })) },
        { key: "read", label: "Mọi trạng thái", options: [{ value: "unread", label: "Chưa đọc" }, { value: "read", label: "Đã đọc" }] },
      ]}
      minWidth="850px"
      emptyMessage="Không tìm thấy thông báo phù hợp."
      getRowHref={(row) => `/admin/thong-bao/${row.id}`}
    />
  );
}
