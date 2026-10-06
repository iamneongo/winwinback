import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Clock3, ShoppingBag, CircleCheck, CircleX } from "lucide-react";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { OrdersTable } from "./OrdersTable";

export const metadata = { title: "Đơn hàng — Win-Win Back" };
export const dynamic = "force-dynamic";
const PAGE_SIZE = 25;

function Metric({ icon: Icon, tone, label, value }: { icon: typeof ShoppingBag; tone: string; label: string; value: string }) { return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="mt-3 text-xs font-semibold text-[#587298]">{label}</p><p className="mt-1 text-2xl font-black text-[#102e5c]">{value}</p></article>; }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 150);
  const status = one("status");
  const platform = one("platform");
  const conditions = [];
  if (q) conditions.push(or(ilike(orders.externalOrderId, `%${q}%`), ilike(orders.productName, `%${q}%`), ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (status === "pending" || status === "confirmed" || status === "completed" || status === "cancelled") conditions.push(eq(orders.status, status));
  if (platform === "shopee" || platform === "tiktok") conditions.push(eq(orders.platform, platform));
  const where = conditions.length ? and(...conditions) : undefined;
  const [[stats], [count]] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int`, pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`, completed: sql<number>`count(*) filter (where ${orders.status} = 'completed')::int`, cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int` }).from(orders),
    db.select({ total: sql<number>`count(*)::int` }).from(orders).innerJoin(users, eq(orders.userId, users.id)).where(where),
  ]);
  const requestedPage = Number(one("trang"));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, Math.max(1, Math.ceil((count?.total ?? 0) / PAGE_SIZE)));
  const sortMap = { externalOrderId: orders.externalOrderId, productName: orders.productName, platform: orders.platform, orderAmount: orders.orderAmount, commissionAmount: orders.commissionAmount, cashbackAmount: orders.cashbackAmount, status: orders.status, createdAt: orders.createdAt };
  const sortColumn = Object.hasOwn(sortMap, one("sort")) ? sortMap[one("sort") as "externalOrderId" | "productName" | "platform" | "orderAmount" | "commissionAmount" | "cashbackAmount" | "status" | "createdAt"] : orders.createdAt;
  const rows = await db.select({ order: orders, name: users.name, email: users.email }).from(orders).innerJoin(users, eq(orders.userId, users.id)).where(where).orderBy(one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn), desc(orders.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <div className="mb-4 lg:hidden"><h1 className="text-xl font-black text-[#11345f]">Quản lý đơn hàng</h1><p className="mt-1 text-sm text-[#60799c]">Theo dõi đơn hàng và hoa hồng từ các sàn</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={ShoppingBag} tone="bg-[#e8f1ff] text-[#2877ec]" label="Tổng đơn hàng" value={String(stats?.total ?? 0)} /><Metric icon={Clock3} tone="bg-[#fff3dc] text-[#eda815]" label="Chờ xác nhận" value={String(stats?.pending ?? 0)} /><Metric icon={CircleCheck} tone="bg-[#e7f7ef] text-[#31a141]" label="Đã hoàn tất" value={String(stats?.completed ?? 0)} /><Metric icon={CircleX} tone="bg-[#feeae8] text-[#ea4b38]" label="Đã hủy" value={String(stats?.cancelled ?? 0)} /></section>
    <div className="mb-3 mt-5"><h2 className="text-base font-black text-[#12355f]">Danh sách đơn hàng</h2><p className="mt-1 text-xs text-[#6c86a8]">Cập nhật trạng thái và theo dõi số tiền hoàn của từng đơn</p></div>
    <OrdersTable rows={rows.map(({ order, name, email }) => ({ id: order.id, externalOrderId: order.externalOrderId, name, email, productName: order.productName, platform: order.platform, orderAmount: order.orderAmount, commissionAmount: order.commissionAmount, cashbackAmount: order.cashbackAmount, status: order.status, createdAt: order.createdAt.toISOString() }))} total={count?.total ?? 0} page={page} />
  </main>;
}
