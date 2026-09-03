import Image from "next/image";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Clock3, ShoppingBag, CircleCheck, CircleX } from "lucide-react";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AdminFilters } from "@/components/admin/AdminFilters";

export const metadata = { title: "Đơn hàng — Win-Win Back" };
export const dynamic = "force-dynamic";

const statusVariant: Record<string, "warning" | "default" | "success" | "destructive"> = { pending: "warning", confirmed: "default", completed: "success", cancelled: "destructive" };

function Metric({ icon: Icon, tone, label, value }: { icon: typeof ShoppingBag; tone: string; label: string; value: string }) {
  return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="mt-3 text-xs font-semibold text-[#587298]">{label}</p><p className="mt-1 text-2xl font-black text-[#102e5c]">{value}</p></article>;
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; platform?: string }> }) {
  await requireAdmin();
  const { q, status, platform } = await searchParams;

  const conditions = [];
  if (q) conditions.push(or(ilike(orders.externalOrderId, `%${q}%`), ilike(orders.productName, `%${q}%`), ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (status === "pending" || status === "confirmed" || status === "completed" || status === "cancelled") conditions.push(eq(orders.status, status));
  if (platform === "shopee" || platform === "tiktok") conditions.push(eq(orders.platform, platform));
  const where = conditions.length ? and(...conditions) : undefined;

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
      completed: sql<number>`count(*) filter (where ${orders.status} = 'completed')::int`,
      cancelled: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
    })
    .from(orders);

  const rows = await db.select({ order: orders, name: users.name, email: users.email, image: users.image }).from(orders).innerJoin(users, eq(orders.userId, users.id)).where(where).orderBy(desc(orders.createdAt)).limit(100);

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <div className="mb-4 lg:hidden"><h1 className="text-xl font-black text-[#11345f]">Quản lý đơn hàng</h1><p className="mt-1 text-sm text-[#60799c]">Theo dõi đơn hàng và hoa hồng từ các sàn</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={ShoppingBag} tone="bg-[#e8f1ff] text-[#2877ec]" label="Tổng đơn hàng" value={String(stats.total)} /><Metric icon={Clock3} tone="bg-[#fff3dc] text-[#eda815]" label="Chờ xác nhận" value={String(stats.pending)} /><Metric icon={CircleCheck} tone="bg-[#e7f7ef] text-[#31a141]" label="Đã hoàn tất" value={String(stats.completed)} /><Metric icon={CircleX} tone="bg-[#feeae8] text-[#ea4b38]" label="Đã huỷ" value={String(stats.cancelled)} /></section>
    <Card className="mt-3 overflow-hidden">
      <CardHeader>
        <div><h2 className="text-base font-black text-[#12355f]">Danh sách đơn hàng</h2><p className="mt-1 text-xs text-[#6c86a8]">Cập nhật trạng thái và theo dõi số tiền hoàn của từng đơn</p></div>
        <AdminFilters searchPlaceholder="Tìm mã đơn, người dùng..." filters={[
          { name: "status", placeholder: "Tất cả trạng thái", options: [{ value: "pending", label: "Chờ duyệt" }, { value: "confirmed", label: "Đã xác nhận" }, { value: "completed", label: "Hoàn tất" }, { value: "cancelled", label: "Đã huỷ" }] },
          { name: "platform", placeholder: "Tất cả sàn", options: [{ value: "shopee", label: "Shopee" }, { value: "tiktok", label: "TikTok Shop" }] },
        ]} />
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[1040px] text-[11px]">
          <TableHeader className="bg-[#f7faff] text-[#587298]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-3">Mã đơn</TableHead>
              <TableHead className="py-3">Người dùng</TableHead>
              <TableHead className="py-3">Sản phẩm</TableHead>
              <TableHead className="py-3">Sàn</TableHead>
              <TableHead className="py-3">Giá trị đơn</TableHead>
              <TableHead className="py-3">Hoa hồng</TableHead>
              <TableHead className="py-3">Hoàn tiền</TableHead>
              <TableHead className="py-3">Trạng thái</TableHead>
              <TableHead className="py-3">Cập nhật</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[#49688f]">
            {rows.map(({ order, name, email, image }) => <TableRow key={order.id}>
              <TableCell className="px-5 py-3 font-bold text-[#365780]">{order.externalOrderId}</TableCell>
              <TableCell className="py-3"><span className="flex items-center gap-2"><span className="grid size-7 place-items-center overflow-hidden rounded-full bg-[#e5effe] font-black text-[#3676cb]">{image ? <Image src={image} alt="" width={28} height={28} className="size-full object-cover" /> : name.charAt(0)}</span><span><b className="block text-[#2f4f78]">{name}</b><small className="text-[#8aa0bd]">{email}</small></span></span></TableCell>
              <TableCell className="max-w-44 truncate font-medium text-[#405e84]">{order.productName}</TableCell>
              <TableCell className="py-3 font-semibold">{platformLabel[order.platform]}</TableCell>
              <TableCell className="py-3 font-semibold">{formatVnd(order.orderAmount)}</TableCell>
              <TableCell className="py-3">{formatVnd(order.commissionAmount)}</TableCell>
              <TableCell className="py-3 font-black text-[#168146]">{formatVnd(order.cashbackAmount)}</TableCell>
              <TableCell className="py-3"><Badge variant={statusVariant[order.status]}>{orderStatusLabel[order.status]}</Badge></TableCell>
              <TableCell className="py-3"><OrderStatusControl orderId={order.id} status={order.status} /></TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="py-14 text-center text-sm text-[#7890b0]">Không tìm thấy đơn hàng phù hợp.</p>}
      </CardContent>
      <CardFooter>Hiển thị {rows.length} đơn hàng {q || status || platform ? "(đã lọc)" : "gần nhất"}</CardFooter>
    </Card>
  </main>;
}
