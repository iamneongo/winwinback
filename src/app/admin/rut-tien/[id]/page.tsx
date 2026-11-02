import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, withdrawals, withdrawalEvents } from "@/db/schema";
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
  const events = await db.select({ event: withdrawalEvents.event, detail: withdrawalEvents.detail, createdAt: withdrawalEvents.createdAt, actorName: users.name })
    .from(withdrawalEvents).leftJoin(users, eq(withdrawalEvents.actorId, users.id)).where(eq(withdrawalEvents.withdrawalId, id)).orderBy(desc(withdrawalEvents.createdAt)).limit(50);
  return <RecordDetail layout="admin" backHref="/admin/rut-tien" backLabel="Yêu cầu rút tiền" title={`Yêu cầu RT${item.id.slice(0, 8).toUpperCase()}`} description="Đối chiếu thông tin tài khoản và trạng thái chi trả." actions={<WithdrawalControls withdrawalId={item.id} status={item.status} />}>
    <DetailSection title="Yêu cầu">
      <DetailField label="Số tiền">{formatVnd(item.amount)}</DetailField>
      <DetailField label="Trạng thái">{withdrawalStatusLabel[item.status]}</DetailField>
      <DetailField label="Ngày yêu cầu">{item.requestedAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</DetailField>
      <DetailField label="Ngày xử lý">{item.processedAt && (item.status === "approved" || item.status === "rejected" || item.status === "paid") ? item.processedAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "Chưa hoàn tất"}</DetailField>
      <DetailField label="Ghi chú xử lý">{item.note ?? "Chưa có"}</DetailField>
      {item.correctionReason && <DetailField label="Yêu cầu bổ sung">{item.correctionReason}</DetailField>}
    </DetailSection>
    <DetailSection title="Người nhận và ngân hàng">
      <DetailField label="Người dùng"><Link href={`/admin/nguoi-dung/${item.userId}`} className="text-[#1261ed] hover:underline">{data.name}</Link></DetailField>
      <DetailField label="Email"><a href={`mailto:${data.email}`} className="text-[#1261ed] hover:underline">{data.email} · Gửi email</a></DetailField>
      <DetailField label="Số điện thoại">{item.contactPhone ? <a href={`tel:${item.contactPhone}`} className="text-[#1261ed] hover:underline">{item.contactPhone} · Gọi</a> : "Chưa có trong yêu cầu cũ"}</DetailField>
      <DetailField label="Ngân hàng">{item.bankName}</DetailField>
      <DetailField label="Chủ tài khoản">{item.accountHolder}</DetailField>
      <DetailField label="Số tài khoản">{item.bankAccount}</DetailField>
    </DetailSection>
    <DetailSection title="Lịch sử xử lý">
      {events.length ? events.map((event, index) => <div key={`${event.createdAt.toISOString()}-${index}`} className="border-b border-[#e5edf7] py-2 text-sm text-[#35557e]">
        <b>{({ requested: "Khách gửi yêu cầu", needs_info: "Admin yêu cầu bổ sung", corrected: "Khách đã cập nhật", approved: "Đã duyệt", rejected: "Đã từ chối", paid: "Đã chi" } as Record<string, string>)[event.event] ?? event.event}</b>
        <span className="ml-2 text-[#718bad]">{event.actorName ?? "Hệ thống"} · {event.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
        {event.detail && <p className="mt-1 whitespace-pre-wrap">{event.detail}</p>}
      </div>) : <p className="text-sm text-[#718bad]">Yêu cầu cũ chưa có lịch sử chi tiết.</p>}
    </DetailSection>
  </RecordDetail>;
}
