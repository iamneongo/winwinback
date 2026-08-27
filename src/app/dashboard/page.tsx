import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  affiliateLinks,
  orders,
  walletTransactions,
  withdrawals,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { CreateLinkForm } from "@/components/dashboard/CreateLinkForm";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { BuyButton } from "@/components/dashboard/BuyButton";
import { baseUrl, formatVnd, minWithdrawal } from "@/lib/config";
import {
  orderStatusClass,
  orderStatusLabel,
  platformLabel,
  txTypeLabel,
  withdrawalStatusClass,
  withdrawalStatusLabel,
} from "@/lib/labels";

export const metadata = { title: "Bảng điều khiển — Win-Win Back" };
export const dynamic = "force-dynamic";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-white/40">{text}</p>;
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [links, orderRows, txRows, wdRows] = await Promise.all([
    db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.userId, user.id))
      .orderBy(desc(affiliateLinks.createdAt))
      .limit(50),
    db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.orderedAt))
      .limit(50),
    db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, user.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(50),
    db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, user.id))
      .orderBy(desc(withdrawals.requestedAt))
      .limit(50),
  ]);

  const pendingCommission = orderRows
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .reduce((s, o) => s + o.cashbackAmount, 0);
  const earned = orderRows
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.cashbackAmount, 0);

  return (
    <div className="min-h-screen bg-[#082b4b] text-white">
      <AppHeader name={user.name} role={user.role} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#b7e961]/30 bg-[#b7e961]/10 p-6">
            <p className="text-sm text-white/70">Số dư ví</p>
            <p className="mt-1 text-2xl font-black text-[#b7e961]">
              {formatVnd(user.balance)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">Hoàn tiền đang chờ</p>
            <p className="mt-1 text-2xl font-black text-white">
              {formatVnd(pendingCommission)}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">Đã hoàn tiền</p>
            <p className="mt-1 text-2xl font-black text-white">
              {formatVnd(earned)}
            </p>
          </div>
        </div>

        {/* Create link */}
        <Card title="Dán link sản phẩm → nhận link hoàn tiền">
          <CreateLinkForm />
          <p className="mt-3 text-xs text-white/50">
            Dán link sản phẩm TikTok Shop → bấm{" "}
            <span className="font-semibold text-[#b7e961]">Mua trên TikTok</span>{" "}
            để mở app TikTok và đặt hàng. Khi đơn hoàn tất, tiền hoàn tự động về
            ví của bạn.
          </p>
        </Card>

        {/* Links */}
        <Card title="Link của bạn">
          {links.length === 0 ? (
            <Empty text="Chưa có link nào. Dán link sản phẩm ở trên để bắt đầu." />
          ) : (
            <div className="space-y-3">
              {links.map((l) => {
                const shortUrl = `${baseUrl}/go/${l.shortCode}`;
                return (
                  <div
                    key={l.id}
                    className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs">
                          {platformLabel[l.platform]}
                        </span>
                        <span className="truncate text-sm text-white/60">
                          {l.originalUrl}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-sm text-[#b7e961]">
                        {shortUrl}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-white/50">
                        {l.clicks} lượt click
                      </span>
                      <CopyLink value={shortUrl} />
                      <BuyButton
                        href={shortUrl}
                        platformName={platformLabel[l.platform]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Orders & commissions */}
        <Card title="Đơn hàng & hoa hồng">
          {orderRows.length === 0 ? (
            <Empty text="Chưa có đơn hàng nào được ghi nhận." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4">Sản phẩm</th>
                    <th className="py-2 pr-4">Sàn</th>
                    <th className="py-2 pr-4">Giá trị đơn</th>
                    <th className="py-2 pr-4">Hoàn tiền</th>
                    <th className="py-2 pr-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((o) => (
                    <tr key={o.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{o.productName}</td>
                      <td className="py-2 pr-4">{platformLabel[o.platform]}</td>
                      <td className="py-2 pr-4">{formatVnd(o.orderAmount)}</td>
                      <td className="py-2 pr-4 font-semibold text-[#b7e961]">
                        {formatVnd(o.cashbackAmount)}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs ${orderStatusClass[o.status]}`}
                        >
                          {orderStatusLabel[o.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Wallet transactions */}
        <Card title="Lịch sử ví">
          {txRows.length === 0 ? (
            <Empty text="Chưa có giao dịch ví nào." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4">Thời gian</th>
                    <th className="py-2 pr-4">Loại</th>
                    <th className="py-2 pr-4">Số tiền</th>
                    <th className="py-2 pr-4">Số dư sau</th>
                    <th className="py-2 pr-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {txRows.map((t) => (
                    <tr key={t.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white/60">
                        {t.createdAt.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2 pr-4">{txTypeLabel[t.type]}</td>
                      <td
                        className={`py-2 pr-4 font-semibold ${t.amount >= 0 ? "text-[#b7e961]" : "text-red-300"}`}
                      >
                        {t.amount >= 0 ? "+" : ""}
                        {formatVnd(t.amount)}
                      </td>
                      <td className="py-2 pr-4">{formatVnd(t.balanceAfter)}</td>
                      <td className="py-2 pr-4 text-white/60">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Withdrawal */}
        <Card title="Rút tiền">
          <WithdrawalForm
            balance={user.balance}
            minWithdrawal={minWithdrawal}
          />
          {wdRows.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/50">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4">Thời gian</th>
                    <th className="py-2 pr-4">Số tiền</th>
                    <th className="py-2 pr-4">Ngân hàng</th>
                    <th className="py-2 pr-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {wdRows.map((w) => (
                    <tr key={w.id} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white/60">
                        {w.requestedAt.toLocaleString("vi-VN")}
                      </td>
                      <td className="py-2 pr-4 font-semibold">
                        {formatVnd(w.amount)}
                      </td>
                      <td className="py-2 pr-4 text-white/60">
                        {w.bankName} · {w.bankAccount}
                      </td>
                      <td className="py-2 pr-4">
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
          )}
        </Card>
      </main>
    </div>
  );
}
