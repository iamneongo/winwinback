import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import Link from "next/link";
import { ArrowUpRight, Banknote, Check, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Gift, Landmark, Lightbulb, ShoppingBag, Wallet } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { bankAccounts, walletTransactions, withdrawals } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { WithdrawalForm } from "@/components/dashboard/WithdrawalForm";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { formatVnd, minWithdrawal } from "@/lib/config";
import { txTypeLabel } from "@/lib/labels";
import { DashboardPageHeader } from "@/components/dashboard/ui";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollAreaContent, ScrollAreaViewport, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Ví hoàn tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const typeMeta = {
  cashback: { label: "Hoàn tiền đơn hàng", tone: "bg-[#ecfae4] text-[#249d24]", icon: ShoppingBag },
  withdrawal: { label: "Yêu cầu rút tiền về ngân hàng", tone: "bg-[#eaf2ff] text-[#287be5]", icon: Banknote },
  refund: { label: "Hoàn lại giao dịch", tone: "bg-[#f6e9ff] text-[#aa34de]", icon: CircleDollarSign },
  adjustment: { label: "Điều chỉnh số dư", tone: "bg-[#fff3d8] text-[#dd9100]", icon: CircleDollarSign },
  reward: { label: "Thưởng nhiệm vụ", tone: "bg-[#eafbe0] text-[#3f8a2e]", icon: Gift },
  prize: { label: "Trúng thưởng rút thăm", tone: "bg-[#f6e9ff] text-[#aa34de]", icon: Gift },
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

function WalletStat({ icon: Icon, iconClass, label, value, action, href }: { icon: typeof Wallet; iconClass: string; label: string; value: string; action: string; href: string }) {
  return <DashboardMetricCard icon={<span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${iconClass}`}><Icon className="size-6" strokeWidth={2.2} aria-hidden="true" /></span>} label={label} value={value} action={action} href={href} />;
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

  const [transactions, withdrawalsRows, bankAccountRows] = await Promise.all([
    db.select().from(walletTransactions).where(txWhere).orderBy(desc(walletTransactions.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select().from(withdrawals).where(eq(withdrawals.userId, user.id)).orderBy(desc(withdrawals.requestedAt)).limit(50),
    db.select({ bankName: bankAccounts.bankName, bankAccount: bankAccounts.bankAccount, accountHolder: bankAccounts.accountHolder }).from(bankAccounts).where(eq(bankAccounts.userId, user.id)).limit(1),
  ]);
  const waitingAmount = withdrawalsRows.filter((item) => (item.status === "pending" || item.status === "approved" || item.status === "needs_info")).reduce((sum, item) => sum + item.amount, 0);
  const withdrawnAmount = withdrawalsRows.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
  const linkedBank = bankAccountRows[0];

  const filterQ = { type: activeType, from: query.from, to: query.to };
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = (page - 1) * PAGE_SIZE + transactions.length;

  return <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
    <DashboardPageHeader title="Ví hoàn tiền" description="Theo dõi số dư, lịch sử giao dịch và rút tiền về tài khoản của bạn" />
    <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_22.8rem]">
      <div className="min-w-0"><div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"><WalletStat icon={Wallet} iconClass="bg-[#e7f9df] text-[#33a91f]" label="Số dư khả dụng" value={formatVnd(user.balance)} action="Rút tiền ngay" href="#rut-tien" /><WalletStat icon={Clock3} iconClass="bg-[#fff1d9] text-[#e99a10]" label="Tiền chờ duyệt" value={formatVnd(waitingAmount)} action="Xem chi tiết" href="#lich-su" /><WalletStat icon={ArrowUpRight} iconClass="bg-[#e8f1ff] text-[#287be5]" label="Tổng đã rút" value={formatVnd(withdrawnAmount)} action="Xem lịch sử rút" href="#lich-su" /><WalletStat icon={Landmark} iconClass="bg-[#f6e9ff] text-[#aa34de]" label="Tài khoản ngân hàng" value={linkedBank ? "Đã liên kết" : "Chưa liên kết"} action="Xem tài khoản" href="#tai-khoan" /></div>
      <section id="lich-su" className="mt-4 min-w-0 overflow-hidden rounded-xl border border-[#e0eaf6] bg-white shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
        <header className="flex min-w-0 flex-col gap-3 border-b border-[#e5edf7] px-4 py-3 sm:px-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-[#173861] sm:text-lg">Lịch sử giao dịch ví</h2>
            <Tabs value={activeType ?? "all"} className="mt-2 min-w-0">
              <ScrollArea className="w-full min-w-0">
                <ScrollAreaViewport className="w-full pb-1">
                  <ScrollAreaContent>
                    <TabsList aria-label="Lọc giao dịch theo loại" className="flex h-auto w-max justify-start gap-1.5 rounded-none bg-transparent p-0">
                      {TYPE_TABS.map((tab) => <TabsTrigger key={tab.label} value={tab.value ?? "all"} render={<Link href={`/dashboard/vi${qs({ type: tab.value, from: query.from, to: query.to })}`} />} className="min-h-10 rounded-lg border border-[#dbe7f6] px-3 text-xs font-semibold text-[#46658e] hover:bg-[#f6fbf3] data-active:border-[#b1eb78] data-active:bg-[#eaf9df] data-active:text-[#28711a] data-active:shadow-none">{tab.label}</TabsTrigger>)}
                    </TabsList>
                  </ScrollAreaContent>
                </ScrollAreaViewport>
                <ScrollBar orientation="horizontal" className="h-1.5 opacity-100" />
              </ScrollArea>
            </Tabs>
          </div>
          <form action="/dashboard/vi" className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 xl:w-[24rem] xl:shrink-0">
            {activeType && <input type="hidden" name="type" value={activeType} />}
            <DateRangeFilter defaultFrom={query.from} defaultTo={query.to} className="w-full" />
            <div className="flex min-w-0 gap-2">
              <Button type="submit" variant="cta" className="h-10 min-w-14 px-3 text-xs font-bold">Lọc</Button>
              {(query.from || query.to) && <Button variant="outline" nativeButton={false} render={<Link href={`/dashboard/vi${qs({ type: activeType })}`} />} className="h-10 px-3 text-xs font-bold">Xóa</Button>}
            </div>
          </form>
        </header>
        <div className="divide-y divide-[#e8eef6] md:hidden">
          {transactions.length === 0 ? <p className="px-4 py-12 text-center text-sm text-[#6681a7]">Không có giao dịch phù hợp.</p> : transactions.map((item) => {
            const meta = typeMeta[item.type];
            const Icon = meta.icon;
            const success = item.amount >= 0;
            return <Link key={item.id} href={`/dashboard/vi/giao-dich/${item.id}`} className="block min-h-16 px-4 py-3.5 transition-colors hover:bg-[#fbfdff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#1261ed]">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}><Icon className="size-4" /></span>
                  <span className="min-w-0">
                    <b className="block break-words text-sm leading-5 text-[#244a7c]">{item.note || meta.label}</b>
                    <small className="mt-0.5 block break-words text-xs leading-4 text-[#6681a7]">{txTypeLabel[item.type]}</small>
                  </span>
                </div>
                <span className={`shrink-0 whitespace-nowrap pt-1 text-sm font-bold ${success ? "text-[#168146]" : "text-[#f04438]"}`}>{success ? "+ " : "− "}{formatVnd(Math.abs(item.amount))}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-[2.875rem] text-[11px]">
                <span className="font-medium text-[#58749a]">#{item.id.slice(0, 10).toUpperCase()}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold ${success ? "bg-[#e8f8eb] text-[#168146]" : "bg-[#eaf2ff] text-[#287be5]"}`}><Check className="size-3" />{success ? "Thành công" : "Đã xử lý"}</span>
                <span className="ml-auto text-right text-[#7790b1]">{item.createdAt.toLocaleDateString("vi-VN")} · {item.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </Link>;
          })}
        </div>
        <div className="hidden md:block">
          <Table className="min-w-[720px] text-xs">
            <TableHeader className="bg-[#f8fbff] text-[#25436b]">
              <TableRow>
                <TableHead className="px-4">Mã GD</TableHead><TableHead className="px-4">Nội dung</TableHead><TableHead className="px-4">Số tiền</TableHead><TableHead className="px-4">Trạng thái</TableHead><TableHead className="px-4">Thời gian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-sm text-[#6681a7]">Không có giao dịch phù hợp.</TableCell></TableRow> : transactions.map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                const success = item.amount >= 0;
                return <TableRow key={item.id} className="text-[#49688f]">
                  <TableCell className="px-4 font-medium"><Link href={`/dashboard/vi/giao-dich/${item.id}`} className="text-[#1261ed] hover:underline">{item.id.slice(0, 10).toUpperCase()}</Link></TableCell>
                  <TableCell className="px-4"><div className="flex items-center gap-3"><span className={`flex size-8 items-center justify-center rounded-lg ${meta.tone}`}><Icon className="size-4" /></span><span><b className="block text-[#244a7c]">{item.note || meta.label}</b><small className="mt-0.5 block text-[#7790b1]">{txTypeLabel[item.type]}</small></span></div></TableCell>
                  <TableCell className={`px-4 font-bold ${success ? "text-[#168146]" : "text-[#f04438]"}`}>{success ? "+ " : "− "}{formatVnd(Math.abs(item.amount))}</TableCell>
                  <TableCell className="px-4"><span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${success ? "bg-[#e8f8eb] text-[#168146]" : "bg-[#eaf2ff] text-[#287be5]"}`}><Check className="size-3.5" />{success ? "Thành công" : "Đã xử lý"}</span></TableCell>
                  <TableCell className="px-4 leading-4">{item.createdAt.toLocaleDateString("vi-VN")}<br /><span className="text-[#7790b1]">{item.createdAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
        </div>
        <footer className="flex flex-col gap-3 border-t border-[#e8eef6] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span className="text-xs leading-5 text-[#6d87aa]">Hiển thị {firstShown} - {lastShown} trong tổng số {total} giao dịch</span>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {page > 1 ? <Link href={`/dashboard/vi${qs({ ...filterQ, page: String(page - 1) })}`} aria-label="Trang trước" className="flex size-10 items-center justify-center rounded-lg border border-[#dce6f3] hover:bg-[#f6f9fd]"><ChevronLeft className="h-4 w-4" /></Link> : <span aria-hidden className="flex size-10 items-center justify-center rounded-lg border border-[#eef3f9] text-[#c3d0e0]"><ChevronLeft className="h-4 w-4" /></span>}
            <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#eaf9df] px-2 text-xs font-bold text-[#28711a] ring-1 ring-inset ring-[#b1eb78]">{page}/{totalPages}</span>
            {page < totalPages ? <Link href={`/dashboard/vi${qs({ ...filterQ, page: String(page + 1) })}`} aria-label="Trang sau" className="flex size-10 items-center justify-center rounded-lg border border-[#dce6f3] hover:bg-[#f6f9fd]"><ChevronRight className="h-4 w-4" /></Link> : <span aria-hidden className="flex size-10 items-center justify-center rounded-lg border border-[#eef3f9] text-[#c3d0e0]"><ChevronRight className="h-4 w-4" /></span>}
          </div>
        </footer>
      </section></div>
      <aside className="min-w-0 space-y-4"><section id="rut-tien" className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f9df] text-[#35a920]"><Banknote className="h-4 w-4" /></span><h2 className="font-bold text-[#173861]">Rút tiền</h2></div><WithdrawalForm balance={user.balance} minWithdrawal={minWithdrawal} bankAccount={linkedBank ?? null} />{withdrawalsRows.filter((item) => item.status === "needs_info").map((item) => <Link key={item.id} href={`/dashboard/vi/rut-tien/${item.id}`} className="mt-4 block rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900 hover:bg-amber-100">Yêu cầu RT{item.id.slice(0, 8).toUpperCase()} cần bổ sung thông tin →</Link>)}</section><section id="tai-khoan" className="min-w-0 rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><div className="flex items-center justify-between gap-3"><h2 className="font-bold text-[#173861]">Tài khoản liên kết</h2><Link href="/dashboard/tai-khoan" className="shrink-0 text-xs font-bold text-[#1261ed]">Thay đổi</Link></div><div className="mt-4 flex min-w-0 items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf9e7] text-[#168146]"><Landmark className="h-6 w-6" /></span><div className="min-w-0 flex-1"><b className="block break-words text-sm text-[#244a7c]">{linkedBank?.bankName || "Chưa có tài khoản"}</b><p className="mt-1 text-xs text-[#6681a7]">{linkedBank ? `**** ${linkedBank.bankAccount.slice(-4)}` : "Liên kết tài khoản để rút tiền"}</p></div>{linkedBank && <span className="shrink-0 rounded-full bg-[#e8f8eb] px-2 py-1 text-[10px] font-bold text-[#168146]">Mặc định</span>}</div></section><section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><h2 className="flex items-center gap-2 font-bold text-[#173861]"><Lightbulb className="h-5 w-5 shrink-0 text-[#f3b51c]" /> Thông tin hữu ích</h2><ul className="mt-4 space-y-2 text-xs leading-5 text-[#5c78a0]"><li>✓ Số dư khả dụng có thể rút về tài khoản ngân hàng</li><li>✓ Thời gian xử lý: 1 - 2 ngày làm việc</li><li>✓ Rút tiền tối thiểu: {formatVnd(minWithdrawal)}/lần</li><li>✓ Miễn phí rút tiền</li></ul></section><section className="relative min-h-[10.6rem] overflow-hidden rounded-xl border border-[#dcefcf] bg-[#effde8] p-5"><Image src="/images/dashboard-wallet-promo-v5.webp" alt="Mua sắm để nhận hoàn tiền" fill sizes="23rem" className="object-cover object-right" /><div className="relative z-10 max-w-[9rem]"><h2 className="text-lg font-black leading-5 text-[#173861]">Càng mua sắm,<br />càng nhận thêm</h2><p className="mt-2 text-xs text-[#49688f]">Hoàn tiền thật – Rút tiền dễ dàng</p><Link href="/dashboard" className="ww-btn-cta mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold">Mua sắm ngay <ArrowUpRight className="h-3.5 w-3.5" /></Link></div></section></aside>
    </section>
  </main>;
}
