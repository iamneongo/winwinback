import { and, asc, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { PiggyBank, Ticket, Trophy } from "lucide-react";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { getFundBalance } from "@/lib/lucky-draw/service";
import { CreatePeriodForm } from "./LuckyDrawForms";
import { PeriodsTable } from "./PeriodsTable";

export const metadata = { title: "Rút thăm may mắn — Quản trị" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 20;

export default async function AdminLuckyDrawPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 150);
  const status = one("status");
  const conditions = [];
  if (q) conditions.push(ilike(luckyDrawPeriods.name, `%${q}%`));
  if (status === "open" || status === "drawn") conditions.push(eq(luckyDrawPeriods.status, status));
  const where = conditions.length ? and(...conditions) : undefined;
  const [fund, undrawn, [stats], [count]] = await Promise.all([
    getFundBalance(),
    db.select({ createdAt: luckyDrawTickets.createdAt }).from(luckyDrawTickets).where(isNull(luckyDrawTickets.periodId)),
    db.select({ total: sql<number>`count(*)::int`, drawn: sql<number>`count(*) filter (where ${luckyDrawPeriods.status} = 'drawn')::int` }).from(luckyDrawPeriods),
    db.select({ total: sql<number>`count(*)::int` }).from(luckyDrawPeriods).where(where),
  ]);
  const requestedPage = Number(one("trang"));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, Math.max(1, Math.ceil((count?.total ?? 0) / PAGE_SIZE)));
  const sortMap = { name: luckyDrawPeriods.name, startAt: luckyDrawPeriods.startAt, status: luckyDrawPeriods.status, potTotal: luckyDrawPeriods.potTotal, createdAt: luckyDrawPeriods.createdAt };
  const sortColumn = Object.hasOwn(sortMap, one("sort")) ? sortMap[one("sort") as "name" | "startAt" | "status" | "potTotal" | "createdAt"] : luckyDrawPeriods.createdAt;
  const periods = await db.select().from(luckyDrawPeriods).where(where).orderBy(one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn), desc(luckyDrawPeriods.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);
  const eligibleIn = (start: Date, end: Date) => undrawn.filter((ticket) => ticket.createdAt >= start && ticket.createdAt <= end).length;

  return <main className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
    <header className="mb-6"><h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e]">Rút thăm may mắn</h1><p className="mt-1 text-sm text-[#58749a]">Mỗi đơn hoàn tất góp 10% hoa hồng vào quỹ và được 1 phiếu (4 số cuối mã đơn). Admin mở kỳ rồi quay: trùng số → lãnh hết quỹ; không trùng → phiếu gần nhất nhận 20%, phần còn lại cộng dồn.</p></header>
    <div className="grid gap-3 sm:grid-cols-3">
      <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-5"><div className="flex items-start gap-4"><span className="flex size-12 items-center justify-center rounded-full bg-[#f6e9ff] text-[#aa34de]"><PiggyBank className="size-6" /></span><div><p className="text-sm font-medium text-[#34527d]">Quỹ hiện tại</p><p className="mt-1 text-[26px] font-black leading-none text-[#12335f]">{formatVnd(fund)}</p><p className="mt-3 text-xs text-[#7790b1]">Cộng dồn qua các kỳ chưa trúng</p></div></div></article>
      <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-5"><div className="flex items-start gap-4"><span className="flex size-12 items-center justify-center rounded-full bg-[#e7f1ff] text-[#287be5]"><Ticket className="size-6" /></span><div><p className="text-sm font-medium text-[#34527d]">Phiếu chưa quay</p><p className="mt-1 text-[26px] font-black leading-none text-[#12335f]">{undrawn.length}</p><p className="mt-3 text-xs text-[#7790b1]">Đang chờ được đưa vào một kỳ quay</p></div></div></article>
      <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-5"><div className="flex items-start gap-4"><span className="flex size-12 items-center justify-center rounded-full bg-[#e8f9df] text-[#3ba818]"><Trophy className="size-6" /></span><div><p className="text-sm font-medium text-[#34527d]">Số kỳ đã quay</p><p className="mt-1 text-[26px] font-black leading-none text-[#12335f]">{stats?.drawn ?? 0}</p><p className="mt-3 text-xs text-[#7790b1]">Tổng số kỳ: {stats?.total ?? 0}</p></div></div></article>
    </div>
    <section className="my-5 rounded-xl border border-[#dfe9f5] bg-white p-5"><h2 className="mb-4 text-sm font-bold text-[#173861]">Mở kỳ quay mới</h2><CreatePeriodForm /></section>
    <PeriodsTable rows={periods.map((period) => ({ id: period.id, name: period.name, startAt: period.startAt.toISOString(), endAt: period.endAt.toISOString(), status: period.status, eligibleTickets: eligibleIn(period.startAt, period.endAt), potTotal: period.potTotal, winningNumber: period.winningNumber, exactMatch: period.exactMatch, paidOut: period.paidOut, createdAt: period.createdAt.toISOString() }))} total={count?.total ?? 0} page={page} />
  </main>;
}
