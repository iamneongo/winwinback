import Image from "next/image";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Banknote, Clock3, CircleCheck, Landmark, Wallet } from "lucide-react";
import { db } from "@/db";
import { withdrawals, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { withdrawalStatusLabel } from "@/lib/labels";
import { WithdrawalControls } from "@/components/admin/WithdrawalControls";
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

export const metadata = { title: "Yêu cầu rút tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

const statusVariant: Record<string, "warning" | "default" | "destructive" | "success"> = {
  pending: "warning",
  approved: "default",
  rejected: "destructive",
  paid: "success",
};

function Metric({ icon: Icon, tone, label, value }: { icon: typeof Banknote; tone: string; label: string; value: string }) {
  return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="mt-3 text-xs font-semibold text-[#587298]">{label}</p><p className="mt-1 text-2xl font-black text-[#102e5c]">{value}</p></article>;
}

export default async function WithdrawalsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q, status } = await searchParams;

  const conditions = [];
  if (q) conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`), ilike(withdrawals.accountHolder, `%${q}%`), ilike(withdrawals.bankName, `%${q}%`)));
  if (status === "pending" || status === "approved" || status === "rejected" || status === "paid") conditions.push(eq(withdrawals.status, status));
  const where = conditions.length ? and(...conditions) : undefined;

  const [stats] = await db
    .select({
      pendingCount: sql<number>`count(*) filter (where ${withdrawals.status} = 'pending')::int`,
      pendingAmount: sql<number>`coalesce(sum(${withdrawals.amount}) filter (where ${withdrawals.status} = 'pending'), 0)::float8`,
      approvedAmount: sql<number>`coalesce(sum(${withdrawals.amount}) filter (where ${withdrawals.status} = 'approved'), 0)::float8`,
      paidAmount: sql<number>`coalesce(sum(${withdrawals.amount}) filter (where ${withdrawals.status} = 'paid'), 0)::float8`,
    })
    .from(withdrawals);

  const rows = await db
    .select({ w: withdrawals, name: users.name, email: users.email, image: users.image })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .where(where)
    .orderBy(desc(withdrawals.requestedAt))
    .limit(100);

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <div className="mb-4 lg:hidden"><h1 className="text-xl font-black text-[#11345f]">Yêu cầu rút tiền</h1><p className="mt-1 text-sm text-[#60799c]">Duyệt, chi trả và từ chối yêu cầu rút tiền của người dùng</p></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Clock3} tone="bg-[#fff3dc] text-[#eda815]" label="Chờ xử lý" value={String(stats.pendingCount)} /><Metric icon={Wallet} tone="bg-[#fff1d9] text-[#e99a10]" label="Tiền chờ duyệt" value={formatVnd(stats.pendingAmount)} /><Metric icon={Landmark} tone="bg-[#e8f1ff] text-[#2877ec]" label="Đã duyệt, chờ chi" value={formatVnd(stats.approvedAmount)} /><Metric icon={CircleCheck} tone="bg-[#e7f7ef] text-[#31a141]" label="Tổng đã chi" value={formatVnd(stats.paidAmount)} /></section>
    <Card className="mt-3 overflow-hidden">
      <CardHeader>
        <div><h2 className="text-base font-black text-[#12355f]">Danh sách yêu cầu rút tiền</h2><p className="mt-1 text-xs text-[#6c86a8]">Kiểm tra thông tin ngân hàng và xử lý từng yêu cầu</p></div>
        <AdminFilters searchPlaceholder="Tìm người dùng, chủ tài khoản..." filters={[{ name: "status", placeholder: "Tất cả trạng thái", options: [{ value: "pending", label: "Chờ xử lý" }, { value: "approved", label: "Đã duyệt" }, { value: "paid", label: "Đã chi" }, { value: "rejected", label: "Từ chối" }] }]} />
      </CardHeader>
      <CardContent className="p-0">
        <Table className="min-w-[1080px] text-[11px]">
          <TableHeader className="bg-[#f7faff] text-[#587298]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 py-3">Mã YC</TableHead>
              <TableHead className="py-3">Người dùng</TableHead>
              <TableHead className="py-3">Số tiền</TableHead>
              <TableHead className="py-3">Ngân hàng</TableHead>
              <TableHead className="py-3">Trạng thái</TableHead>
              <TableHead className="py-3">Ngày yêu cầu</TableHead>
              <TableHead className="py-3">Ngày xử lý</TableHead>
              <TableHead className="py-3">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[#49688f]">
            {rows.map(({ w, name, email, image }) => <TableRow key={w.id}>
              <TableCell className="px-5 py-3 font-bold text-[#365780]">RT{w.id.slice(0, 8).toUpperCase()}</TableCell>
              <TableCell className="py-3"><span className="flex items-center gap-2"><span className="grid size-7 place-items-center overflow-hidden rounded-full bg-[#e5effe] font-black text-[#3676cb]">{image ? <Image src={image} alt="" width={28} height={28} className="size-full object-cover" /> : name.charAt(0)}</span><span><b className="block text-[#2f4f78]">{name}</b><small className="text-[#8aa0bd]">{email}</small></span></span></TableCell>
              <TableCell className="py-3 font-black text-[#c0392b]">{formatVnd(w.amount)}</TableCell>
              <TableCell className="py-3"><span className="block font-semibold text-[#35557e]">{w.bankName}</span><small className="text-[#8aa0bd]">**** {w.bankAccount.slice(-4)} · {w.accountHolder}</small></TableCell>
              <TableCell className="py-3"><Badge variant={statusVariant[w.status]}>{withdrawalStatusLabel[w.status]}</Badge></TableCell>
              <TableCell className="py-3 whitespace-nowrap">{w.requestedAt.toLocaleString("vi-VN")}</TableCell>
              <TableCell className="py-3 whitespace-nowrap">{w.processedAt ? w.processedAt.toLocaleString("vi-VN") : "—"}</TableCell>
              <TableCell className="py-3"><WithdrawalControls withdrawalId={w.id} status={w.status} /></TableCell>
            </TableRow>)}
          </TableBody>
        </Table>
        {rows.length === 0 && <p className="py-14 text-center text-sm text-[#7890b0]">Không tìm thấy yêu cầu rút tiền phù hợp.</p>}
      </CardContent>
      <CardFooter>Hiển thị {rows.length} yêu cầu {q || status ? "(đã lọc)" : "gần nhất"}</CardFooter>
    </Card>
  </main>;
}
