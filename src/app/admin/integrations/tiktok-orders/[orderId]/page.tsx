import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { fetchConnectedCreatorOrder } from "@/lib/affiliate/tiktok/orders";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata = { title: "Chi tiết đơn TikTok Affiliate — Win-Win Back" };
export const dynamic = "force-dynamic";

function money(value?: { amount?: string; currency?: string }): string {
  return value?.amount ? `${value.amount}${value.currency ? ` ${value.currency}` : ""}` : "—";
}

export default async function TikTokLiveOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  await requireAdmin();
  const { orderId } = await params;
  if (!orderId || orderId.length > 80) notFound();
  const order = await fetchConnectedCreatorOrder(orderId);
  if (!order) notFound();
  const [localOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.externalOrderId, orderId)).limit(1);
  return <RecordDetail backHref="/admin/integrations/tiktok-orders" backLabel="Đơn TikTok Affiliate" title={`Đơn ${order.id}`} description="Dữ liệu trực tiếp từ tài khoản TikTok Shop Creator đã kết nối." actions={localOrder ? <Link href={`/admin/don-hang/${localOrder.id}`} className="rounded-lg bg-[#b7e961] px-4 py-2.5 text-sm font-bold text-[#173b5e] hover:bg-[#a9e75e]">Xem đơn trong hệ thống</Link> : undefined}>
    <DetailSection title="Thông tin đơn TikTok">
      <DetailField label="Mã đơn">{order.id}</DetailField>
      <DetailField label="Trạng thái từ TikTok">{order.status ?? "Chưa có"}</DetailField>
      <DetailField label="Thời gian tạo">{order.create_time ? new Date(order.create_time * 1000).toLocaleString("vi-VN") : "—"}</DetailField>
      <DetailField label="Thời gian giao">{order.delivery_time ? new Date(order.delivery_time * 1000).toLocaleString("vi-VN") : "—"}</DetailField>
      <DetailField label="Đã ghép với đơn nội bộ">{localOrder ? "Có" : "Chưa"}</DetailField>
    </DetailSection>
    <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white"><h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">Sản phẩm trong đơn</h2>{order.skus?.length ? <ul className="divide-y divide-[#e8eef6]">{order.skus.map((sku, index) => <li key={`${sku.id ?? sku.product_id ?? "sku"}-${index}`} className="grid gap-2 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5"><div><b className="text-[#173861]">{sku.product_name ?? "Sản phẩm"}</b><p className="mt-1 break-all text-xs text-[#58749a]">Mã sản phẩm: {sku.product_id ?? "—"}</p></div><div className="grid gap-1 text-[#31527d]"><p>Giá: <b>{money(sku.price)}</b></p><p>Hoa hồng dự kiến: <b>{money(sku.estimated_commission)}</b></p><p>Hoa hồng thực tế: <b>{money(sku.actual_commission)}</b></p></div></li>)}</ul> : <p className="px-5 py-6 text-sm text-[#58749a]">TikTok chưa cung cấp dòng sản phẩm.</p>}</section>
  </RecordDetail>;
}
