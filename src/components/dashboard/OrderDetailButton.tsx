import Link from "next/link";

export type OrderDetail = {
  platformLabel: string;
  externalOrderId: string;
  productName: string;
  orderAmount: string;
  commissionAmount: string;
  cashbackAmount: string;
  statusLabel: string;
  statusClass: string;
  orderedAt: string;
};

export function OrderDetailButton({ order }: { order: OrderDetail }) {
  return <Link href={`/dashboard/don-hang/${encodeURIComponent(order.externalOrderId)}`} className="rounded-lg border border-[#dce6f3] px-3 py-1.5 text-[11px] font-semibold text-[#1261ed] transition hover:bg-[#f6f9fd] hover:underline">Xem chi tiết</Link>;
}
