import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { orderStatusLabel, platformLabel } from "@/lib/labels";

export const metadata = { title: "Chi tiết đơn hàng — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [order] = await db.select().from(orders)
    .where(and(isUuid(id) ? eq(orders.id, id) : eq(orders.externalOrderId, id), eq(orders.userId, user.id))).limit(1);
  if (!order) notFound();
  return <RecordDetail backHref="/dashboard/don-hang" backLabel="Đơn hàng của tôi" title={`Đơn hàng ${order.externalOrderId}`} description="Theo dõi quá trình ghi nhận đơn và hoàn tiền vào ví.">
    <DetailSection title="Thông tin đơn hàng">
      <DetailField label="Sản phẩm">{order.productName}</DetailField>
      <DetailField label="Sàn mua sắm">{platformLabel[order.platform]}</DetailField>
      <DetailField label="Mã đơn">{order.externalOrderId}</DetailField>
      <DetailField label="Trạng thái">{orderStatusLabel[order.status]}</DetailField>
      <DetailField label="Ngày mua">{order.orderedAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Giá trị đơn">{formatVnd(order.orderAmount)}</DetailField>
    </DetailSection>
    <DetailSection title="Hoàn tiền">
      <DetailField label="Tiền hoàn dự kiến">{formatVnd(order.cashbackAmount)}</DetailField>
      <DetailField label="Đã cộng vào ví">{order.cashbackCreditedAt?.toLocaleString("vi-VN") ?? "Chưa cộng"}</DetailField>
    </DetailSection>
  </RecordDetail>;
}
