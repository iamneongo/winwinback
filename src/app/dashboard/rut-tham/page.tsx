import { and, asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Coins, Gift, PiggyBank, Ticket, Trophy } from "lucide-react";
import { LuckyDrawCountdown } from "@/components/dashboard/LuckyDrawCountdown";
import { LuckyDrawWheel } from "@/components/dashboard/LuckyDrawWheel";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd, prizeFundRate } from "@/lib/config";
import { getFundBalance } from "@/lib/lucky-draw/service";
import { periodPrizePool } from "@/lib/lucky-draw/funding";

export const metadata = { title: "Rút thăm may mắn — Win-Win Back" };
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric",
});

export default async function LuckyDrawPage() {
  const user = await requireUser();
  const [fund, periods, recentDraws, currentTickets, pastTickets, [summary]] = await Promise.all([
    getFundBalance(),
    db.select().from(luckyDrawPeriods).where(eq(luckyDrawPeriods.status, "open"))
      .orderBy(asc(luckyDrawPeriods.startAt)).limit(50),
    db.select({
      id: luckyDrawPeriods.id,
      name: luckyDrawPeriods.name,
      winningNumber: luckyDrawPeriods.winningNumber,
      paidOut: luckyDrawPeriods.paidOut,
      potTotal: luckyDrawPeriods.potTotal,
      drawnAt: luckyDrawPeriods.drawnAt,
    }).from(luckyDrawPeriods).where(eq(luckyDrawPeriods.status, "drawn"))
      .orderBy(desc(luckyDrawPeriods.drawnAt)).limit(5),
    db.select({ id: luckyDrawTickets.id, number: luckyDrawTickets.number })
      .from(luckyDrawTickets)
      .where(and(eq(luckyDrawTickets.userId, user.id), isNull(luckyDrawTickets.periodId)))
      .orderBy(desc(luckyDrawTickets.createdAt)).limit(8),
    db.select({
      id: luckyDrawTickets.id,
      number: luckyDrawTickets.number,
      isWinner: luckyDrawTickets.isWinner,
      prizeAmount: luckyDrawTickets.prizeAmount,
      periodName: luckyDrawPeriods.name,
    }).from(luckyDrawTickets)
      .leftJoin(luckyDrawPeriods, eq(luckyDrawTickets.periodId, luckyDrawPeriods.id))
      .where(and(eq(luckyDrawTickets.userId, user.id), isNotNull(luckyDrawTickets.periodId)))
      .orderBy(desc(luckyDrawTickets.createdAt)).limit(3),
    db.select({
      waiting: sql<number>`count(*) filter (where ${luckyDrawTickets.periodId} is null)::int`,
      won: sql<number>`coalesce(sum(${luckyDrawTickets.prizeAmount}) filter (where ${luckyDrawTickets.isWinner} = true), 0)::double precision`,
    }).from(luckyDrawTickets).where(eq(luckyDrawTickets.userId, user.id)),
  ]);

  const now = Date.now();
  const active = periods.find((period) => period.startAt.getTime() <= now && period.endAt.getTime() > now);
  const nextPeriod = active ?? periods.find((period) => period.startAt.getTime() > now) ?? periods.at(-1) ?? null;
  const waitingCount = summary?.waiting ?? 0;
  const totalWon = summary?.won ?? 0;
  const advertisedPot = nextPeriod
    ? periodPrizePool(nextPeriod.adminContribution, nextPeriod.includeCommissionFund, fund)
    : fund;
  const latestDraw = recentDraws[0];

  return (
    <main className="mx-auto w-full max-w-[1500px] px-3 pb-8 pt-4 sm:px-6 lg:px-7">
      <section className="relative isolate overflow-hidden rounded-2xl bg-[#061632] text-white" aria-labelledby="draw-heading">
        <Image src="/images/lucky-draw-stage-v1.webp" alt="" fill priority sizes="(max-width: 1024px) 100vw, 1500px" className="pointer-events-none object-cover object-center" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#061634]/90 via-[#061634]/58 to-transparent lg:via-[#061634]/10" aria-hidden="true" />
        <div className="relative grid gap-4 px-4 pb-8 pt-6 sm:px-8 sm:pt-8 lg:min-h-[440px] lg:grid-cols-[minmax(0,0.87fr)_minmax(0,1.13fr)] lg:items-center lg:gap-0 lg:px-10 lg:pb-9">
          <div className="relative z-10 max-w-[500px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10355f]/95 px-3 py-1 text-xs font-semibold text-[#e4f5ff]"><Ticket className="size-3.5 text-[#b5eb5a]" aria-hidden="true" /> Rút thăm may mắn</span>
            <h1 id="draw-heading" className="mt-3 text-balance text-[clamp(1.8rem,3.5vw,3rem)] font-black leading-[1.08] tracking-[-0.025em]">Chờ đón kết quả<br /><span className="text-[#c8f46b]">rút thăm may mắn!</span></h1>
            <p className="mt-3 max-w-[52ch] text-sm leading-6 text-[#e3efff]">Theo dõi kỳ quay tiếp theo và những cơ hội nhận thưởng từ đơn hàng hợp lệ của bạn.</p>
            <div className="mt-6"><LuckyDrawCountdown endAt={nextPeriod?.endAt.toISOString() ?? null} periodName={nextPeriod?.name ?? null} /></div>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[630px] pb-2 pt-4 lg:pb-0 lg:pt-3">
            <div className="relative z-10 mx-auto w-[min(80%,360px)] sm:w-[min(72%,385px)] lg:mr-[27%] lg:w-[min(70%,385px)]">
              <LuckyDrawWheel winningNumber={nextPeriod ? null : latestDraw?.winningNumber ?? null} periodName={nextPeriod?.name ?? latestDraw?.name ?? null} />
            </div>
            <Image src="/images/lucky-draw-mascot-v1.webp" alt="" width={850} height={567} sizes="(max-width: 640px) 160px, 330px" className="pointer-events-none absolute -bottom-6 -right-9 z-10 h-auto w-[46%] max-w-[330px] drop-shadow-[0_8px_9px_rgba(0,0,0,0.36)] sm:-right-7" />
          </div>
        </div>
      </section>

      <dl className="relative z-10 mt-3 grid gap-2.5 sm:grid-cols-3 sm:gap-3 lg:-mt-6">
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e3ebf4] bg-white px-4 py-4 sm:px-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e9f8e2] text-[#2b963e]"><PiggyBank className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0"><dt className="text-xs font-medium text-[#456783]">Giải thưởng kỳ này (tạm tính)</dt><dd className="mt-0.5 break-words text-xl font-black tabular-nums text-[#153a60]">{formatVnd(advertisedPot)}</dd><p className="text-[11px] text-[#5f7b97]">{nextPeriod?.includeCommissionFund ? "Admin tài trợ + quỹ 10% và cộng dồn" : nextPeriod ? "Ngân sách admin tài trợ" : "Quỹ 10% và cộng dồn"}</p></div>
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e3ebf4] bg-white px-4 py-4 sm:px-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e8f3ff] text-[#2c86e8]"><Ticket className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0"><dt className="text-xs font-medium text-[#456783]">Phiếu đang chờ quay</dt><dd className="mt-0.5 text-xl font-black tabular-nums text-[#153a60]">{waitingCount}</dd><p className="text-[11px] text-[#5f7b97]">Phiếu chưa tham gia kỳ nào</p></div>
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e3ebf4] bg-white px-4 py-4 sm:px-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff2dc] text-[#df8e08]"><Trophy className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0"><dt className="text-xs font-medium text-[#456783]">Tổng đã trúng</dt><dd className="mt-0.5 break-words text-xl font-black tabular-nums text-[#153a60]">{formatVnd(totalWon)}</dd><p className="text-[11px] text-[#5f7b97]">Đã cộng vào ví của bạn</p></div>
        </div>
      </dl>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="min-w-0 rounded-xl border border-[#e2ebf3] bg-white p-4 sm:p-5" aria-labelledby="prizes-heading">
          <div className="flex items-center justify-between gap-3"><h2 id="prizes-heading" className="flex items-center gap-2 text-sm font-extrabold text-[#153a60]"><Gift className="size-4 text-[#2ca142]" aria-hidden="true" /> Giải thưởng kỳ quay này</h2><span className="text-xs text-[#597695]">Theo quy tắc đang áp dụng</span></div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg bg-gradient-to-b from-[#fff7dd] to-[#fffdf5] p-3 text-center ring-1 ring-[#f6dfa6]"><Trophy className="mx-auto size-6 text-[#d59b08]" aria-hidden="true" /><p className="mt-2 text-xs font-bold text-[#794f00]">Trùng đúng 4 số</p><p className="mt-1 break-words text-base font-black text-[#153a60]">{formatVnd(advertisedPot)}</p><p className="mt-1 text-[11px] text-[#5f6f82]">Các phiếu trùng chia toàn bộ quỹ</p></div>
            <div className="rounded-lg bg-[#f4fbf4] p-3 text-center ring-1 ring-[#d9edda]"><Coins className="mx-auto size-6 text-[#49a942]" aria-hidden="true" /><p className="mt-2 text-xs font-bold text-[#26652e]">Nếu không trùng</p><p className="mt-1 break-words text-base font-black text-[#153a60]">{formatVnd(Math.floor(advertisedPot * 0.2))}</p><p className="mt-1 text-[11px] text-[#5f6f82]">Phiếu gần nhất chia 20% quỹ</p></div>
            <div className="rounded-lg bg-[#f4f8ff] p-3 text-center ring-1 ring-[#deebfa]"><PiggyBank className="mx-auto size-6 text-[#3e83cf]" aria-hidden="true" /><p className="mt-2 text-xs font-bold text-[#325d91]">Phần chưa trao</p><p className="mt-1 break-words text-base font-black text-[#153a60]">Cộng dồn</p><p className="mt-1 text-[11px] text-[#5f6f82]">Chuyển sang kỳ tiếp theo</p></div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7edf3] pt-4">
            <div><p className="text-xs font-bold text-[#153a60]">Phiếu của bạn</p><p className="mt-1 text-xs leading-5 text-[#58749a]">Một đơn hợp lệ nhận một phiếu từ 4 số cuối mã đơn.</p></div>
            <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#b8ea78] px-4 text-xs font-bold text-[#173c49] hover:bg-[#a5df5f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#258b3e]">Mua hàng nhận phiếu <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
          </div>
          {currentTickets.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{currentTickets.map((ticket) => <span key={ticket.id} className="rounded-md bg-[#ecf6fd] px-2 py-1 font-mono text-xs font-bold tabular-nums text-[#1d638f]">{ticket.number}</span>)}{waitingCount > currentTickets.length && <span className="self-center text-xs text-[#58749a]">+{waitingCount - currentTickets.length} phiếu</span>}</div>}
        </section>

        <section className="min-w-0 rounded-xl border border-[#e2ebf3] bg-white p-4 sm:p-5" aria-labelledby="history-heading">
          <div className="flex items-center justify-between gap-3"><h2 id="history-heading" className="flex items-center gap-2 text-sm font-extrabold text-[#153a60]"><Clock3 className="size-4 text-[#2ca142]" aria-hidden="true" /> Kết quả các kỳ trước</h2><span className="text-xs text-[#597695]">{recentDraws.length} kỳ gần nhất</span></div>
          {recentDraws.length === 0 ? <div className="mt-5 rounded-lg bg-[#f5f9fc] px-4 py-5 text-sm leading-6 text-[#58749a]">Chưa có kỳ nào công bố kết quả. Kỳ mới sẽ xuất hiện tại đây sau khi admin quay số.</div> : <ul className="mt-2 divide-y divide-[#e9eff4]">{recentDraws.map((draw) => <li key={draw.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-3 text-xs"><div className="min-w-0"><p className="truncate font-bold text-[#153a60]">{draw.name}</p><p className="mt-0.5 text-[#607b96]">{draw.drawnAt ? dateFormatter.format(draw.drawnAt) : "—"} · Số trúng <span className="font-mono font-bold tabular-nums text-[#286e40]">{draw.winningNumber}</span></p></div><span className="font-bold tabular-nums text-[#2b7d3d]">Đã trao {formatVnd(draw.paidOut)}</span></li>)}</ul>}
          {pastTickets.length > 0 && <div className="mt-3 border-t border-[#e9eff4] pt-3"><p className="text-xs font-bold text-[#153a60]">Phiếu đã quay của bạn</p><div className="mt-2 space-y-1.5">{pastTickets.map((ticket) => <p key={ticket.id} className="flex justify-between gap-2 text-xs text-[#597695]"><span className="truncate">{ticket.periodName ?? "Kỳ quay"} · #{ticket.number}</span><span className={ticket.isWinner ? "shrink-0 font-bold text-[#218543]" : "shrink-0"}>{ticket.isWinner ? `+${formatVnd(ticket.prizeAmount)}` : "Chưa trúng"}</span></p>)}</div></div>}
        </section>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#5d7691]">Giải thưởng là số tạm tính và có thể tăng theo quỹ tích lũy {Math.round(prizeFundRate * 100)}% hoa hồng trước giờ quay. Vòng quay chỉ minh họa kết quả chính thức; không quay thưởng tức thì.</p>
    </main>
  );
}
