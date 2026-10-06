import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { UsersRound, UserCheck, ShieldCheck, WalletCards } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { UsersTable } from "./UsersTable";

export const metadata = { title: "Quản lý người dùng — Win-Win Back" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

function Metric({ icon: Icon, tone, label, value }: { icon: typeof UsersRound; tone: string; label: string; value: string }) { return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="mt-3 text-xs font-semibold text-[#587298]">{label}</p><p className="mt-1 text-2xl font-black text-[#102e5c]">{value}</p></article>; }

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 150);
  const role = one("role");
  const conditions = [];
  if (q) conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (role === "user" || role === "admin") conditions.push(eq(users.role, role));
  const where = conditions.length ? and(...conditions) : undefined;

  const [[stats], [count]] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int`, verified: sql<number>`count(*) filter (where ${users.emailVerified})::int`, admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`, totalBalance: sql<number>`coalesce(sum(${users.balance}), 0)::float8` }).from(users),
    db.select({ total: sql<number>`count(*)::int` }).from(users).where(where),
  ]);
  const requestedPage = Number(one("trang"));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, Math.max(1, Math.ceil((count?.total ?? 0) / PAGE_SIZE)));
  const sortMap = { name: users.name, email: users.email, role: users.role, balance: users.balance, createdAt: users.createdAt };
  const sortColumn = Object.hasOwn(sortMap, one("sort")) ? sortMap[one("sort") as "name" | "email" | "role" | "balance" | "createdAt"] : users.createdAt;
  const order = one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn);
  const rows = await db.select().from(users).where(where).orderBy(order, desc(users.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <div className="mb-4 lg:hidden"><h1 className="text-xl font-black text-[#11345f]">Quản lý người dùng</h1><p className="mt-1 text-sm text-[#60799c]">Theo dõi tài khoản và số dư ví hoàn tiền</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={UsersRound} tone="bg-[#e8f1ff] text-[#2877ec]" label="Tổng người dùng" value={String(stats?.total ?? 0)} /><Metric icon={UserCheck} tone="bg-[#e7f7ef] text-[#31a141]" label="Đã xác thực email" value={String(stats?.verified ?? 0)} /><Metric icon={ShieldCheck} tone="bg-[#f2e8ff] text-[#913fdb]" label="Tài khoản quản trị" value={String(stats?.admins ?? 0)} /><Metric icon={WalletCards} tone="bg-[#e9f8de] text-[#4fac24]" label="Tổng số dư ví" value={formatVnd(stats?.totalBalance ?? 0)} /></section>
    <div className="mb-3 mt-5"><h2 className="text-base font-black text-[#12355f]">Danh sách người dùng</h2><p className="mt-1 text-xs text-[#6c86a8]">Thông tin tài khoản, xác thực và số dư ví</p></div>
    <UsersTable rows={rows.map((user) => ({ id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, emailVerified: user.emailVerified, balance: user.balance, notifyOrders: user.notifyOrders, notifyCashback: user.notifyCashback, createdAt: user.createdAt.toISOString() }))} total={count?.total ?? 0} page={page} />
  </main>;
}
