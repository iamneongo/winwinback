import Image from "next/image";
import Link from "next/link";
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  BadgeDollarSign,
  CheckCircle2,
  CircleX,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { OrderDecisionControls } from "@/components/admin/OrderDecisionControls";
import { Badge } from "@/components/ui/badge";
import { TrendChart, DonutChart } from "@/components/admin/charts";
import { getOrderTrend } from "@/lib/admin-metrics";
import { CashbackTable } from "./CashbackTable";

export const metadata = { title: "Yêu cầu hoàn tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

const statusVariant: Record<string, "warning" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "destructive",
};

function Metric({ icon: Icon, tone, label, value }: { icon: typeof Clock3; tone: string; label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#e4ebf5] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span>
        <p className="text-xs font-semibold text-[#587298]">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-[#102d5b]">{value}</p>
    </article>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-[#edf1f7] px-5 py-3.5 text-sm font-black text-[#12355f]">{children}</h2>;
}

export default async function CashbackRequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 150);
  const status = one("status");
  const platform = one("platform");

  const conditions = [];
  if (q) conditions.push(or(ilike(orders.externalOrderId, `%${q}%`), ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (status === "pending" || status === "confirmed" || status === "completed" || status === "cancelled") conditions.push(eq(orders.status, status));
  if (platform === "shopee" || platform === "tiktok") conditions.push(eq(orders.platform, platform));
  const where = conditions.length ? and(...conditions) : undefined;

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      approved: sql<number>`count(*) filter (where ${orders.status} in ('confirmed', 'completed'))::int`,
      rejected: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
      processing: sql<number>`coalesce(sum(${orders.cashbackAmount}) filter (where ${orders.status} = 'pending'), 0)::float8`,
    })
    .from(orders);

  const [count] = await db.select({ total: sql<number>`count(*)::int` }).from(orders).innerJoin(users, eq(orders.userId, users.id)).where(where);
  const requestedPage = Number(one("trang"));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, Math.max(1, Math.ceil((count?.total ?? 0) / 20)));
  const sortMap = { externalOrderId: orders.externalOrderId, platform: orders.platform, orderAmount: orders.orderAmount, cashbackAmount: orders.cashbackAmount, status: orders.status, createdAt: orders.createdAt };
  const sortColumn = Object.hasOwn(sortMap, one("sort")) ? sortMap[one("sort") as "externalOrderId" | "platform" | "orderAmount" | "cashbackAmount" | "status" | "createdAt"] : orders.createdAt;
  const rows = await db
    .select({ order: orders, name: users.name, email: users.email, image: users.image })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(where)
    .orderBy(one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn), desc(orders.id))
    .limit(20)
    .offset((page - 1) * 20);

  const selectedRow = await db
    .select({ order: orders, name: users.name, email: users.email, image: users.image })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(sql`case when ${orders.status} = 'pending' then 0 else 1 end`, desc(orders.createdAt))
    .limit(1);
  const selected = selectedRow[0];
  const trend = await getOrderTrend(7);

  const total = stats.total || 1;
  const approvalRate = Math.round((stats.approved / total) * 100);

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
      <header className="mb-4 flex items-center gap-3 lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-[#e8f8dc] text-[#53ad20]"><BadgeDollarSign className="size-5" /></span>
        <h1 className="text-xl font-black text-[#11345f]">Quản lý yêu cầu hoàn tiền</h1>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={Clock3} tone="bg-[#fff2d4] text-[#e9a414]" label="Yêu cầu chờ duyệt" value={String(stats.pending)} />
        <Metric icon={CheckCircle2} tone="bg-[#e5f7e5] text-[#35a948]" label="Đã duyệt" value={String(stats.approved)} />
        <Metric icon={CircleX} tone="bg-[#feeae8] text-[#ed4832]" label="Đã từ chối" value={String(stats.rejected)} />
        <Metric icon={BadgeDollarSign} tone="bg-[#e8f0ff] text-[#2878eb]" label="Tổng tiền hoàn đang xử lý" value={formatVnd(stats.processing)} />
        <Metric icon={TrendingUp} tone="bg-[#f2e6ff] text-[#9c3bd9]" label="Tỷ lệ duyệt" value={`${approvalRate}%`} />
        <article className="relative hidden min-h-[120px] overflow-hidden rounded-xl bg-[#062a51] p-4 xl:block">
          <Image src="/images/dashboard-overview-mascot-banner-v5.png" alt="" fill sizes="18rem" className="object-cover object-[76%_35%] opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#062a51] via-[#062a51]/90 to-transparent" />
          <div className="relative z-10"><p className="max-w-[10rem] text-base font-black text-[#c9f463]">Kiểm duyệt yêu cầu nhanh chóng</p><p className="mt-2 text-[10px] font-medium text-white/80">Bảo vệ hệ thống – Tối ưu chi phí</p></div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)_minmax(330px,1fr)]">
        <article className="rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Xu hướng yêu cầu hoàn tiền 7 ngày qua</PanelTitle><div className="px-5 pt-3 text-[11px] text-[#587298]"><span className="mr-5 inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#36a944]" />Tổng yêu cầu</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#1676ef]" />Đã duyệt</span></div><div className="px-3 pb-3 pt-2"><TrendChart ariaLabel="Xu hướng yêu cầu hoàn tiền 7 ngày qua" labels={trend.labels} data={[trend.total, trend.approved]} series={[{ name: "Tổng yêu cầu", color: "#36a944", fill: true, format: "int" }, { name: "Đã duyệt", color: "#1676ef", format: "int" }]} /></div></article>
        <article className="rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Tỷ lệ xử lý</PanelTitle><div className="p-5"><DonutChart size={144} centerTitle="Tổng" format="int" segments={[{ label: "Chờ duyệt", value: stats.pending, color: "#f7bc1a" }, { label: "Đã duyệt", value: stats.approved, color: "#3cad49" }, { label: "Từ chối", value: stats.rejected, color: "#f1503d" }]} /></div></article>
        {selected && <aside className="row-span-2 rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Chi tiết yêu cầu đang chọn</PanelTitle><div className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center overflow-hidden rounded-full bg-[#e8f1ff] font-black text-[#3676cb]">{selected.image ? <Image src={selected.image} alt="" width={40} height={40} className="size-full object-cover" /> : selected.name.charAt(0)}</span><div><b className="text-sm text-[#18375f]">{selected.name}</b><p className="text-[10px] text-[#7188a6]">{selected.email}</p></div><Badge className="ml-auto" variant={statusVariant[selected.order.status]}>{orderStatusLabel[selected.order.status]}</Badge></div><dl className="mt-5 space-y-2 text-[11px]"><div className="flex justify-between"><dt className="text-[#7188a6]">Mã yêu cầu</dt><dd className="font-bold text-[#35557e]">YC{selected.order.externalOrderId}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Mã đơn hàng</dt><dd className="font-bold text-[#35557e]">{selected.order.externalOrderId}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Thời gian mua</dt><dd className="font-bold text-[#35557e]">{selected.order.orderedAt.toLocaleDateString("vi-VN")}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Giá trị đơn hàng</dt><dd className="font-bold text-[#35557e]">{formatVnd(selected.order.orderAmount)}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Số tiền hoàn</dt><dd className="font-black text-[#168146]">{formatVnd(selected.order.cashbackAmount)}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Sàn</dt><dd className="font-bold text-[#35557e]">{platformLabel[selected.order.platform]}</dd></div></dl><div className="mt-5 flex items-center gap-2"><Link href={`/admin/yeu-cau-hoan-tien/${selected.order.id}`} className="inline-flex h-8 items-center rounded-md border border-[#dbe6f3] px-3 text-[11px] font-bold text-[#466184] hover:bg-[#f1f6fc]">Xem chi tiết</Link>{selected.order.status === "pending" && <OrderDecisionControls orderId={selected.order.id} />}</div></div></aside>}
        <div className="min-w-0 xl:col-span-2">
          <div className="mb-3"><h2 className="text-sm font-black text-[#12355f]">Danh sách yêu cầu hoàn tiền</h2></div>
          <CashbackTable rows={rows.map(({ order, name, email }) => ({ id: order.id, externalOrderId: order.externalOrderId, name, email, platform: order.platform, orderAmount: order.orderAmount, cashbackAmount: order.cashbackAmount, status: order.status, createdAt: order.createdAt.toISOString() }))} total={count?.total ?? 0} page={page} />
        </div>
      </section>
    </main>
  );
}
