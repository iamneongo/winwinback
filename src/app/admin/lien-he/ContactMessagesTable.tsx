"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { CONTACT_STATUS_LABELS, type ContactMessageStatus } from "@/lib/contact";

export type ContactMessageTableRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

const statusVariant: Record<ContactMessageStatus, "default" | "secondary" | "success"> = {
  new: "default",
  read: "secondary",
  resolved: "success",
};

const columns: ColumnDef<ContactMessageTableRow>[] = [
  {
    accessorKey: "name",
    header: "Người gửi",
    size: 240,
    cell: ({ row }) => <div className="min-w-0">
      <Link href={`/admin/lien-he/${row.original.id}`} className="block truncate font-semibold text-[#1261ed] hover:underline">
        {row.original.name}
      </Link>
      <span className="mt-0.5 block truncate text-xs text-[#587298]" title={row.original.email}>{row.original.email}</span>
    </div>,
  },
  { accessorKey: "topic", header: "Chủ đề", size: 190, cell: ({ row }) => <span className="block truncate" title={row.original.topic}>{row.original.topic}</span> },
  { accessorKey: "message", header: "Nội dung", size: 340, enableSorting: false, cell: ({ row }) => <span className="block line-clamp-2 break-words leading-5" title={row.original.message}>{row.original.message}</span> },
  {
    accessorKey: "createdAt",
    header: "Thời gian",
    size: 160,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      dateStyle: "short",
      timeStyle: "short",
    }),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    size: 105,
    cell: ({ row }) => {
      const status: ContactMessageStatus = row.original.status === "read" || row.original.status === "resolved" ? row.original.status : "new";
      return <Badge variant={statusVariant[status]}>{CONTACT_STATUS_LABELS[status]}</Badge>;
    },
  },
];

export function ContactMessagesTable({ rows, total, page }: { rows: ContactMessageTableRow[]; total: number; page: number }) {
  return <AdminDataTable
    data={rows}
    columns={columns}
    totalRows={total}
    page={page}
    pageSize={20}
    ariaLabel="Danh sách yêu cầu liên hệ"
    searchPlaceholder="Tìm tên, email, chủ đề, nội dung..."
    filters={[{ key: "status", label: "Tất cả trạng thái", options: [
      { value: "new", label: "Mới" },
      { value: "read", label: "Đã xem" },
      { value: "resolved", label: "Đã xử lý" },
    ] }]}
    minWidth="1035px"
    emptyMessage="Không có yêu cầu liên hệ phù hợp."
    getRowHref={(row) => `/admin/lien-he/${row.id}`}
  />;
}
