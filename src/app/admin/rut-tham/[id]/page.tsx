import Link from "next/link";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets, orders, users } from "@/db/schema";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { DrawButton } from "../LuckyDrawForms";

export const metadata = { title: "Chi tiết kỳ rút thăm — Win-Win Back" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

export default async function AdminPeriodDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ trang?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [period] = await db.select().from(luckyDrawPeriods).where(eq(luckyDrawPeriods.id, id)).limit(1);
  if (!period) notFound();
  const ticketFilter = period.status === "open"
    ? and(isNull(luckyDrawTickets.periodId), gte(luckyDrawTickets.createdAt, period.startAt), lte(luckyDrawTickets.createdAt, period.endAt))
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
  return <RecordDetail backHref="/admin/rut-tham" backLabel="Danh sách kỳ rút thăm" title={period.name} description="Kết quả kỳ quay và danh sách phiếu đã tham gia." actions={period.status === "open" ? <DrawButton periodId={period.id} /> : undefined}>
    <DetailSection title="Kỳ quay">
      <DetailField label="Trạng thái">{period.status === "drawn" ? "Đã quay" : "Đang mở"}</DetailField>
      <DetailField label="Thời gian áp dụng">{period.startAt.toLocaleString("vi-VN")} – {period.endAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Số trúng">{period.winningNumber ?? "Chưa quay"}</DetailField>
      <DetailField label="Kết quả">{period.exactMatch === null ? "Chưa có kết quả" : period.exactMatch ? "Trùng chính xác" : "Phiếu gần nhất"}</DetailField>
      <DetailField label="Quỹ tại thời điểm quay">{formatVnd(period.potTotal)}</DetailField>
      <DetailField label="Đã trao thưởng">{formatVnd(period.paidOut)}</DetailField>
      <DetailField label="Thời điểm quay">{period.drawnAt?.toLocaleString("vi-VN") ?? "Chưa quay"}</DetailField>
      <DetailField label={period.status === "open" ? "Phiếu đủ điều kiện" : "Tổng phiếu trong kỳ"}>{total}</DetailField>
    </DetailSection>
    <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
      <h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">{period.status === "open" ? "Phiếu đủ điều kiện" : "Phiếu tham gia"}</h2>
      {tickets.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#f8fbff] text-xs text-[#31527d]"><tr><th className="px-4 py-3">Số phiếu</th><th className="px-4 py-3">Người dùng</th><th className="px-4 py-3">Đơn hàng</th><th className="px-4 py-3">Kết quả</th></tr></thead><tbody className="divide-y divide-[#e8eef6]">{tickets.map((ticket) => <tr key={ticket.id}><td className="px-4 py-3 font-bold tracking-widest text-[#173861]">{ticket.number}</td><td className="px-4 py-3"><Link href={`/admin/nguoi-dung/${ticket.userId}`} className="text-[#1261ed] hover:underline">{ticket.userName}</Link></td><td className="px-4 py-3"><Link href={`/admin/don-hang/${ticket.orderId}`} className="text-[#1261ed] hover:underline">{ticket.externalOrderId}</Link></td><td className="px-4 py-3 font-semibold text-[#31527d]">{ticket.isWinner ? `Trúng ${formatVnd(ticket.prizeAmount)}` : "Không trúng"}</td></tr>)}</tbody></table></div> : <p className="px-5 py-6 text-sm text-[#58749a]">Chưa có phiếu trong kỳ này.</p>}
      {pages > 1 && <nav aria-label="Trang phiếu" className="flex items-center justify-end gap-3 border-t border-[#e8eef6] px-4 py-3 text-sm"><Link aria-disabled={page === 1} href={page > 1 ? `?trang=${page - 1}` : `?trang=1`} className="text-[#1261ed] hover:underline">Trước</Link><span className="text-[#58749a]">{page}/{pages}</span><Link aria-disabled={page === pages} href={page < pages ? `?trang=${page + 1}` : `?trang=${pages}`} className="text-[#1261ed] hover:underline">Sau</Link></nav>}
    </section>
  </RecordDetail>;
}
