import { desc, isNull } from "drizzle-orm";
import { Dices, PiggyBank, Ticket, Trophy } from "lucide-react";
import { db } from "@/db";
import { luckyDrawPeriods, luckyDrawTickets } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { getFundBalance } from "@/lib/lucky-draw/service";
import { CreatePeriodForm, DrawButton } from "./LuckyDrawForms";

export const metadata = { title: "Rút thăm may mắn — Quản trị" };
export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminLuckyDrawPage() {
  await requireAdmin();
  const [fund, periods, undrawn] = await Promise.all([
    getFundBalance(),
    db.select().from(luckyDrawPeriods).orderBy(desc(luckyDrawPeriods.createdAt)).limit(50),
    db.select({ createdAt: luckyDrawTickets.createdAt }).from(luckyDrawTickets).where(isNull(luckyDrawTickets.periodId)),
  ]);
  const eligibleIn = (start: Date, end: Date) => undrawn.filter((t) => t.createdAt >= start && t.createdAt <= end).length;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e]">Rút thăm may mắn</h1>
        <p className="mt-1 text-sm text-[#58749a]">Mỗi đơn hoàn tất góp 10% hoa hồng vào quỹ và được 1 phiếu (4 số cuối mã đơn). Admin mở kỳ rồi quay: trùng số → lãnh hết quỹ; không trùng → phiếu gần nhất nhận 20%, phần còn lại cộng dồn.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-start gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6e9ff] text-[#aa34de]"><PiggyBank className="h-6 w-6" /></span><div><p className="text-sm font-medium text-[#34527d]">Quỹ hiện tại</p><p className="mt-1 text-[26px] font-black leading-none text-[#12335f]">{formatVnd(fund)}</p><p className="mt-3 text-xs text-[#7790b1]">Cộng dồn qua các kỳ chưa trúng</p></div></div></article>
        <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-start gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f1ff] text-[#287be5]"><Ticket className="h-6 w-6" /></span><div><p className="text-sm font-medium text-[#34527d]">Phiếu chưa quay</p><p className="mt-1 text-[26px] font-black leading-none text-[#12335f]">{undrawn.length}</p><p className="mt-3 text-xs text-[#7790b1]">Đang chờ được đưa vào một kỳ quay</p></div></div></article>
        <article className="rounded-xl border border-[#e1eaf6] bg-white px-5 py-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-start gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f9df] text-[#3ba818]"><Trophy className="h-6 w-6" /></span><div><p className="text-sm font-medium text-[#34527d]">Số kỳ đã quay</p><p className="mt-1 text-[26px] font-black leading-none text-[#12335f]">{periods.filter((p) => p.status === "drawn").length}</p><p className="mt-3 text-xs text-[#7790b1]">Tổng số kỳ: {periods.length}</p></div></div></article>
      </div>

      <section className="mt-5 rounded-xl border border-[#dfe9f5] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
        <h2 className="mb-4 text-sm font-bold text-[#173861]">Mở kỳ quay mới</h2>
        <CreatePeriodForm />
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-[#dfe9f5] bg-white shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
        <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-xs text-[#35537c]">
          <thead className="border-b border-[#dfe9f5] bg-[#f8fbff] text-[#234168]"><tr><th className="px-5 py-3.5">Kỳ</th><th className="px-3 py-3.5">Khoảng thời gian</th><th className="px-3 py-3.5">Trạng thái</th><th className="px-3 py-3.5">Phiếu</th><th className="px-3 py-3.5">Quỹ / Số trúng</th><th className="px-3 py-3.5">Kết quả</th><th className="px-4 py-3.5 text-center">Thao tác</th></tr></thead>
          <tbody className="divide-y divide-[#e8eef6]">
            {periods.length === 0 ? <tr><td colSpan={7} className="px-5 py-14 text-center text-[#6681a7]">Chưa có kỳ nào. Hãy mở kỳ quay đầu tiên ở trên.</td></tr> : periods.map((p) => {
              const drawn = p.status === "drawn";
              return <tr key={p.id} className="align-top hover:bg-[#fbfdff]">
                <td className="px-5 py-3.5 font-semibold text-[#244a7c]">{p.name}</td>
                <td className="px-3 py-3.5 leading-5">{fmtDate(p.startAt)}<br />→ {fmtDate(p.endAt)}</td>
                <td className="px-3 py-3.5">{drawn ? <span className="inline-flex rounded-full bg-[#eaf2ff] px-2.5 py-1 text-[11px] font-bold text-[#287be5]">Đã quay</span> : <span className="inline-flex rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[11px] font-bold text-[#168146]">Đang mở</span>}</td>
                <td className="px-3 py-3.5 font-medium">{drawn ? "—" : `${eligibleIn(p.startAt, p.endAt)} phiếu`}</td>
                <td className="px-3 py-3.5 font-medium">{drawn ? <>{formatVnd(p.potTotal)}<br /><span className="font-black tracking-widest text-[#aa34de]">{p.winningNumber}</span></> : "—"}</td>
                <td className="px-3 py-3.5">{drawn ? (p.exactMatch === null ? <span className="text-[#7790b1]">Không có phiếu → cộng dồn</span> : p.exactMatch ? <span className="font-semibold text-[#168146]">Trùng! Chi {formatVnd(p.paidOut)}</span> : <span className="text-[#e68b00]">Gần nhất nhận {formatVnd(p.paidOut)}</span>) : "—"}</td>
                <td className="px-4 py-3.5"><div className="flex justify-center">{drawn ? <span className="inline-flex items-center gap-1 text-[#9fb0c7]"><Dices className="h-4 w-4" /> Đã quay</span> : <DrawButton periodId={p.id} />}</div></td>
              </tr>;
            })}
          </tbody>
        </table></div>
      </section>
    </main>
  );
}
