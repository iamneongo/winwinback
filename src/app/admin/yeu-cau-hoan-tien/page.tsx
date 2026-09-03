import Image from "next/image";
import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { OrderDecisionControls } from "@/components/admin/OrderDecisionControls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { TrendChart, DonutChart } from "@/components/admin/charts";
import { getOrderTrend } from "@/lib/admin-metrics";
import { cn } from "@/lib/utils";

export const metadata = { title: "Yêu cầu hoàn tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

const statusVariant: Record<string, "warning" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "destructive",
};

function Metric({ icon: Icon, tone, label, value, change }: { icon: typeof Clock3; tone: string; label: string; value: string; change: string }) {
  return (
    <article className="rounded-xl border border-[#e4ebf5] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span>
        <p className="text-xs font-semibold text-[#587298]">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-[#102d5b]">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-[#8298b6]"><TrendingUp className="size-3 text-[#2ba044]" /><b className="text-[#2ba044]">{change}</b> so với hôm qua</p>
    </article>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-[#edf1f7] px-5 py-3.5 text-sm font-black text-[#12355f]">{children}</h2>;
}

const tabs = [
  { label: "Tất cả", value: undefined as string | undefined },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "confirmed" },
  { label: "Từ chối", value: "cancelled" },
];

export default async function CashbackRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q, status } = await searchParams;

  const conditions = [];
  if (q) conditions.push(or(ilike(orders.externalOrderId, `%${q}%`), ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (status === "pending" || status === "confirmed" || status === "completed" || status === "cancelled") conditions.push(eq(orders.status, status));
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

  const rows = await db
    .select({ order: orders, name: users.name, email: users.email, image: users.image })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(20);

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
    <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
      <header className="mb-4 flex items-center gap-3 lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-[#e8f8dc] text-[#53ad20]"><BadgeDollarSign className="size-5" /></span>
        <h1 className="text-xl font-black text-[#11345f]">Quản lý yêu cầu hoàn tiền</h1>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={Clock3} tone="bg-[#fff2d4] text-[#e9a414]" label="Yêu cầu chờ duyệt" value={String(stats.pending)} change="12,4%" />
        <Metric icon={CheckCircle2} tone="bg-[#e5f7e5] text-[#35a948]" label="Đã duyệt" value={String(stats.approved)} change="8,7%" />
        <Metric icon={CircleX} tone="bg-[#feeae8] text-[#ed4832]" label="Đã từ chối" value={String(stats.rejected)} change="5,3%" />
        <Metric icon={BadgeDollarSign} tone="bg-[#e8f0ff] text-[#2878eb]" label="Tổng tiền hoàn đang xử lý" value={formatVnd(stats.processing)} change="15,2%" />
        <Metric icon={TrendingUp} tone="bg-[#f2e6ff] text-[#9c3bd9]" label="Tỷ lệ duyệt" value={`${approvalRate}%`} change="3,6%" />
        <article className="relative hidden min-h-[120px] overflow-hidden rounded-xl bg-[#062a51] p-4 xl:block">
          <Image src="/images/dashboard-overview-mascot-banner-v5.png" alt="" fill sizes="18rem" className="object-cover object-[76%_35%] opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#062a51] via-[#062a51]/90 to-transparent" />
          <div className="relative z-10"><p className="max-w-[10rem] text-base font-black text-[#c9f463]">Kiểm duyệt yêu cầu nhanh chóng</p><p className="mt-2 text-[10px] font-medium text-white/80">Bảo vệ hệ thống – Tối ưu chi phí</p></div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)_minmax(330px,1fr)]">
        <article className="rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Xu hướng yêu cầu hoàn tiền 7 ngày qua</PanelTitle><div className="px-5 pt-3 text-[11px] text-[#587298]"><span className="mr-5 inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#36a944]" />Tổng yêu cầu</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#1676ef]" />Đã duyệt</span></div><div className="px-3 pb-3 pt-2"><TrendChart ariaLabel="Xu hướng yêu cầu hoàn tiền 7 ngày qua" labels={trend.labels} data={[trend.total, trend.approved]} series={[{ name: "Tổng yêu cầu", color: "#36a944", fill: true, format: "int" }, { name: "Đã duyệt", color: "#1676ef", format: "int" }]} /></div></article>
        <article className="rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Tỷ lệ xử lý</PanelTitle><div className="p-5"><DonutChart size={144} centerTitle="Tổng" format="int" segments={[{ label: "Chờ duyệt", value: stats.pending, color: "#f7bc1a" }, { label: "Đã duyệt", value: stats.approved, color: "#3cad49" }, { label: "Từ chối", value: stats.rejected, color: "#f1503d" }]} /></div></article>
        {selected && <aside className="row-span-2 rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Chi tiết yêu cầu đang chọn</PanelTitle><div className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center overflow-hidden rounded-full bg-[#e8f1ff] font-black text-[#3676cb]">{selected.image ? <Image src={selected.image} alt="" width={40} height={40} className="size-full object-cover" /> : selected.name.charAt(0)}</span><div><b className="text-sm text-[#18375f]">{selected.name}</b><p className="text-[10px] text-[#7188a6]">{selected.email}</p></div><Badge className="ml-auto" variant={statusVariant[selected.order.status]}>{orderStatusLabel[selected.order.status]}</Badge></div><dl className="mt-5 space-y-2 text-[11px]"><div className="flex justify-between"><dt className="text-[#7188a6]">Mã yêu cầu</dt><dd className="font-bold text-[#35557e]">YC{selected.order.externalOrderId}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Mã đơn hàng</dt><dd className="font-bold text-[#35557e]">{selected.order.externalOrderId}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Thời gian mua</dt><dd className="font-bold text-[#35557e]">{selected.order.orderedAt.toLocaleDateString("vi-VN")}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Giá trị đơn hàng</dt><dd className="font-bold text-[#35557e]">{formatVnd(selected.order.orderAmount)}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Số tiền hoàn</dt><dd className="font-black text-[#168146]">{formatVnd(selected.order.cashbackAmount)}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Sàn</dt><dd className="font-bold text-[#35557e]">{platformLabel[selected.order.platform]}</dd></div></dl><div className="mt-5 flex items-center gap-2"><Link href={`/admin/yeu-cau-hoan-tien/${selected.order.id}`} className="inline-flex h-8 items-center rounded-md border border-[#dbe6f3] px-3 text-[11px] font-bold text-[#466184] hover:bg-[#f1f6fc]">Xem chi tiết</Link>{selected.order.status === "pending" && <OrderDecisionControls orderId={selected.order.id} />}</div></div><div className="border-t border-[#edf1f7] p-5"><h3 className="text-xs font-black text-[#1b3b65]">Cảnh báo / kiểm tra</h3>{["Tài khoản có nhiều yêu cầu hoàn trong 7 ngày", "Số tiền hoàn cao bất thường", "Nguy cơ trùng đơn hàng"].map((item, index) => <Link href={`/admin/yeu-cau-hoan-tien/${selected.order.id}`} className="mt-3 flex w-full items-center gap-2 text-left text-[11px] text-[#526d92] hover:text-[#2576e9]" key={item}>{index === 0 ? <AlertTriangle className="size-4 text-[#f04e43]" /> : <ShieldAlert className="size-4 text-[#eead15]" />}<span className="flex-1">{item}</span><ChevronRight className="size-4" /></Link>)}</div></aside>}
        <article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white xl:col-span-2"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f7] px-4 py-3"><div className="flex items-center gap-2 text-[11px] font-bold">{tabs.map((tab) => { const active = (tab.value ?? "") === (status ?? ""); return <Link key={tab.label} href={tab.value ? `/admin/yeu-cau-hoan-tien?status=${tab.value}` : "/admin/yeu-cau-hoan-tien"} className={cn("rounded-md px-3 py-2", active ? "bg-[#35a647] text-white" : "bg-[#f5f8fc] text-[#607a9d] hover:bg-[#eaf1f9]")}>{tab.label}</Link>; })}</div><AdminFilters searchPlaceholder="Tìm yêu cầu..." /></div><PanelTitle>Danh sách yêu cầu hoàn tiền</PanelTitle>
          <Table className="min-w-[920px] text-[11px]">
            <TableHeader className="bg-[#f7faff] text-[#587298]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3">Mã YC</TableHead>
                <TableHead className="py-3">Người dùng</TableHead>
                <TableHead className="py-3">Sàn</TableHead>
                <TableHead className="py-3">Mã đơn</TableHead>
                <TableHead className="py-3">Giá trị đơn</TableHead>
                <TableHead className="py-3">Hoàn tiền</TableHead>
                <TableHead className="py-3">Trạng thái</TableHead>
                <TableHead className="py-3">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[#49688f]">
              {rows.map(({ order, name, email, image }) => <TableRow key={order.id}>
                <TableCell className="px-4 py-2.5 font-bold text-[#385a83]">YC{order.externalOrderId}</TableCell>
                <TableCell className="py-2.5"><span className="flex items-center gap-2"><span className="grid size-6 place-items-center overflow-hidden rounded-full bg-[#e5effe] font-black text-[#3676cb]">{image ? <Image src={image} alt="" width={24} height={24} className="size-full object-cover" /> : name.charAt(0)}</span><span><b className="block text-[#2f4f78]">{name}</b><small className="text-[#8aa0bd]">{email}</small></span></span></TableCell>
                <TableCell className="py-2.5 font-semibold">{platformLabel[order.platform]}</TableCell>
                <TableCell className="py-2.5">{order.externalOrderId}</TableCell>
                <TableCell className="py-2.5 font-semibold">{formatVnd(order.orderAmount)}</TableCell>
                <TableCell className="py-2.5 font-black text-[#168146]">{formatVnd(order.cashbackAmount)}</TableCell>
                <TableCell className="py-2.5"><Badge variant={statusVariant[order.status]}>{orderStatusLabel[order.status]}</Badge></TableCell>
                <TableCell className="py-2.5">{order.status === "pending" ? <OrderDecisionControls orderId={order.id} /> : <span className="text-[#8ba0bb]">Đã xử lý</span>}</TableCell>
              </TableRow>)}
            </TableBody>
          </Table>
          {rows.length === 0 && <p className="py-12 text-center text-sm text-[#7890b0]">Không tìm thấy yêu cầu phù hợp.</p>}
          <footer className="border-t border-[#edf1f7] px-4 py-3 text-[11px] text-[#7890b0]">Hiển thị {rows.length} yêu cầu {q || status ? "(đã lọc)" : "gần nhất"}</footer>
        </article>
      </section>
    </main>
  );
}
