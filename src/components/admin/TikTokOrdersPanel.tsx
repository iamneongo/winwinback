"use client";

import { useActionState } from "react";
import {
  fetchTikTokOrdersAction,
  type OrdersState,
} from "@/app/admin/integrations/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          {state.rows.length === 0 ? (
            <p className="text-sm text-[#6681a7]">
              Chưa có đơn hàng affiliate nào cho creator này.
            </p>
          ) : (
            <Table className="text-xs text-[#49688f]">
              <TableHeader className="text-[#536f98]">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-2 pr-3">Order ID</TableHead>
                  <TableHead className="py-2 pr-3">Product ID</TableHead>
                  <TableHead className="py-2 pr-3">Sản phẩm</TableHead>
                  <TableHead className="py-2 pr-3">Giá</TableHead>
                  <TableHead className="py-2 pr-3">Trạng thái</TableHead>
                  <TableHead className="py-2">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.rows.map((row, i) => (
                  <TableRow key={`${row.orderId}-${i}`}>
                    <TableCell className="py-2 pr-3 font-mono">
                      {row.orderId}
                    </TableCell>
                    <TableCell className="py-2 pr-3 font-mono">
                      {row.productId}
                    </TableCell>
                    <TableCell className="py-2 pr-3">{row.productName}</TableCell>
                    <TableCell className="py-2 pr-3">{row.price}</TableCell>
                    <TableCell className="py-2 pr-3">{row.status}</TableCell>
                    <TableCell className="py-2">{row.createdAt ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
