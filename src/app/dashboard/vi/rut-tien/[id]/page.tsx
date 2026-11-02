import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { withdrawals } from "@/db/schema";
import { WithdrawalCorrectionForm } from "@/components/dashboard/WithdrawalCorrectionForm";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { withdrawalStatusLabel } from "@/lib/labels";

export const metadata = { title: "Yêu cầu rút tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function WithdrawalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [item] = await db.select().from(withdrawals).where(and(eq(withdrawals.id, id), eq(withdrawals.userId, user.id))).limit(1);
  if (!item) notFound();
  return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
    <Link href="/dashboard/vi" className="text-sm font-semibold text-[#1261ed] hover:underline">← Về ví hoàn tiền</Link>
    <section className="mt-5 rounded-2xl border border-[#dce7f4] bg-white p-5 shadow-sm sm:p-7">
      <h1 className="text-xl font-bold text-[#173861]">Yêu cầu rút {formatVnd(item.amount)}</h1>
      <p className="mt-2 text-sm text-[#58749a]">Mã RT{item.id.slice(0, 8).toUpperCase()} · {withdrawalStatusLabel[item.status]}</p>
      {item.status === "needs_info" ? <>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Thông tin cần sửa</b><p className="mt-1 whitespace-pre-wrap">{item.correctionReason}</p></div>
        <WithdrawalCorrectionForm item={item} />
      </> : <p className="mt-5 text-sm text-[#58749a]">Yêu cầu đang được xử lý. Nếu cần hỗ trợ, vui lòng liên hệ qua mục Liên hệ trong dashboard.</p>}
    </section>
  </main>;
}
