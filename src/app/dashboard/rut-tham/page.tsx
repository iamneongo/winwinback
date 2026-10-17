import { desc, eq } from "drizzle-orm";
import { Gift, PiggyBank, Ticket, Trophy } from "lucide-react";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd, prizeFundRate } from "@/lib/config";
import { getFundBalance } from "@/lib/lucky-draw/service";
import { cardClass, DashboardPageHeader, sectionTitleClass } from "@/components/dashboard/ui";

export const metadata = { title: "Rút thăm may mắn — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function LuckyDrawPage() {
  const user = await requireUser();
  const prizeFundPct = Math.round(prizeFundRate * 100);
  const [fund, tickets] = await Promise.all([
    getFundBalance(),
    db
      .select({
        id: luckyDrawTickets.id,
        number: luckyDrawTickets.number,
        isWinner: luckyDrawTickets.isWinner,
        prizeAmount: luckyDrawTickets.prizeAmount,
        createdAt: luckyDrawTickets.createdAt,
        periodId: luckyDrawTickets.periodId,
        periodName: luckyDrawPeriods.name,
        winningNumber: luckyDrawPeriods.winningNumber,
        drawnAt: luckyDrawPeriods.drawnAt,
      })
      .from(luckyDrawTickets)
      .leftJoin(luckyDrawPeriods, eq(luckyDrawTickets.periodId, luckyDrawPeriods.id))
      .where(eq(luckyDrawTickets.userId, user.id))
      .orderBy(desc(luckyDrawTickets.createdAt))
      .limit(200),
  ]);

  const current = tickets.filter((t) => t.periodId === null);
  const past = tickets.filter((t) => t.periodId !== null);
  const totalWon = past.reduce((s, t) => s + (t.isWinner ? t.prizeAmount : 0), 0);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <DashboardPageHeader title="Rút thăm may mắn" description="Theo dõi quỹ thưởng, phiếu dự thưởng và kết quả các kỳ quay của bạn." />

      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <article className={`${cardClass} min-w-0`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f9df] text-[#3ba818]"><PiggyBank className="h-5 w-5" /></span>
            <p className="text-sm font-medium text-[#34527d]">Quỹ thưởng hiện tại</p>
          </div>
          <p className="mt-3 break-words text-[26px] font-black leading-tight tracking-tight text-[#12335f]">{formatVnd(fund)}</p>
          <p className="mt-1 text-xs leading-5 text-[#6681a7]">Quỹ được cộng dồn qua các kỳ chưa có người trúng.</p>
        </article>
        <article className={`${cardClass} min-w-0`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f1ff] text-[#287be5]"><Ticket className="h-5 w-5" /></span>
            <p className="text-sm font-medium text-[#34527d]">Phiếu đang chờ quay</p>
          </div>
          <p className="mt-3 text-[26px] font-black leading-tight tracking-tight text-[#12335f]">{current.length}</p>
          <p className="mt-1 text-xs leading-5 text-[#6681a7]">Phiếu của kỳ quay sắp tới.</p>
        </article>
        <article className={`${cardClass} min-w-0`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff3d8] text-[#dd9100]"><Trophy className="h-5 w-5" /></span>
            <p className="text-sm font-medium text-[#34527d]">Tổng đã trúng</p>
          </div>
          <p className="mt-3 break-words text-[26px] font-black leading-tight tracking-tight text-[#12335f]">{formatVnd(totalWon)}</p>
          <p className="mt-1 text-xs leading-5 text-[#6681a7]">Tiền thưởng từ các kỳ trước.</p>
        </article>
      </div>

      <div className="mt-5 grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className={`${cardClass} min-w-0`}>
          <h2 className={`mb-3 flex items-center gap-2 ${sectionTitleClass}`}><Ticket className="h-4 w-4 text-[#287be5]" /> Phiếu của bạn kỳ này</h2>
          {current.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#6681a7]">Chưa có phiếu nào. Mua hàng qua Win-Win Back và chờ đơn hoàn tất để nhận phiếu dự thưởng.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {current.map((t) => (
                <span key={t.id} className="inline-flex items-center rounded-lg border border-[#cfe0f5] bg-[#f4f9ff] px-3 py-2 text-base font-black tracking-widest text-[#1f5fb0]">{t.number}</span>
              ))}
            </div>
          )}
          <p className="mt-4 border-t border-[#e8eef6] pt-4 text-xs leading-5 text-[#6681a7]">Mỗi đơn hợp lệ góp {prizeFundPct}% hoa hồng affiliate vào quỹ và tặng 1 phiếu (4 số cuối mã đơn). Cuối kỳ, số trùng kết quả quay sẽ nhận toàn bộ quỹ.</p>
        </section>

        <section className={`${cardClass} min-w-0`}>
          <h2 className={`mb-3 flex items-center gap-2 ${sectionTitleClass}`}><Gift className="h-4 w-4 text-[#3ba818]" /> Lịch sử dự thưởng</h2>
          {past.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#6681a7]">Chưa có kỳ nào bạn tham gia được quay.</p>
          ) : (
            <ul className="divide-y divide-[#eef3f9]">
              {past.map((t) => (
                <li key={t.id} className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3 text-sm sm:flex-nowrap">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-black tracking-widest ${t.isWinner ? "bg-[#e8f9df] text-[#168146]" : "bg-[#f1f5fa] text-[#6b86a8]"}`}>{t.number}</span>
                    <div className="min-w-0 leading-5">
                      <p className="break-words font-semibold text-[#244a7c]">{t.periodName ?? "Kỳ quay"}</p>
                      <p className="text-xs text-[#7790b1]">Số trúng: <b className="tracking-widest text-[#5a6f8e]">{t.winningNumber ?? "—"}</b></p>
                    </div>
                  </div>
                  {t.isWinner ? (
                    <span className="shrink-0 font-bold text-[#168146]">+{formatVnd(t.prizeAmount)}</span>
                  ) : (
                    <span className="shrink-0 text-xs text-[#9fb0c7]">Không trúng</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
