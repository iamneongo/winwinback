import Image from "next/image";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { UsersRound, UserCheck, ShieldCheck, WalletCards, Mail, CalendarDays } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
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
import { UserRowActions } from "@/components/admin/UserRowActions";

export const metadata = { title: "Quản lý người dùng — Win-Win Back" };
export const dynamic = "force-dynamic";

function Metric({ icon: Icon, tone, label, value }: { icon: typeof UsersRound; tone: string; label: string; value: string }) { return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="mt-3 text-xs font-semibold text-[#587298]">{label}</p><p className="mt-1 text-2xl font-black text-[#102e5c]">{value}</p></article>; }

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  await requireAdmin();
  const { q, role } = await searchParams;

  const conditions = [];
  if (q) conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)));
  if (role === "user" || role === "admin") conditions.push(eq(users.role, role));
  const where = conditions.length ? and(...conditions) : undefined;

  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      verified: sql<number>`count(*) filter (where ${users.emailVerified})::int`,
      admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
      totalBalance: sql<number>`coalesce(sum(${users.balance}), 0)::float8`,
    })
    .from(users);

  const rows = await db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(100);

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <div className="mb-4 lg:hidden"><h1 className="text-xl font-black text-[#11345f]">Quản lý người dùng</h1><p className="mt-1 text-sm text-[#60799c]">Theo dõi tài khoản và số dư ví hoàn tiền</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={UsersRound} tone="bg-[#e8f1ff] text-[#2877ec]" label="Tổng người dùng" value={String(stats.total)} /><Metric icon={UserCheck} tone="bg-[#e7f7ef] text-[#31a141]" label="Đã xác thực email" value={String(stats.verified)} /><Metric icon={ShieldCheck} tone="bg-[#f2e8ff] text-[#913fdb]" label="Tài khoản quản trị" value={String(stats.admins)} /><Metric icon={WalletCards} tone="bg-[#e9f8de] text-[#4fac24]" label="Tổng số dư ví" value={formatVnd(stats.totalBalance)} /></section>
    <Card className="mt-3 overflow-hidden">
      <CardHeader>
        <div><h2 className="text-base font-black text-[#12355f]">Danh sách người dùng</h2><p className="mt-1 text-xs text-[#6c86a8]">Thông tin tài khoản, xác thực và số dư ví</p></div>
        <AdminFilters searchPlaceholder="Tìm tên hoặc email..." filters={[{ name: "role", placeholder: "Tất cả vai trò", options: [{ value: "admin", label: "Quản trị" }, { value: "user", label: "Người dùng" }] }]} />
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[1010px] text-[11px]">
          <TableHeader className="bg-[#f7faff] text-[#587298]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-3">Người dùng</TableHead>
              <TableHead className="py-3">Email</TableHead>
              <TableHead className="py-3">Vai trò</TableHead>
              <TableHead className="py-3">Xác thực</TableHead>
              <TableHead className="py-3">Số dư ví</TableHead>
              <TableHead className="py-3">Thông báo</TableHead>
              <TableHead className="py-3">Ngày tham gia</TableHead>
              <TableHead className="py-3 text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[#49688f]">
            {rows.map((user) => <TableRow key={user.id}>
              <TableCell className="px-5 py-3"><span className="flex items-center gap-2"><span className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#e5effe] font-black text-[#3676cb]">{user.image ? <Image src={user.image} alt="" width={32} height={32} className="size-full object-cover" /> : user.name.charAt(0)}</span><b className="text-[#2f4f78]">{user.name}</b></span></TableCell>
              <TableCell className="py-3"><span className="flex items-center gap-1.5"><Mail className="size-3.5 text-[#8298b6]" />{user.email}</span></TableCell>
              <TableCell className="py-3"><Badge variant={user.role === "admin" ? "info" : "default"}>{user.role === "admin" ? "Quản trị" : "Người dùng"}</Badge></TableCell>
              <TableCell className="py-3"><Badge variant={user.emailVerified ? "success" : "warning"}>{user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}</Badge></TableCell>
              <TableCell className="py-3 font-black text-[#168146]">{formatVnd(user.balance)}</TableCell>
              <TableCell className="py-3 text-[#60799c]">{user.notifyOrders || user.notifyCashback ? "Đang bật" : "Đã tắt"}</TableCell>
              <TableCell className="py-3"><span className="flex items-center gap-1.5"><CalendarDays className="size-3.5 text-[#8298b6]" />{user.createdAt.toLocaleDateString("vi-VN")}</span></TableCell>
              <TableCell className="py-3 text-right"><UserRowActions userId={user.id} role={user.role} emailVerified={user.emailVerified} notificationsOn={user.notifyOrders || user.notifyCashback} /></TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="py-14 text-center text-sm text-[#7890b0]">Không tìm thấy người dùng phù hợp.</p>}
      </CardContent>
      <CardFooter>Hiển thị {rows.length} người dùng {q || role ? "(đã lọc)" : "gần nhất"}</CardFooter>
    </Card>
  </main>;
}
