import { desc, eq } from "drizzle-orm";
import { Gift, PiggyBank, Ticket, Trophy } from "lucide-react";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { getFundBalance } from "@/lib/lucky-draw/service";

export const metadata = { title: "Rút thăm may mắn — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function LuckyDrawPage() {
  const user = await requireUser();
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
    <main className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e]">Rút thăm may mắn</h1>
        <p className="mt-1 text-sm text-[#58749a]">Mỗi đơn mua hoàn tất bạn nhận 1 phiếu dự thưởng — số phiếu là 4 số cuối mã đơn hàng. Cuối kỳ hệ thống quay 1 số: trùng là lãnh trọn quỹ!</p>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-[#e6d4fb] bg-gradient-to-br from-[#faf3ff] to-[#eef5ff] p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#aa34de] shadow-sm"><PiggyBank className="h-7 w-7" /></span>
          <div>
            <p className="text-sm font-medium text-[#6b5a86]">Quỹ thưởng hiện tại</p>
            <p className="mt-0.5 text-[34px] font-black leading-none tracking-tight text-[#6a1fb0]">{formatVnd(fund)}</p>
            <p className="mt-2 text-xs text-[#8a7aa6]">Quỹ càng cộng dồn qua các kỳ chưa trúng, giải càng lớn.</p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-4 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f1ff] text-[#287be5]"><Ticket className="h-5 w-5" /></span><div><p className="text-xs font-medium text-[#34527d]">Phiếu đang chờ quay</p><p className="text-2xl font-black text-[#12335f]">{current.length}</p></div></div></article>
        <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-4 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f9df] text-[#3ba818]"><Trophy className="h-5 w-5" /></span><div><p className="text-xs font-medium text-[#34527d]">Tổng đã trúng</p><p className="text-2xl font-black text-[#168146]">{formatVnd(totalWon)}</p></div></div></article>
      </div>

      <section className="mt-5 rounded-xl border border-[#dfe9f5] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#173861]"><Ticket className="h-4 w-4 text-[#287be5]" /> Phiếu của bạn kỳ này</h2>
        {current.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#6681a7]">Chưa có phiếu nào. Mua hàng qua Win-Win Back và chờ đơn hoàn tất để nhận phiếu dự thưởng.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {current.map((t) => (
              <span key={t.id} className="inline-flex items-center rounded-lg border border-[#cfe0f5] bg-[#f4f9ff] px-3 py-2 text-base font-black tracking-widest text-[#1f5fb0]">{t.number}</span>
            ))}
          </div>
        )}
      </section>

      <section className="mt-5 rounded-xl border border-[#dfe9f5] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#173861]"><Gift className="h-4 w-4 text-[#aa34de]" /> Lịch sử dự thưởng</h2>
        {past.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#6681a7]">Chưa có kỳ nào bạn tham gia được quay.</p>
        ) : (
          <ul className="divide-y divide-[#eef3f9]">
            {past.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-sm font-black tracking-widest ${t.isWinner ? "bg-[#e8f9df] text-[#168146]" : "bg-[#f1f5fa] text-[#6b86a8]"}`}>{t.number}</span>
                  <div className="leading-5">
                    <p className="font-semibold text-[#244a7c]">{t.periodName ?? "Kỳ quay"}</p>
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
    </main>
  );
}
