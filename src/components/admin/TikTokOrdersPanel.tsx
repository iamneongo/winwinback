"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  fetchTikTokOrdersAction,
  type OrdersState,
} from "@/app/admin/integrations/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { AdminDataTable } from "@/components/admin/AdminDataTable";

type SyncedOrder = {
  orderId: string;
  productId: string;
  productName: string;
  price: string;
  status: string;
  createdAt: string | null;
};

const columns: ColumnDef<SyncedOrder>[] = [
  { accessorKey: "orderId", header: "Order ID", size: 170, cell: ({ row }) => <Link href={`/admin/integrations/tiktok-orders/${encodeURIComponent(row.original.orderId)}`} className="break-all font-mono text-[#1261ed] hover:underline">{row.original.orderId}</Link> },
  { accessorKey: "productId", header: "Product ID", size: 160, cell: ({ row }) => <span className="break-all font-mono">{row.original.productId}</span> },
  { accessorKey: "productName", header: "Sản phẩm", size: 230, cell: ({ row }) => <span className="line-clamp-2">{row.original.productName}</span> },
  { accessorKey: "price", header: "Giá", size: 120 },
  { accessorKey: "status", header: "Trạng thái", size: 140 },
  { accessorKey: "createdAt", header: "Thời gian", size: 150, cell: ({ row }) => row.original.createdAt ?? "—" },
];

/** Live TikTok Shop affiliate order-data sync (moved to its own admin page). */
export function TikTokOrdersPanel() {
  const [state, action] = useActionState<OrdersState, FormData>(
    () => fetchTikTokOrdersAction(),
    undefined,
  );
  return (
    <div className="space-y-3 rounded-2xl border border-[#e1eaf6] bg-[#f9fbff] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#173861]">
            Dữ liệu đơn hàng từ TikTok Shop
          </p>
          <p className="text-xs text-[#6681a7]">
            Đồng bộ trực tiếp qua Affiliate Creator API (order id + product id
            thật).
          </p>
        </div>
        <form action={action}>
          <SubmitButton variant="ghost">Đồng bộ đơn hàng</SubmitButton>
        </form>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {state?.rows && (
        <>
          <p className="text-xs text-[#6681a7]">
            Đã đồng bộ {state.rows.length} dòng lúc {state.fetchedAt}.
          </p>
          <AdminDataTable key={state.fetchedAt} mode="client" data={state.rows} columns={columns} totalRows={state.rows.length} page={1} pageSize={10} ariaLabel="Đơn hàng đồng bộ TikTok" searchPlaceholder="Tìm đơn hàng TikTok..." minWidth="1000px" emptyMessage="Chưa có đơn hàng affiliate nào cho creator này." getRowHref={(row) => `/admin/integrations/tiktok-orders/${encodeURIComponent(row.orderId)}`} />
        </>
      )}
    </div>
  );
}
