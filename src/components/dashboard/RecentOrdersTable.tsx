"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ShopeeIcon, TikTokIcon } from "@/components/sections/BrandIcons";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";

export type RecentOrderRow = {
  id: string;
  platform: "shopee" | "tiktok";
  externalOrderId: string;
  orderedAt: string;
  orderAmount: number;
  cashbackAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

const orderStateTone: Record<RecentOrderRow["status"], string> = {
  pending: "bg-[#fff5df] text-[#a95e00]",
  confirmed: "bg-[#e7f7ef] text-[#168146]",
  completed: "bg-[#e7f7ef] text-[#168146]",
  cancelled: "bg-[#fee9e8] text-[#b5322e]",
};

const columns: ColumnDef<RecentOrderRow>[] = [
  { accessorKey: "platform", header: "Sàn", size: 120, enableSorting: false, cell: ({ row }) => <span className="inline-flex items-center gap-2 font-bold text-[#244a7c]"><span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md ${row.original.platform === "shopee" ? "bg-[#ee4d2d]" : "bg-[#090b0f]"}`}>{row.original.platform === "shopee" ? <ShopeeIcon className="size-3.5" white /> : <TikTokIcon className="size-4" />}</span>{platformLabel[row.original.platform]}</span> },
  { accessorKey: "externalOrderId", header: "Mã đơn hàng", size: 145, cell: ({ row }) => <Link href={`/dashboard/don-hang/${row.original.id}`} className="block truncate font-semibold text-[#1261ed] hover:underline" title={row.original.externalOrderId}>#{row.original.externalOrderId}</Link> },
  { accessorKey: "orderedAt", header: "Ngày mua", size: 105, cell: ({ row }) => new Date(row.original.orderedAt).toLocaleDateString("vi-VN") },
  { accessorKey: "orderAmount", header: "Giá trị đơn", size: 115, cell: ({ row }) => <span className="font-semibold text-[#173861]">{formatVnd(row.original.orderAmount)}</span> },
  { accessorKey: "cashbackAmount", header: "Hoàn tiền", size: 110, cell: ({ row }) => <span className="font-bold text-[#168146]">{formatVnd(row.original.cashbackAmount)}</span> },
  { accessorKey: "status", header: "Trạng thái", size: 120, enableSorting: false, cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${orderStateTone[row.original.status]}`}>{orderStatusLabel[row.original.status]}</span> },
];

export function RecentOrdersTable({ rows }: { rows: RecentOrderRow[] }) {
  return <AdminDataTable
    data={rows}
    columns={columns}
    totalRows={rows.length}
    page={1}
    pageSize={5}
    mode="client"
    variant="preview"
    ariaLabel="Đơn hàng gần đây"
    emptyMessage="Chưa có đơn hàng nào. Hãy tạo link hoàn tiền để bắt đầu."
    minWidth="715px"
    getRowHref={(row) => `/dashboard/don-hang/${row.id}`}
  />;
}
