import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { orderStatusLabel, platformLabel } from "@/lib/labels";

export const metadata = { title: "Chi tiết đơn hàng — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [data] = await db.select({ order: orders, name: users.name, email: users.email })
    .from(orders).innerJoin(users, eq(orders.userId, users.id)).where(eq(orders.id, id)).limit(1);
  if (!data) notFound();
  const { order } = data;
  return <RecordDetail backHref="/admin/don-hang" backLabel="Danh sách đơn hàng" title={`Đơn hàng ${order.externalOrderId}`} description="Thông tin đơn, đối soát hoa hồng và trạng thái hoàn tiền." actions={<OrderStatusControl orderId={order.id} status={order.status} />}>
    <DetailSection title="Đơn hàng">
      <DetailField label="Sản phẩm">{order.productName}</DetailField>
      <DetailField label="Sàn">{platformLabel[order.platform]}</DetailField>
      <DetailField label="Trạng thái">{orderStatusLabel[order.status]}</DetailField>
      <DetailField label="Mã đơn trên sàn">{order.externalOrderId}</DetailField>
      <DetailField label="Thời gian mua">{order.orderedAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Tạo trên hệ thống">{order.createdAt.toLocaleString("vi-VN")}</DetailField>
    </DetailSection>
    <DetailSection title="Hoa hồng và hoàn tiền">
      <DetailField label="Giá trị đơn">{formatVnd(order.orderAmount)}</DetailField>
      <DetailField label="Hoa hồng được ghi nhận">{formatVnd(order.commissionAmount)}</DetailField>
      <DetailField label="Tiền hoàn cho khách">{formatVnd(order.cashbackAmount)}</DetailField>
      <DetailField label="Đã cộng vào ví">{order.cashbackCreditedAt?.toLocaleString("vi-VN") ?? "Chưa cộng"}</DetailField>
      <DetailField label="Trạng thái xác minh TikTok">{order.platform === "tiktok" ? order.tiktokVerifiedStatus ?? "Chưa kiểm tra" : "Không áp dụng"}</DetailField>
      <DetailField label="Kiểm tra gần nhất">{order.tiktokVerifiedAt?.toLocaleString("vi-VN") ?? "—"}</DetailField>
    </DetailSection>
    <DetailSection title="Người nhận hoàn tiền và ghi chú">
      <DetailField label="Khách hàng"><Link href={`/admin/nguoi-dung/${order.userId}`} className="text-[#1261ed] hover:underline">{data.name}</Link></DetailField>
      <DetailField label="Email">{data.email}</DetailField>
      <DetailField label="Ghi chú nội bộ">{order.adminNote ? <span className="whitespace-pre-wrap">{order.adminNote}</span> : "Chưa có"}</DetailField>
      <DetailField label="Liên kết theo dõi">{order.linkId ?? "Không có"}</DetailField>
    </DetailSection>
  </RecordDetail>;
}
