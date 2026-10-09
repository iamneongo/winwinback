import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, users, walletTransactions, withdrawals } from "@/db/schema";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { orderStatusLabel, txTypeLabel } from "@/lib/labels";

export const metadata = { title: "Chi tiết người dùng — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) notFound();
  const [[orderCount], [withdrawalCount], recentOrders, recentTx] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.userId, id)),
    db.select({ count: sql<number>`count(*)::int` }).from(withdrawals).where(eq(withdrawals.userId, id)),
    db.select({ id: orders.id, externalOrderId: orders.externalOrderId, status: orders.status, orderedAt: orders.orderedAt }).from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.orderedAt)).limit(5),
    db.select({ id: walletTransactions.id, type: walletTransactions.type, amount: walletTransactions.amount, createdAt: walletTransactions.createdAt }).from(walletTransactions).where(eq(walletTransactions.userId, id)).orderBy(desc(walletTransactions.createdAt)).limit(5),
  ]);
  return <RecordDetail backHref="/admin/nguoi-dung" backLabel="Danh sách người dùng" title={user.name} description="Tài khoản, số dư và hoạt động gần đây của người dùng.">
    <DetailSection title="Tài khoản">
      <DetailField label="Email">{user.email}</DetailField>
      <DetailField label="Xác thực email">{user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}</DetailField>
      <DetailField label="Vai trò">{user.role === "admin" ? "Quản trị" : "Người dùng"}</DetailField>
      <DetailField label="Ngày tham gia">{user.createdAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Thông báo đơn hàng">{user.notifyOrders ? "Đang bật" : "Đã tắt"}</DetailField>
      <DetailField label="Thông báo hoàn tiền">{user.notifyCashback ? "Đang bật" : "Đã tắt"}</DetailField>
    </DetailSection>
    <DetailSection title="Ví và hoạt động">
      <DetailField label="Số dư khả dụng">{formatVnd(user.balance)}</DetailField>
      <DetailField label="Tổng đơn hàng">{orderCount?.count ?? 0}</DetailField>
      <DetailField label="Số yêu cầu rút tiền">{withdrawalCount?.count ?? 0}</DetailField>
      <DetailField label="Mã giới thiệu">{user.referralCode ?? "Chưa tạo"}</DetailField>
    </DetailSection>
    <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
      <h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">Đơn hàng gần đây</h2>
      {recentOrders.length ? <ul className="divide-y divide-[#e8eef6]">{recentOrders.map((order) => <li key={order.id}><Link href={`/admin/don-hang/${order.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-[#f6faff] sm:px-5"><span className="font-semibold text-[#1261ed]">{order.externalOrderId}</span><span className="text-[#58749a]">{orderStatusLabel[order.status]} · {order.orderedAt.toLocaleDateString("vi-VN")}</span></Link></li>)}</ul> : <p className="px-5 py-6 text-sm text-[#58749a]">Chưa có đơn hàng.</p>}
    </section>
    <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
      <h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">Giao dịch gần đây</h2>
      {recentTx.length ? <ul className="divide-y divide-[#e8eef6]">{recentTx.map((tx) => <li key={tx.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm sm:px-5"><span className="text-[#31527d]">{txTypeLabel[tx.type]} · {tx.createdAt.toLocaleDateString("vi-VN")}</span><b className={tx.amount >= 0 ? "text-[#168146]" : "text-[#b5322e]"}>{formatVnd(tx.amount)}</b></li>)}</ul> : <p className="px-5 py-6 text-sm text-[#58749a]">Chưa có giao dịch.</p>}
    </section>
  </RecordDetail>;
}
