import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, withdrawals } from "@/db/schema";
import { WithdrawalControls } from "@/components/admin/WithdrawalControls";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { withdrawalStatusLabel } from "@/lib/labels";

export const metadata = { title: "Chi tiết yêu cầu rút tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminWithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [data] = await db.select({ withdrawal: withdrawals, name: users.name, email: users.email })
    .from(withdrawals).innerJoin(users, eq(withdrawals.userId, users.id)).where(eq(withdrawals.id, id)).limit(1);
  if (!data) notFound();
  const { withdrawal: item } = data;
  return <RecordDetail backHref="/admin/rut-tien" backLabel="Yêu cầu rút tiền" title={`Yêu cầu RT${item.id.slice(0, 8).toUpperCase()}`} description="Đối chiếu thông tin tài khoản và trạng thái chi trả." actions={<WithdrawalControls withdrawalId={item.id} status={item.status} />}>
    <DetailSection title="Yêu cầu">
      <DetailField label="Số tiền">{formatVnd(item.amount)}</DetailField>
      <DetailField label="Trạng thái">{withdrawalStatusLabel[item.status]}</DetailField>
      <DetailField label="Ngày yêu cầu">{item.requestedAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Ngày xử lý">{item.processedAt?.toLocaleString("vi-VN") ?? "Chưa xử lý"}</DetailField>
      <DetailField label="Ghi chú xử lý">{item.note ?? "Chưa có"}</DetailField>
    </DetailSection>
    <DetailSection title="Người nhận và ngân hàng">
      <DetailField label="Người dùng"><Link href={`/admin/nguoi-dung/${item.userId}`} className="text-[#1261ed] hover:underline">{data.name}</Link></DetailField>
      <DetailField label="Email">{data.email}</DetailField>
      <DetailField label="Ngân hàng">{item.bankName}</DetailField>
      <DetailField label="Chủ tài khoản">{item.accountHolder}</DetailField>
      <DetailField label="Số tài khoản">{item.bankAccount}</DetailField>
    </DetailSection>
  </RecordDetail>;
}
