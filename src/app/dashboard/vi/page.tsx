import { desc, eq } from "drizzle-orm";
import { Wallet, ArrowDownToLine, History } from "lucide-react";
import { db } from "@/db";
import { walletTransactions, withdrawals } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";
import { PageHeader, Empty, cardClass } from "@/components/dashboard/ui";
import { formatVnd, minWithdrawal } from "@/lib/config";
import {
  txTypeLabel,
  withdrawalStatusClass,
  withdrawalStatusLabel,
} from "@/lib/labels";

export const metadata = { title: "Ví của bạn — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const user = await requireUser();

  const [txRows, wdRows] = await Promise.all([
    db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, user.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(100),
    db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, user.id))
      .orderBy(desc(withdrawals.requestedAt))
      .limit(50),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
      <PageHeader
        icon={Wallet}
        title="Ví của bạn"
        hint="Số dư, rút tiền và lịch sử giao dịch."
      />

      {/* Balance + withdraw */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div className="rounded-3xl border border-[#b7e961]/25 bg-[#b7e961]/[0.08] p-6">
          <p className="text-sm text-white/60">Số dư khả dụng</p>
          <p className="mt-1 text-4xl font-black tracking-tight text-[#b7e961]">
            {formatVnd(user.balance)}
          </p>
          <p className="mt-3 text-xs text-white/45">
            Rút tối thiểu {formatVnd(minWithdrawal)} mỗi lần.
          </p>
        </div>

        <div className={cardClass}>
          <div className="mb-4 flex items-center gap-2 text-white/80">
            <ArrowDownToLine className="h-4 w-4 text-[#b7e961]" />
            <h2 className="text-sm font-bold">Rút tiền về ngân hàng</h2>
          </div>
          <WithdrawalForm balance={user.balance} minWithdrawal={minWithdrawal} />
        </div>
      </div>

      {/* Wallet history */}
      <section>
        <div className="mb-4 flex items-center gap-2 text-white/80">
          <History className="h-4 w-4 text-[#b7e961]" />
          <h2 className="text-sm font-bold">Lịch sử ví</h2>
        </div>
        <div className={cardClass}>
          {txRows.length === 0 ? (
            <Empty text="Chưa có giao dịch ví nào." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/45">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 font-medium">Thời gian</th>
                    <th className="py-2 pr-4 font-medium">Loại</th>
                    <th className="py-2 pr-4 font-medium">Số tiền</th>
                    <th className="py-2 pr-4 font-medium">Số dư sau</th>
                    <th className="py-2 pr-4 font-medium">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {txRows.map((t) => (
                    <tr key={t.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-4 text-white/55">
                        {t.createdAt.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2.5 pr-4 text-white/70">
                        {txTypeLabel[t.type]}
                      </td>
                      <td
                        className={`py-2.5 pr-4 font-semibold ${t.amount >= 0 ? "text-[#b7e961]" : "text-red-300"}`}
                      >
                        {t.amount >= 0 ? "+" : ""}
                        {formatVnd(t.amount)}
                      </td>
                      <td className="py-2.5 pr-4 text-white/70">
                        {formatVnd(t.balanceAfter)}
                      </td>
                      <td className="py-2.5 pr-4 text-white/55">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Withdrawal history */}
      {wdRows.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2 text-white/80">
            <ArrowDownToLine className="h-4 w-4 text-[#b7e961]" />
            <h2 className="text-sm font-bold">Lịch sử rút tiền</h2>
          </div>
          <div className={cardClass}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/45">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 font-medium">Thời gian</th>
                    <th className="py-2 pr-4 font-medium">Số tiền</th>
                    <th className="py-2 pr-4 font-medium">Ngân hàng</th>
                    <th className="py-2 pr-4 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {wdRows.map((w) => (
                    <tr key={w.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-4 text-white/55">
                        {w.requestedAt.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2.5 pr-4 font-semibold">
                        {formatVnd(w.amount)}
                      </td>
                      <td className="py-2.5 pr-4 text-white/55">
                        {w.bankName} · {w.bankAccount}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs ${withdrawalStatusClass[w.status]}`}
                        >
                          {withdrawalStatusLabel[w.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
