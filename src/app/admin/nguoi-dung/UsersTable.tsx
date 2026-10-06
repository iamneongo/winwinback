"use client";

import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { UserRowActions } from "@/components/admin/UserRowActions";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";

export type UserTableRow = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "admin" | "user";
  emailVerified: boolean;
  balance: number;
  notifyOrders: boolean;
  notifyCashback: boolean;
  createdAt: string;
};

const columns: ColumnDef<UserTableRow>[] = [
  { accessorKey: "name", header: "Người dùng", size: 180, cell: ({ row }) => <span className="flex items-center gap-2"><span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e5effe] font-bold text-[#3676cb]">{row.original.image ? <Image src={row.original.image} alt="" width={32} height={32} className="size-full object-cover" /> : row.original.name.charAt(0)}</span><b className="truncate text-[#2f4f78]">{row.original.name}</b></span> },
  { accessorKey: "email", header: "Email", size: 210, cell: ({ row }) => <span className="break-all">{row.original.email}</span> },
  { accessorKey: "role", header: "Vai trò", size: 110, cell: ({ row }) => <Badge variant={row.original.role === "admin" ? "info" : "default"}>{row.original.role === "admin" ? "Quản trị" : "Người dùng"}</Badge> },
  { accessorKey: "emailVerified", header: "Xác thực", size: 125, enableSorting: false, cell: ({ row }) => <Badge variant={row.original.emailVerified ? "success" : "warning"}>{row.original.emailVerified ? "Đã xác thực" : "Chưa xác thực"}</Badge> },
  { accessorKey: "balance", header: "Số dư ví", size: 130, cell: ({ row }) => <b className="whitespace-nowrap text-[#168146]">{formatVnd(row.original.balance)}</b> },
  { id: "notifications", header: "Thông báo", size: 110, enableSorting: false, cell: ({ row }) => row.original.notifyOrders || row.original.notifyCashback ? "Đang bật" : "Đã tắt" },
  { accessorKey: "createdAt", header: "Ngày tham gia", size: 125, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN") },
  { id: "actions", header: "Hành động", size: 170, enableSorting: false, cell: ({ row }) => <UserRowActions userId={row.original.id} role={row.original.role} emailVerified={row.original.emailVerified} notificationsOn={row.original.notifyOrders || row.original.notifyCashback} /> },
];

export function UsersTable({ rows, total, page }: { rows: UserTableRow[]; total: number; page: number }) {
  return <AdminDataTable data={rows} columns={columns} totalRows={total} page={page} pageSize={25} ariaLabel="Danh sách người dùng" searchPlaceholder="Tìm tên hoặc email..." filters={[{ key: "role", label: "Tất cả vai trò", options: [{ value: "admin", label: "Quản trị" }, { value: "user", label: "Người dùng" }] }]} minWidth="1180px" emptyMessage="Không tìm thấy người dùng phù hợp." />;
}
