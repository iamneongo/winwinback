import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Clock3, CircleCheck, Landmark, Wallet } from "lucide-react";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { WithdrawalsTable } from "./WithdrawalsTable";

export const metadata = { title: "Yêu cầu rút tiền — Win-Win Back" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

function Metric({ icon: Icon, tone, label, value }: { icon: typeof Clock3; tone: string; label: string; value: string }) { return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="mt-3 text-xs font-semibold text-[#587298]">{label}</p><p className="mt-1 text-2xl font-black text-[#102e5c]">{value}</p></article>; }

export default async function WithdrawalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 150);
  const status = one("status");
  const conditions = [];
  if (q) conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`), ilike(withdrawals.accountHolder, `%${q}%`), ilike(withdrawals.bankName, `%${q}%`)));
  if (status === "pending" || status === "approved" || status === "rejected" || status === "paid") conditions.push(eq(withdrawals.status, status));
  const where = conditions.length ? and(...conditions) : undefined;
  const [[stats], [count]] = await Promise.all([
    db.select({ pendingCount: sql<number>`count(*) filter (where ${withdrawals.status} = 'pending')::int`, pendingAmount: sql<number>`coalesce(sum(${withdrawals.amount}) filter (where ${withdrawals.status} = 'pending'), 0)::float8`, approvedAmount: sql<number>`coalesce(sum(${withdrawals.amount}) filter (where ${withdrawals.status} = 'approved'), 0)::float8`, paidAmount: sql<number>`coalesce(sum(${withdrawals.amount}) filter (where ${withdrawals.status} = 'paid'), 0)::float8` }).from(withdrawals),
    db.select({ total: sql<number>`count(*)::int` }).from(withdrawals).innerJoin(users, eq(withdrawals.userId, users.id)).where(where),
  ]);
  const requestedPage = Number(one("trang"));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, Math.max(1, Math.ceil((count?.total ?? 0) / PAGE_SIZE)));
  const sortMap = { amount: withdrawals.amount, bankName: withdrawals.bankName, status: withdrawals.status, requestedAt: withdrawals.requestedAt, processedAt: withdrawals.processedAt };
  const sortColumn = Object.hasOwn(sortMap, one("sort")) ? sortMap[one("sort") as "amount" | "bankName" | "status" | "requestedAt" | "processedAt"] : withdrawals.requestedAt;
  const rows = await db.select({ w: withdrawals, name: users.name, email: users.email }).from(withdrawals).innerJoin(users, eq(withdrawals.userId, users.id)).where(where).orderBy(one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn), desc(withdrawals.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <div className="mb-4 lg:hidden"><h1 className="text-xl font-black text-[#11345f]">Yêu cầu rút tiền</h1><p className="mt-1 text-sm text-[#60799c]">Duyệt, chi trả và từ chối yêu cầu rút tiền của người dùng</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Clock3} tone="bg-[#fff3dc] text-[#eda815]" label="Chờ xử lý" value={String(stats?.pendingCount ?? 0)} /><Metric icon={Wallet} tone="bg-[#fff1d9] text-[#e99a10]" label="Tiền chờ duyệt" value={formatVnd(stats?.pendingAmount ?? 0)} /><Metric icon={Landmark} tone="bg-[#e8f1ff] text-[#2877ec]" label="Đã duyệt, chờ chi" value={formatVnd(stats?.approvedAmount ?? 0)} /><Metric icon={CircleCheck} tone="bg-[#e7f7ef] text-[#31a141]" label="Tổng đã chi" value={formatVnd(stats?.paidAmount ?? 0)} /></section>
    <div className="mb-3 mt-5"><h2 className="text-base font-black text-[#12355f]">Danh sách yêu cầu rút tiền</h2><p className="mt-1 text-xs text-[#6c86a8]">Kiểm tra thông tin ngân hàng và xử lý từng yêu cầu</p></div>
    <WithdrawalsTable rows={rows.map(({ w, name, email }) => ({ id: w.id, name, email, amount: w.amount, bankName: w.bankName, bankAccountLast4: w.bankAccount.slice(-4), accountHolder: w.accountHolder, status: w.status, requestedAt: w.requestedAt.toISOString(), processedAt: w.processedAt?.toISOString() ?? null }))} total={count?.total ?? 0} page={page} />
  </main>;
}
