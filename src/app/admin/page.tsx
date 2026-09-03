import Image from "next/image";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, BadgeDollarSign, Clock3, Coins, Landmark, PackageCheck, ShieldAlert, Users } from "lucide-react";
import { db } from "@/db";
import { users, orders, withdrawals } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel, withdrawalStatusLabel } from "@/lib/labels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendChart, DonutChart } from "@/components/admin/charts";
import { getOrderTrend } from "@/lib/admin-metrics";

export const metadata = { title: "Tổng quan quản trị — Win-Win Back" };
export const dynamic = "force-dynamic";

const orderVariant: Record<string, "warning" | "success" | "default" | "destructive"> = { pending: "warning", confirmed: "success", completed: "default", cancelled: "destructive" };
const withdrawalVariant: Record<string, "warning" | "default" | "destructive" | "success"> = { pending: "warning", approved: "default", rejected: "destructive", paid: "success" };

function compactMoney(value: number) { return `${new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value)}đ`; }

function Metric({ icon: Icon, tint, label, value }: { icon: typeof Users; tint: string; label: string; value: string }) {
  return <article className="min-w-0 rounded-xl border border-[#e4ebf5] bg-white p-4 shadow-[0_3px_10px_rgba(34,73,120,0.035)]"><div className="flex items-center gap-3"><span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tint}`}><Icon className="size-5" strokeWidth={2.4} /></span><p className="truncate text-xs font-semibold text-[#587298]">{label}</p></div><p className="mt-4 truncate text-[25px] font-black leading-none tracking-tight text-[#0e2b59]">{value}</p></article>;
}
function SectionTitle({ children, href }: { children: React.ReactNode; href?: string }) { return <div className="flex items-center justify-between border-b border-[#edf1f7] px-4 py-3.5 sm:px-5"><h2 className="text-sm font-black text-[#11345f]">{children}</h2>{href && <Link href={href} className="flex items-center gap-1 text-[11px] font-bold text-[#2676e8] hover:underline">Xem tất cả <ArrowRight className="size-3.5" /></Link>}</div>; }

export default async function AdminPage() {
  await requireAdmin();
  const [orderRows, wdRows, userRows, trend] = await Promise.all([
    db.select({ order: orders, name: users.name, email: users.email, image: users.image }).from(orders).innerJoin(users, eq(orders.userId, users.id)).orderBy(desc(orders.createdAt)).limit(100),
    db.select({ w: withdrawals, name: users.name }).from(withdrawals).innerJoin(users, eq(withdrawals.userId, users.id)).orderBy(desc(withdrawals.requestedAt)).limit(100),
    db.select({ id: users.id, name: users.name, balance: users.balance }).from(users).orderBy(desc(users.createdAt)).limit(100),
    getOrderTrend(7),
  ]);
  const totalCashback = orderRows.reduce((total, row) => total + row.order.cashbackAmount, 0);
  const totalCommission = orderRows.reduce((total, row) => total + row.order.commissionAmount, 0);
  const pendingOrders = orderRows.filter(({ order }) => order.status === "pending");
  const pendingWithdrawals = wdRows.filter(({ w }) => w.status === "pending").length;
  const shopee = orderRows.filter(({ order }) => order.platform === "shopee").reduce((total, row) => total + row.order.cashbackAmount, 0);
  const tiktok = Math.max(0, totalCashback - shopee);
  const approvalRate = orderRows.length ? Math.round((orderRows.filter(({ order }) => order.status !== "pending" && order.status !== "cancelled").length / orderRows.length) * 100) : 0;
  const topUsers = [...userRows].sort((a, b) => b.balance - a.balance).slice(0, 5);

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5 lg:py-5">
    <div className="mb-4 flex items-center gap-2 lg:hidden"><BadgeDollarSign className="size-5 text-[#f0c328]" /><h1 className="text-lg font-black text-[#11345f]">Bảng điều khiển quản trị</h1></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Metric icon={Coins} tint="bg-[#e9f8dd] text-[#4bac22]" label="Tổng hoàn tiền tháng" value={compactMoney(totalCashback)} /><Metric icon={Clock3} tint="bg-[#fff3d9] text-[#eda919]" label="Đơn chờ duyệt" value={String(pendingOrders.length)} /><Metric icon={Users} tint="bg-[#e8f1ff] text-[#287be5]" label="Người dùng hoạt động" value={String(userRows.length)} /><Metric icon={Landmark} tint="bg-[#f2e8ff] text-[#913fdb]" label="Tổng doanh thu đối tác" value={compactMoney(totalCommission)} /><Metric icon={PackageCheck} tint="bg-[#eaf7e5] text-[#46aa2b]" label="Tỉ lệ duyệt" value={`${approvalRate}%`} /></section>
    <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,1fr)_minmax(320px,1.1fr)]"><article className="rounded-xl border border-[#e4ebf5] bg-white"><SectionTitle>Xu hướng hoàn tiền (7 ngày)</SectionTitle><div className="px-4 pb-3 sm:px-5"><div className="mt-3 flex gap-5 text-[11px] font-medium text-[#506a90]"><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#3caf3e]" />Hoàn tiền (đ)</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#2376ee]" />Số đơn hoàn</span></div><div className="mt-3"><TrendChart ariaLabel="Xu hướng hoàn tiền và số đơn hàng trong 7 ngày" labels={trend.labels} data={[trend.cashback, trend.total]} series={[{ name: "Hoàn tiền", color: "#3caf3e", fill: true, format: "vnd" }, { name: "Số đơn", color: "#2376ee", format: "int" }]} /></div></div></article><article className="rounded-xl border border-[#e4ebf5] bg-white"><SectionTitle>Phân bổ hoàn tiền theo sàn</SectionTitle><div className="p-4 sm:p-5"><DonutChart segments={[{ label: "Shopee", value: shopee, color: "#ff633b" }, { label: "TikTok Shop", value: tiktok, color: "#111827" }]} format="compact" /></div></article><article className="rounded-xl border border-[#e4ebf5] bg-white"><SectionTitle href="/admin/rut-tien">Yêu cầu rút tiền gần đây</SectionTitle><div className="px-3 pb-2"><Table className="min-w-[290px] text-[11px]"><TableHeader className="text-[#7890b0]"><TableRow className="hover:bg-transparent"><TableHead className="py-2 font-semibold">Người dùng</TableHead><TableHead className="py-2 font-semibold">Số tiền</TableHead><TableHead className="py-2 font-semibold">Trạng thái</TableHead></TableRow></TableHeader><TableBody className="text-[#426087]">{wdRows.slice(0, 5).map(({ w, name }) => <TableRow key={w.id}><TableCell className="py-2 font-medium">{name}</TableCell><TableCell className="py-2 font-bold text-[#29476f]">{formatVnd(w.amount)}</TableCell><TableCell className="py-2"><Badge variant={withdrawalVariant[w.status]}>{withdrawalStatusLabel[w.status]}</Badge></TableCell></TableRow>)}</TableBody></Table>{wdRows.length === 0 && <p className="py-6 text-center text-xs text-[#7890b0]">Chưa có yêu cầu rút tiền.</p>}</div></article></section>
    <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,2.25fr)_minmax(315px,1fr)]"><article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white"><SectionTitle href="/admin/don-hang?status=pending">Danh sách đơn hoàn tiền chờ xử lý <span className="ml-1 text-xs font-semibold text-[#7d93b0]">({pendingOrders.length})</span></SectionTitle><Table className="min-w-[820px] text-[11px]"><TableHeader className="bg-[#f7faff] text-[#587298]"><TableRow className="hover:bg-transparent"><TableHead className="px-4 py-3 font-bold">Mã đơn</TableHead><TableHead className="py-3 font-bold">Người dùng</TableHead><TableHead className="py-3 font-bold">Sàn</TableHead><TableHead className="py-3 font-bold">Giá trị đơn</TableHead><TableHead className="py-3 font-bold">Hoàn tiền</TableHead><TableHead className="py-3 font-bold">Trạng thái</TableHead><TableHead className="py-3 font-bold">Hành động</TableHead></TableRow></TableHeader><TableBody className="text-[#49688f]">{pendingOrders.slice(0, 8).map(({ order, name, email, image }) => <TableRow key={order.id}><TableCell className="px-4 py-2.5 font-bold text-[#375881]">{order.externalOrderId}</TableCell><TableCell className="py-2.5"><span className="flex items-center gap-2"><span className="grid size-6 place-items-center overflow-hidden rounded-full bg-[#e5effe] text-[10px] font-black text-[#3676cb]">{image ? <Image src={image} alt="" width={24} height={24} className="size-full object-cover" /> : name.charAt(0)}</span><span><b className="block text-[#2f4f78]">{name}</b><small className="text-[#8aa0bd]">{email}</small></span></span></TableCell><TableCell className="py-2.5 font-semibold">{platformLabel[order.platform]}</TableCell><TableCell className="py-2.5 font-semibold">{formatVnd(order.orderAmount)}</TableCell><TableCell className="py-2.5 font-black text-[#168146]">{formatVnd(order.cashbackAmount)}</TableCell><TableCell className="py-2.5"><Badge variant={orderVariant[order.status]}>{orderStatusLabel[order.status]}</Badge></TableCell><TableCell className="py-2.5"><OrderStatusControl orderId={order.id} status={order.status} /></TableCell></TableRow>)}</TableBody></Table>{pendingOrders.length === 0 && <p className="py-10 text-center text-sm text-[#7890b0]">Không có đơn hàng cần xử lý.</p>}<footer className="border-t border-[#edf1f7] px-4 py-3 text-[11px] text-[#7890b0]">Hiển thị {Math.min(pendingOrders.length, 8)} trên tổng số {pendingOrders.length} đơn</footer></article><aside className="space-y-3"><article className="rounded-xl border border-[#e4ebf5] bg-white"><SectionTitle>Cần xử lý</SectionTitle><div className="divide-y divide-[#edf1f7] px-4">{[{ icon: ShieldAlert, tone: "bg-[#fff0ec] text-[#f04d35]", title: "Đơn hoàn tiền chờ duyệt", text: `${pendingOrders.length} đơn cần kiểm tra`, href: "/admin/yeu-cau-hoan-tien?status=pending" }, { icon: Landmark, tone: "bg-[#fff5df] text-[#f1a517]", title: "Yêu cầu rút tiền chờ xử lý", text: `${pendingWithdrawals} yêu cầu cần duyệt`, href: "/admin/rut-tien?status=pending" }].map(({ icon: Icon, tone, title, text, href }) => <Link className="flex gap-3 py-3" key={title} href={href}><span className={`grid size-8 shrink-0 place-items-center rounded-full ${tone}`}><Icon className="size-4" /></span><p className="min-w-0 text-[11px]"><b className="block text-[#315077]">{title}</b><span className="text-[#879bb5]">{text}</span></p></Link>)}</div></article><article className="rounded-xl border border-[#e4ebf5] bg-white"><SectionTitle href="/admin/nguoi-dung">Top người dùng nhận hoàn tiền</SectionTitle><ol className="px-4 py-2">{topUsers.map((user, index) => <li key={user.id} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 border-b border-[#edf1f7] py-2 last:border-0 text-[11px]"><span className={`grid size-5 place-items-center rounded-full font-black ${index === 0 ? "bg-[#fff0c6] text-[#d99a00]" : "bg-[#edf2f8] text-[#7188a6]"}`}>{index + 1}</span><span className="font-semibold text-[#3e5b82]">{user.name}</span><span className="font-bold text-[#4a6990]">{formatVnd(user.balance)}</span></li>)}</ol>{topUsers.length === 0 && <p className="py-8 text-center text-xs text-[#7890b0]">Chưa có dữ liệu người dùng.</p>}</article></aside></section>
  </main>;
}
