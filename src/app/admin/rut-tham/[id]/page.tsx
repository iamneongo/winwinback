import Link from "next/link";
import { and, desc, eq, isNull, lte, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets, orders, users } from "@/db/schema";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { getFundBalance } from "@/lib/lucky-draw/service";
import { isUuid } from "@/lib/is-uuid";
import { DrawButton, UpdatePeriodForm } from "../LuckyDrawForms";

export const metadata = { title: "Chi tiết kỳ rút thăm — Win-Win Back" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;
const vnDateTimeInput = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export default async function AdminPeriodDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ trang?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [period] = await db.select().from(luckyDrawPeriods).where(eq(luckyDrawPeriods.id, id)).limit(1);
  if (!period) notFound();
  const fund = await getFundBalance();
  const ticketFilter = period.status === "open"
    ? and(isNull(luckyDrawTickets.periodId), lte(luckyDrawTickets.createdAt, period.endAt))
    : eq(luckyDrawTickets.periodId, id);
  const [count] = await db.select({ total: sql<number>`count(*)::int` }).from(luckyDrawTickets).where(ticketFilter);
  const total = count?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requested = Number((await searchParams).trang);
  const page = Math.min(Number.isSafeInteger(requested) && requested > 0 ? requested : 1, pages);
  const tickets = await db.select({
    id: luckyDrawTickets.id,
    number: luckyDrawTickets.number,
    isWinner: luckyDrawTickets.isWinner,
    prizeAmount: luckyDrawTickets.prizeAmount,
    userId: users.id,
    userName: users.name,
    orderId: orders.id,
    externalOrderId: orders.externalOrderId,
  }).from(luckyDrawTickets)
    .innerJoin(users, eq(luckyDrawTickets.userId, users.id))
    .innerJoin(orders, eq(luckyDrawTickets.orderId, orders.id))
    .where(ticketFilter)
    .orderBy(desc(luckyDrawTickets.isWinner), luckyDrawTickets.number)
    .limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);
  return <RecordDetail layout="admin" backHref="/admin/rut-tham" backLabel="Danh sách kỳ rút thăm" title={period.name} description="Kết quả kỳ quay và danh sách phiếu đã tham gia." actions={period.status === "open" && period.endAt <= new Date() ? <DrawButton periodId={period.id} /> : undefined}>
    <DetailSection title="Kỳ quay">
      <DetailField label="Trạng thái">{period.status === "drawn" ? "Đã quay" : "Đang mở"}</DetailField>
      <DetailField label="Thời gian áp dụng">{period.startAt.toLocaleString("vi-VN")} – {period.endAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Số trúng">{period.winningNumber ?? "Chưa quay"}</DetailField>
      <DetailField label="Kết quả">{period.exactMatch === null ? "Chưa có kết quả" : period.exactMatch ? "Trùng chính xác" : "Phiếu gần nhất"}</DetailField>
      <DetailField label="Quỹ tại thời điểm quay">{formatVnd(period.potTotal)}</DetailField>
      <DetailField label="Admin tài trợ">{formatVnd(period.adminContribution)}</DetailField>
      <DetailField label="Cộng quỹ tích lũy">{period.includeCommissionFund ? "Có" : "Không"}</DetailField>
      {period.status === "open" && <DetailField label="Giải thưởng tạm tính">{formatVnd(period.adminContribution + (period.includeCommissionFund ? fund : 0))}</DetailField>}
      {period.fundingNote && <DetailField label="Ghi chú ngân sách">{period.fundingNote}</DetailField>}
      <DetailField label="Đã trao thưởng">{formatVnd(period.paidOut)}</DetailField>
      <DetailField label="Thời điểm quay">{period.drawnAt?.toLocaleString("vi-VN") ?? "Chưa quay"}</DetailField>
      <DetailField label={period.status === "open" ? "Phiếu đủ điều kiện" : "Tổng phiếu trong kỳ"}>{total}</DetailField>
    </DetailSection>
    {period.status === "open" && <section className="rounded-xl border border-[#dfe9f5] bg-white p-4 sm:p-5">
      <h2 className="mb-1 text-sm font-bold text-[#173861]">Chỉnh sửa kỳ đang mở</h2>
      <p className="mb-4 text-xs leading-5 text-[#58749a]">Có thể đổi lịch và tăng ngân sách trước khi quay. Sau khi kỳ bắt đầu, không thể giảm giải thưởng đã công bố; chỉ quay sau giờ đóng kỳ.</p>
      <UpdatePeriodForm periodId={period.id} period={{ name: period.name, startAt: vnDateTimeInput(period.startAt), endAt: vnDateTimeInput(period.endAt), adminContribution: period.adminContribution, includeCommissionFund: period.includeCommissionFund, fundingNote: period.fundingNote }} />
    </section>}
    <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
      <h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">{period.status === "open" ? "Phiếu đủ điều kiện" : "Phiếu tham gia"}</h2>
      {tickets.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#f8fbff] text-xs text-[#31527d]"><tr><th className="px-4 py-3">Số phiếu</th><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Đơn hàng</th><th className="px-4 py-3">Kết quả</th></tr></thead><tbody className="divide-y divide-[#e8eef6]">{tickets.map((ticket) => <tr key={ticket.id}><td className="px-4 py-3 font-bold tracking-widest text-[#173861]">{ticket.number}</td><td className="px-4 py-3"><Link href={`/admin/nguoi-dung/${ticket.userId}`} className="text-[#1261ed] hover:underline">{ticket.userName}</Link></td><td className="px-4 py-3"><Link href={`/admin/don-hang/${ticket.orderId}`} className="text-[#1261ed] hover:underline">{ticket.externalOrderId}</Link></td><td className="px-4 py-3 font-semibold text-[#31527d]">{ticket.isWinner ? `Trúng ${formatVnd(ticket.prizeAmount)}` : "Không trúng"}</td></tr>)}</tbody></table></div> : <p className="px-5 py-6 text-sm text-[#58749a]">Chưa có phiếu trong kỳ này.</p>}
      {pages > 1 && <nav aria-label="Trang phiếu" className="flex items-center justify-end gap-3 border-t border-[#e8eef6] px-4 py-3 text-sm"><Link aria-disabled={page === 1} href={page > 1 ? `?trang=${page - 1}` : `?trang=1`} className="text-[#1261ed] hover:underline">Trước</Link><span className="text-[#58749a]">{page}/{pages}</span><Link aria-disabled={page === pages} href={page < pages ? `?trang=${page + 1}` : `?trang=${pages}`} className="text-[#1261ed] hover:underline">Sau</Link></nav>}
    </section>
  </RecordDetail>;
}
