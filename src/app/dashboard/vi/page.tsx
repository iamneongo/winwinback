import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight, Banknote, Check, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Landmark, Lightbulb, ShoppingBag, Wallet } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { walletTransactions, withdrawals } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { formatVnd, minWithdrawal } from "@/lib/config";
import { txTypeLabel } from "@/lib/labels";

export const metadata = { title: "Ví hoàn tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const typeMeta = {
  cashback: { label: "Hoàn tiền đơn hàng", tone: "bg-[#ecfae4] text-[#249d24]", icon: ShoppingBag },
  withdrawal: { label: "Yêu cầu rút tiền về ngân hàng", tone: "bg-[#eaf2ff] text-[#287be5]", icon: Banknote },
  refund: { label: "Hoàn lại giao dịch", tone: "bg-[#f6e9ff] text-[#aa34de]", icon: CircleDollarSign },
  adjustment: { label: "Điều chỉnh số dư", tone: "bg-[#fff3d8] text-[#dd9100]", icon: CircleDollarSign },
} as const;

const TYPE_TABS: { label: string; value?: "cashback" | "withdrawal" | "refund" | "adjustment" }[] = [
  { label: "Tất cả", value: undefined },
  { label: "Hoàn tiền về ví", value: "cashback" },
  { label: "Rút tiền", value: "withdrawal" },
  { label: "Hoàn lại", value: "refund" },
  { label: "Điều chỉnh", value: "adjustment" },
];

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function WalletStat({ icon: Icon, iconClass, label, value, action, href = "#" }: { icon: typeof Wallet; iconClass: string; label: string; value: string; action: string; href?: string }) {
  return <article className="min-h-[9.5rem] rounded-xl border border-[#e0eaf6] bg-white p-3.5 shadow-[0_5px_14px_rgba(26,73,124,0.04)] sm:min-h-[10.8rem] sm:p-5"><div className="flex items-center gap-2.5 sm:gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${iconClass}`}><Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} /></span><p className="text-xs font-medium leading-5 text-[#234b7d] sm:text-sm">{label}</p></div><p className="mt-3 text-[22px] font-black leading-none tracking-tight text-[#12335f] sm:mt-4 sm:text-[26px]">{value}</p><Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1261ed] hover:underline sm:mt-5 sm:gap-2 sm:text-sm">{action} <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Link></article>;
}

export default async function WalletPage({ searchParams }: { searchParams: Promise<{ type?: string; from?: string; to?: string; page?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;

  const activeType = TYPE_TABS.find((t) => t.value === query.type)?.value;
  const startDate = query.from ? new Date(`${query.from}T00:00:00`) : undefined;
  const endDate = query.to ? new Date(`${query.to}T23:59:59.999`) : undefined;
  const validStart = startDate && !Number.isNaN(startDate.getTime()) ? startDate : undefined;
  const validEnd = endDate && !Number.isNaN(endDate.getTime()) ? endDate : undefined;

  const txConditions = [eq(walletTransactions.userId, user.id)];
  if (activeType) txConditions.push(eq(walletTransactions.type, activeType));
  if (validStart) txConditions.push(gte(walletTransactions.createdAt, validStart));
  if (validEnd) txConditions.push(lte(walletTransactions.createdAt, validEnd));
  const txWhere = and(...txConditions);

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(walletTransactions).where(txWhere);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(query.page) || 1), totalPages);

  const [transactions, withdrawalsRows] = await Promise.all([
    db.select().from(walletTransactions).where(txWhere).orderBy(desc(walletTransactions.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select().from(withdrawals).where(eq(withdrawals.userId, user.id)).orderBy(desc(withdrawals.requestedAt)).limit(50),
  ]);
  const waitingAmount = withdrawalsRows.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amount, 0);
  const withdrawnAmount = withdrawalsRows.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const linkedBank = withdrawalsRows[0];

  const filterQ = { type: activeType, from: query.from, to: query.to };
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = (page - 1) * PAGE_SIZE + transactions.length;

  return <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
    <header className="mb-6"><h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">Ví hoàn tiền</h1><p className="mt-1 text-sm text-[#58749a]">Theo dõi số dư, lịch sử giao dịch và rút tiền về tài khoản của bạn</p></header>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22.8rem]">
      <div><div className="grid grid-cols-2 gap-3 2xl:grid-cols-4"><WalletStat icon={Wallet} iconClass="bg-[#e7f9df] text-[#33a91f]" label="Số dư khả dụng" value={formatVnd(user.balance)} action="Rút tiền ngay" href="#rut-tien" /><WalletStat icon={Clock3} iconClass="bg-[#fff1d9] text-[#e99a10]" label="Tiền chờ duyệt" value={formatVnd(waitingAmount)} action="Xem chi tiết" href="#lich-su" /><WalletStat icon={ArrowUpRight} iconClass="bg-[#e8f1ff] text-[#287be5]" label="Tổng đã rút" value={formatVnd(withdrawnAmount)} action="Xem lịch sử rút" href="#lich-su" /><WalletStat icon={Landmark} iconClass="bg-[#f6e9ff] text-[#aa34de]" label="Tài khoản ngân hàng" value={linkedBank ? "Đã liên kết" : "Chưa liên kết"} action="Xem tài khoản" href="#tai-khoan" /></div>
      <section id="lich-su" className="mt-4 overflow-hidden rounded-xl border border-[#e0eaf6] bg-white shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><header className="flex flex-col gap-4 border-b border-[#e5edf7] px-4 py-4 sm:px-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-base font-bold text-[#173861] sm:text-lg">Lịch sử giao dịch ví</h2><div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">{TYPE_TABS.map((tab) => { const active = tab.value === activeType; return <Link key={tab.label} href={`/dashboard/vi${qs({ type: tab.value, from: query.from, to: query.to })}`} className={`rounded-full px-2.5 py-1.5 text-xs font-medium sm:px-3 ${active ? "bg-[#eaf9df] font-bold text-[#28711a] ring-1 ring-inset ring-[#b1eb78]" : "border border-[#e0eaf6] text-[#46658e] hover:bg-[#f6f9fd]"}`}>{tab.label}</Link>; })}</div></div><form action="/dashboard/vi" className="flex items-end gap-2">{activeType && <input type="hidden" name="type" value={activeType} />}<DateRangeFilter defaultFrom={query.from} defaultTo={query.to} /><button type="submit" className="h-11 shrink-0 rounded-lg bg-[#b7e961] px-4 text-xs font-bold text-[#173b5e] transition hover:bg-[#a9e75e]">Lọc</button>{(query.from || query.to) && <Link href={`/dashboard/vi${qs({ type: activeType })}`} className="flex h-11 items-center rounded-lg border border-[#d9e5f4] px-3 text-xs font-bold text-[#34527d] hover:bg-[#f6f9fd]">Xóa</Link>}</form></header>
        <div className="overflow-x-auto"><table className="min-w-[720px] w-full text-left text-xs"><thead className="border-b border-[#e5edf7] bg-[#f8fbff] font-bold text-[#25436b]"><tr><th className="px-4 py-3.5">Mã GD</th><th className="px-4 py-3.5">Nội dung</th><th className="px-4 py-3.5">Số tiền</th><th className="px-4 py-3.5">Trạng thái</th><th className="px-4 py-3.5">Thời gian</th></tr></thead><tbody className="divide-y divide-[#e8eef6]">{transactions.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-[#6681a7]">Không có giao dịch phù hợp.</td></tr> : transactions.map((item) => { const meta = typeMeta[item.type]; const Icon = meta.icon; const success = item.amount >= 0; return <tr key={item.id} className="text-[#49688f] hover:bg-[#fbfdff]"><td className="px-4 py-3.5 font-medium text-[#5c78a0]">{item.id.slice(0, 10).toUpperCase()}</td><td className="px-4 py-3.5"><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.tone}`}><Icon className="h-4 w-4" /></span><span><b className="block text-[#244a7c]">{item.note || meta.label}</b><small className="mt-0.5 block text-[#7790b1]">{txTypeLabel[item.type]}</small></span></div></td><td className={`px-4 py-3.5 font-bold ${success ? "text-[#168146]" : "text-[#f04438]"}`}>{success ? "+ " : "- "}{formatVnd(Math.abs(item.amount))}</td><td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${success ? "bg-[#e8f8eb] text-[#168146]" : "bg-[#eaf2ff] text-[#287be5]"}`}><Check className="h-3.5 w-3.5" />{success ? "Thành công" : "Đã xử lý"}</span></td><td className="px-4 py-3.5 leading-4">{item.createdAt.toLocaleDateString("vi-VN")}<br /><span className="text-[#7790b1]">{item.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></td></tr>; })}</tbody></table></div><footer className="flex flex-col gap-3 border-t border-[#e8eef6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><span className="text-xs text-[#6d87aa]">Hiển thị {firstShown} - {lastShown} trong tổng số {total} giao dịch</span><div className="flex items-center gap-2 self-end sm:self-auto">{page > 1 ? <Link href={`/dashboard/vi${qs({ ...filterQ, page: String(page - 1) })}`} aria-label="Trang trước" className="rounded-lg border border-[#dce6f3] p-1.5 hover:bg-[#f6f9fd]"><ChevronLeft className="h-4 w-4" /></Link> : <span className="rounded-lg border border-[#eef3f9] p-1.5 text-[#c3d0e0]"><ChevronLeft className="h-4 w-4" /></span>}<span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-[#eaf9df] px-2 text-xs font-bold text-[#28711a] ring-1 ring-inset ring-[#b1eb78]">{page}/{totalPages}</span>{page < totalPages ? <Link href={`/dashboard/vi${qs({ ...filterQ, page: String(page + 1) })}`} aria-label="Trang sau" className="rounded-lg border border-[#dce6f3] p-1.5 hover:bg-[#f6f9fd]"><ChevronRight className="h-4 w-4" /></Link> : <span className="rounded-lg border border-[#eef3f9] p-1.5 text-[#c3d0e0]"><ChevronRight className="h-4 w-4" /></span>}</div></footer></section></div>
      <aside className="space-y-4"><section id="rut-tien" className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f9df] text-[#35a920]"><Banknote className="h-4 w-4" /></span><h2 className="font-bold text-[#173861]">Rút tiền</h2></div><WithdrawalForm balance={user.balance} minWithdrawal={minWithdrawal} /></section><section id="tai-khoan" className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-center justify-between"><h2 className="font-bold text-[#173861]">Tài khoản liên kết</h2><Link href="/dashboard/tai-khoan" className="text-xs font-bold text-[#1261ed]">Thay đổi</Link></div><div className="mt-4 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf9e7] text-[#168146]"><Landmark className="h-6 w-6" /></span><div><b className="text-sm text-[#244a7c]">{linkedBank?.bankName || "Chưa có tài khoản"}</b><p className="mt-1 text-xs text-[#6681a7]">{linkedBank ? `**** ${linkedBank.bankAccount.slice(-4)}` : "Liên kết tài khoản để rút tiền"}</p></div>{linkedBank && <span className="ml-auto rounded-full bg-[#e8f8eb] px-2 py-1 text-[10px] font-bold text-[#168146]">Mặc định</span>}</div></section><section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><h2 className="flex items-center gap-2 font-bold text-[#173861]"><Lightbulb className="h-5 w-5 text-[#f3b51c]" /> Thông tin hữu ích</h2><ul className="mt-4 space-y-2 text-xs leading-5 text-[#5c78a0]"><li>✓ Số dư khả dụng có thể rút về tài khoản ngân hàng</li><li>✓ Thời gian xử lý: 1 - 2 ngày làm việc</li><li>✓ Rút tiền tối thiểu: {formatVnd(minWithdrawal)}/lần</li><li>✓ Miễn phí rút tiền</li></ul></section><section className="relative min-h-[10.6rem] overflow-hidden rounded-xl border border-[#dcefcf] bg-[#effde8] p-5"><Image src="/images/dashboard-wallet-promo-v3.png" alt="Mua sắm để nhận hoàn tiền" fill sizes="23rem" className="object-cover object-right" /><div className="relative z-10 max-w-[9rem]"><h2 className="text-lg font-black leading-5 text-[#173861]">Càng mua sắm,<br />càng nhận thêm</h2><p className="mt-2 text-xs text-[#49688f]">Hoàn tiền thật – Rút tiền dễ dàng</p><Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#a9e75e] px-3 py-2 text-xs font-bold text-[#173b5e]">Mua sắm ngay <ArrowUpRight className="h-3.5 w-3.5" /></Link></div></section></aside>
    </section>
  </main>;
}
