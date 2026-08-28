import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  ArrowRight,
  Link2,
  List,
  ShoppingBag,
  Wallet,
  ArrowDownToLine,
  ShieldCheck,
} from "lucide-react";
import { db } from "@/db";
import {
  affiliateLinks,
  orders,
  walletTransactions,
  withdrawals,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { CreateLinkForm } from "@/components/dashboard/CreateLinkForm";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { BuyButton } from "@/components/dashboard/BuyButton";
import { Dock } from "@/components/dashboard/Dock";
import { formatVnd, minWithdrawal } from "@/lib/config";
import { getRequestBaseUrl } from "@/lib/baseUrl";
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

function SectionHeading({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Link2;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b7e961]/12 text-[#b7e961]">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
      </span>
      <div>
        <h2 className="text-lg font-bold leading-tight text-white">{title}</h2>
        {hint && <p className="text-xs text-white/45">{hint}</p>}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-8 text-center text-sm text-white/40">
      {text}
    </p>
  );
}

const cardClass =
  "rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-sm";
const sectionClass = "mx-auto max-w-5xl scroll-mt-24 px-6";

export default async function DashboardPage() {
  const user = await requireUser();
  const baseUrl = await getRequestBaseUrl();

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
    <div className="winwin-root relative min-h-screen bg-[#082b4b] pb-32 text-white">
      {/* Slim top bar — navigation lives in the dock */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-black tracking-tight">
            Win-Win <span className="text-[#b7e961]">Back</span>
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3.5 text-sm backdrop-blur-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b7e961] text-xs font-black text-[#0a2438]">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[10rem] truncate font-medium text-white/85">
              {user.name}
            </span>
            {user.role === "admin" && (
              <span className="flex items-center gap-1 rounded-full bg-[#eabf39]/15 px-2 py-0.5 text-[10px] font-bold text-[#eabf39]">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Wallet hero ── */}
      <section id="tong-quan" className="ww-hero-bg relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-28 sm:pb-20 sm:pt-36">
          <p
            className="ww-hero-enter text-sm font-medium text-white/60"
            style={{ "--delay": "0ms" } as React.CSSProperties}
          >
            Chào {user.name.split(" ").slice(-1)[0]} 👋
          </p>

          <div
            className="ww-hero-enter mt-3"
            style={{ "--delay": "80ms" } as React.CSSProperties}
          >
            <p className="text-sm text-white/55">Số dư ví của bạn</p>
            <p className="mt-1 text-5xl font-black tracking-tight text-[#b7e961] sm:text-6xl">
              {formatVnd(user.balance)}
            </p>
          </div>

          <div
            className="ww-hero-enter mt-7 flex flex-wrap items-center gap-x-8 gap-y-3"
            style={{ "--delay": "160ms" } as React.CSSProperties}
          >
            <div>
              <p className="text-xs text-white/45">Hoàn tiền đang chờ</p>
              <p className="mt-0.5 text-xl font-bold text-white">
                {formatVnd(pendingCommission)}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" aria-hidden="true" />
            <div>
              <p className="text-xs text-white/45">Đã hoàn tiền</p>
              <p className="mt-0.5 text-xl font-bold text-white">
                {formatVnd(earned)}
              </p>
            </div>
          </div>

          <div
            className="ww-hero-enter mt-8 flex flex-wrap gap-3"
            style={{ "--delay": "240ms" } as React.CSSProperties}
          >
            <a
              href="#tao-link"
              className="relative flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold text-[#14334c] transition-all duration-200 hover:scale-[1.03] hover:brightness-105"
              style={{
                background:
                  "linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)",
                boxShadow:
                  "0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 4px 12px rgba(183,233,97,0.45), 0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              Tạo link hoàn tiền <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#rut-tien"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
            >
              Rút tiền về ngân hàng
            </a>
          </div>
        </div>
      </section>

      <main className="space-y-14 pt-14">
        {/* ── Create link (console) ── */}
        <section id="tao-link" data-animate className={sectionClass}>
          <SectionHeading
            icon={Link2}
            title="Dán link sản phẩm → nhận link hoàn tiền"
            hint="TikTok Shop hoặc Shopee — dán link, nhận ngay link hoàn tiền."
          />
          <div
            data-animate="scale"
            className="rounded-2xl border border-white/10 bg-[#0a2f50]/60 p-3 shadow-2xl backdrop-blur-sm"
          >
            <div className="rounded-xl bg-white p-5">
              <CreateLinkForm />
              <p className="mt-3 text-xs text-gray-500">
                Sau khi tạo, bấm{" "}
                <span className="font-semibold text-[#3f8a2e]">
                  Mua trên TikTok
                </span>{" "}
                để mở app và đặt hàng. Đơn hoàn tất, tiền hoàn tự động về ví.
              </p>
            </div>
          </div>
        </section>

        {/* ── Links ── */}
        <section id="link-cua-ban" data-animate className={sectionClass}>
          <SectionHeading
            icon={List}
            title="Link của bạn"
            hint={`${links.length} link đã tạo`}
          />
          {links.length === 0 ? (
            <Empty text="Chưa có link nào. Dán link sản phẩm ở trên để bắt đầu." />
          ) : (
            <div className="space-y-3">
              {links.map((l) => {
                const shortUrl = `${baseUrl}/go/${l.shortCode}`;
                return (
                  <div
                    key={l.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium">
                          {platformLabel[l.platform]}
                        </span>
                        <span className="truncate text-sm text-white/55">
                          {l.originalUrl}
                        </span>
                      </div>
                      <p className="mt-1.5 font-mono text-sm text-[#b7e961]">
                        {shortUrl}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-white/45">
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
        </section>

        {/* ── Orders ── */}
        <section id="don-hang" data-animate className={sectionClass}>
          <SectionHeading
            icon={ShoppingBag}
            title="Đơn hàng & hoa hồng"
            hint="Đơn được đồng bộ từ TikTok Shop khi hoàn tất."
          />
          <div className={cardClass}>
            {orderRows.length === 0 ? (
              <Empty text="Chưa có đơn hàng nào được ghi nhận." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-white/45">
                    <tr className="border-b border-white/10">
                      <th className="py-2 pr-4 font-medium">Sản phẩm</th>
                      <th className="py-2 pr-4 font-medium">Sàn</th>
                      <th className="py-2 pr-4 font-medium">Giá trị đơn</th>
                      <th className="py-2 pr-4 font-medium">Hoàn tiền</th>
                      <th className="py-2 pr-4 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderRows.map((o) => (
                      <tr key={o.id} className="border-b border-white/5">
                        <td className="py-2.5 pr-4">{o.productName}</td>
                        <td className="py-2.5 pr-4 text-white/70">
                          {platformLabel[o.platform]}
                        </td>
                        <td className="py-2.5 pr-4 text-white/70">
                          {formatVnd(o.orderAmount)}
                        </td>
                        <td className="py-2.5 pr-4 font-semibold text-[#b7e961]">
                          {formatVnd(o.cashbackAmount)}
                        </td>
                        <td className="py-2.5 pr-4">
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
          </div>
        </section>

        {/* ── Wallet history ── */}
        <section id="vi" data-animate className={sectionClass}>
          <SectionHeading icon={Wallet} title="Lịch sử ví" />
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

        {/* ── Withdrawal ── */}
        <section id="rut-tien" data-animate className={sectionClass}>
          <SectionHeading
            icon={ArrowDownToLine}
            title="Rút tiền"
            hint={`Tối thiểu ${formatVnd(minWithdrawal)} mỗi lần rút.`}
          />
          <div className={cardClass}>
            <WithdrawalForm balance={user.balance} minWithdrawal={minWithdrawal} />
            {wdRows.length > 0 && (
              <div className="mt-6 overflow-x-auto border-t border-white/10 pt-6">
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
            )}
          </div>
        </section>
      </main>

      <Dock role={user.role} />
    </div>
  );
}
