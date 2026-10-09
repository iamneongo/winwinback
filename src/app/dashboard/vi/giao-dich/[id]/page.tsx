import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { walletTransactions } from "@/db/schema";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { txTypeLabel } from "@/lib/labels";

export const metadata = { title: "Chi tiết giao dịch ví — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function WalletTransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [tx] = await db.select().from(walletTransactions)
    .where(and(eq(walletTransactions.id, id), eq(walletTransactions.userId, user.id))).limit(1);
  if (!tx) notFound();
  return <RecordDetail backHref="/dashboard/vi" backLabel="Lịch sử giao dịch ví" title={`Giao dịch ${tx.id.slice(0, 10).toUpperCase()}`} description="Chi tiết biến động số dư đã được ghi nhận trong ví của bạn.">
    <DetailSection title="Giao dịch">
      <DetailField label="Loại giao dịch">{txTypeLabel[tx.type]}</DetailField>
      <DetailField label="Số tiền"><span className={tx.amount >= 0 ? "text-[#168146]" : "text-[#b5322e]"}>{tx.amount > 0 ? "+" : ""}{formatVnd(tx.amount)}</span></DetailField>
      <DetailField label="Số dư sau giao dịch">{formatVnd(tx.balanceAfter)}</DetailField>
      <DetailField label="Thời gian">{tx.createdAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Nội dung">{tx.note ?? "Không có ghi chú"}</DetailField>
      <DetailField label="Đơn hàng liên quan">{tx.orderId ? <Link href={`/dashboard/don-hang/${tx.orderId}`} className="text-[#1261ed] hover:underline">Xem đơn hàng</Link> : "Không có"}</DetailField>
    </DetailSection>
  </RecordDetail>;
}
