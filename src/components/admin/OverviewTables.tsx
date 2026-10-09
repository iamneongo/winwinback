"use client";

import Link from "next/link";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel, withdrawalStatusLabel } from "@/lib/labels";

type WithdrawalRow = {
  id: string;
  name: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
};

const withdrawalVariant: Record<WithdrawalRow["status"], "warning" | "default" | "destructive" | "success"> = {
  pending: "warning", approved: "default", rejected: "destructive", paid: "success",
};

const withdrawalColumns: ColumnDef<WithdrawalRow>[] = [
  { accessorKey: "name", header: "Người dùng", size: 125, cell: ({ row }) => <Link href={`/admin/rut-tien/${row.original.id}`} className="block truncate font-semibold text-[#1261ed] hover:underline" title={row.original.name}>{row.original.name}</Link> },
  { accessorKey: "amount", header: "Số tiền", size: 110, cell: ({ row }) => <span className="font-bold text-[#29476f]">{formatVnd(row.original.amount)}</span> },
  { accessorKey: "status", header: "Trạng thái", size: 115, enableSorting: false, cell: ({ row }) => <Badge variant={withdrawalVariant[row.original.status]}>{withdrawalStatusLabel[row.original.status]}</Badge> },
];

export function WithdrawalOverviewTable({ rows }: { rows: WithdrawalRow[] }) {
  return <AdminDataTable
    data={rows}
    columns={withdrawalColumns}
    totalRows={rows.length}
    page={1}
    pageSize={5}
    mode="client"
    variant="preview"
    ariaLabel="Yêu cầu rút tiền gần đây"
    emptyMessage="Chưa có yêu cầu rút tiền."
    minWidth="370px"
    getRowHref={(row) => `/admin/rut-tien/${row.id}`}
  />;
}

type PendingOrderRow = {
  id: string;
  externalOrderId: string;
  name: string;
  email: string;
  image: string | null;
  platform: "shopee" | "tiktok";
  orderAmount: number;
  cashbackAmount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

const orderVariant: Record<PendingOrderRow["status"], "warning" | "success" | "default" | "destructive"> = {
  pending: "warning", confirmed: "success", completed: "default", cancelled: "destructive",
};

const orderColumns: ColumnDef<PendingOrderRow>[] = [
  { accessorKey: "externalOrderId", header: "Mã đơn", size: 130, cell: ({ row }) => <Link href={`/admin/don-hang/${row.original.id}`} className="block truncate font-bold text-[#1261ed] hover:underline" title={row.original.externalOrderId}>{row.original.externalOrderId}</Link> },
  { accessorKey: "name", header: "Người dùng", size: 175, cell: ({ row }) => <span className="flex min-w-0 items-center gap-2"><span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5effe] text-[10px] font-black text-[#3676cb]">{row.original.image ? <Image src={row.original.image} alt="" width={24} height={24} className="size-full object-cover" /> : row.original.name.charAt(0)}</span><span className="min-w-0"><b className="block truncate text-[#2f4f78]">{row.original.name}</b><small className="block truncate text-[#7188a6]">{row.original.email}</small></span></span> },
  { accessorKey: "platform", header: "Sàn", size: 92, enableSorting: false, cell: ({ row }) => platformLabel[row.original.platform] },
  { accessorKey: "orderAmount", header: "Giá trị đơn", size: 120, cell: ({ row }) => <span className="font-semibold">{formatVnd(row.original.orderAmount)}</span> },
  { accessorKey: "cashbackAmount", header: "Hoàn tiền", size: 115, cell: ({ row }) => <span className="font-black text-[#168146]">{formatVnd(row.original.cashbackAmount)}</span> },
  { accessorKey: "status", header: "Trạng thái", size: 105, enableSorting: false, cell: ({ row }) => <Badge variant={orderVariant[row.original.status]}>{orderStatusLabel[row.original.status]}</Badge> },
  { id: "actions", header: "Hành động", size: 180, enableSorting: false, cell: ({ row }) => <OrderStatusControl orderId={row.original.id} status={row.original.status} /> },
];

export function PendingOrdersOverviewTable({ rows }: { rows: PendingOrderRow[] }) {
  return <AdminDataTable
    data={rows}
    columns={orderColumns}
    totalRows={rows.length}
    page={1}
    pageSize={8}
    mode="client"
    variant="preview"
    ariaLabel="Đơn hoàn tiền chờ xử lý"
    emptyMessage="Không có đơn hàng cần xử lý."
    minWidth="920px"
    getRowHref={(row) => `/admin/don-hang/${row.id}`}
  />;
}
