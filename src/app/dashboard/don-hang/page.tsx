import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { CheckCircle2, Clock3, ShoppingBag, WalletCards } from "lucide-react";
import Image from "next/image";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { Empty, PageHeader, cardClass, sectionTitleClass } from "@/components/dashboard/ui";
import { formatVnd } from "@/lib/config";
import { orderStatusClass, orderStatusLabel, platformLabel } from "@/lib/labels";

export const metadata = { title: "Đơn hàng — Win-Win Back" };
export const dynamic = "force-dynamic";

function Summary({ icon: Icon, label, value, color }: { icon: typeof ShoppingBag; label: string; value: string; color: string }) { return <div className={cardClass}><div className="flex gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs text-[#6681a7]">{label}</p><p className="mt-1 text-2xl font-black text-[#0d315d]">{value}</p></div></div></div>; }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.orderedAt)).limit(100);
  const { status } = await searchParams;
  const waiting = rows.filter((row) => row.status === "pending" || row.status === "confirmed");
  const complete = rows.filter((row) => row.status === "completed");
  const totalCashback = rows.reduce((sum, row) => sum + row.cashbackAmount, 0);
  const visibleRows = status === "waiting" ? waiting : status === "completed" ? complete : rows;
  return <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-6 lg:py-8"><PageHeader icon={ShoppingBag} title="Đơn hàng của tôi" hint="Theo dõi trạng thái đơn hàng và tiền hoàn của bạn." />
    <nav aria-label="Lọc đơn hàng" className="mb-5 flex flex-wrap gap-2 border-b border-[#dce7f4] pb-4">{[{ href: "/dashboard/don-hang", label: `Tất cả (${rows.length})`, active: !status }, { href: "/dashboard/don-hang?status=waiting", label: `Chờ xác nhận (${waiting.length})`, active: status === "waiting" }, { href: "/dashboard/don-hang?status=completed", label: `Hoàn tất (${complete.length})`, active: status === "completed" }].map((tab) => <Link key={tab.href} href={tab.href} aria-current={tab.active ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab.active ? "bg-[#eaf9df] font-bold text-[#357d17]" : "text-[#6681a7] hover:bg-[#eef4fc] hover:text-[#315a90]"}`}>{tab.label}</Link>)}</nav>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={ShoppingBag} label="Tổng đơn hàng" value={String(rows.length)} color="bg-[#eaf2ff] text-[#287be5]" /><Summary icon={Clock3} label="Đang chờ hoàn tiền" value={String(waiting.length)} color="bg-[#fff5dc] text-[#ed9b07]" /><Summary icon={CheckCircle2} label="Đã hoàn tất" value={String(complete.length)} color="bg-[#ecfae4] text-[#4aab1b]" /><Summary icon={WalletCards} label="Tổng tiền hoàn" value={formatVnd(totalCashback)} color="bg-[#f7e9ff] text-[#aa34de]" /></div>
    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]"><div className={`${cardClass} self-start overflow-hidden p-0`}><div className="flex items-center justify-between border-b border-[#e6edf6] px-4 py-4 sm:px-5"><h2 className={sectionTitleClass}>Danh sách đơn hàng</h2><span className="text-xs text-[#6681a7]">{visibleRows.length} đơn hiển thị</span></div>{visibleRows.length === 0 ? <div className="p-5"><Empty text="Không có đơn hàng phù hợp với bộ lọc này." /></div> : <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-[#f8fbff] text-xs text-[#6681a7]"><tr><th className="px-5 py-3 font-semibold">Sản phẩm</th><th className="px-4 py-3 font-semibold">Sàn</th><th className="px-4 py-3 font-semibold">Giá trị đơn</th><th className="px-4 py-3 font-semibold">Hoàn tiền</th><th className="px-4 py-3 font-semibold">Trạng thái</th></tr></thead><tbody className="divide-y divide-[#e8eef6]">{visibleRows.map((row) => <tr key={row.id}><td className="max-w-[18rem] px-5 py-4 font-semibold text-[#244a7c]">{row.productName}</td><td className="px-4 py-4 text-[#6681a7]">{platformLabel[row.platform]}</td><td className="px-4 py-4 text-[#315a90]">{formatVnd(row.orderAmount)}</td><td className="px-4 py-4 font-bold text-[#19813e]">{formatVnd(row.cashbackAmount)}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs ${orderStatusClass[row.status]}`}>{orderStatusLabel[row.status]}</span></td></tr>)}</tbody></table></div>}</div><aside className="space-y-4"><div className="relative min-h-48 overflow-hidden rounded-xl bg-[#062c52] p-5 text-white"><Image src="/images/dashboard-coupon-promo-v2.png" alt="" fill sizes="17rem" className="object-cover object-center" /><div className="relative z-10 max-w-[11rem]"><p className="text-lg font-black leading-tight">Ưu đãi dành cho đơn hàng mới</p><p className="mt-2 text-xs leading-5 text-white/75">Tạo link Win-Win Back trước khi mua để không bỏ lỡ tiền hoàn.</p></div></div><div className={cardClass}><h2 className={sectionTitleClass}>Mẹo để đơn được ghi nhận</h2><ul className="mt-4 space-y-4 text-sm leading-5 text-[#6681a7]"><li><b className="block text-[#244a7c]">Mua sắm qua Win-Win Back</b>Lưu truy cập qua link hoàn tiền trước khi mua.</li><li><b className="block text-[#244a7c]">Không dùng mã ngoài sàn</b>Đảm bảo đơn hàng được ghi nhận chính xác.</li><li><b className="block text-[#244a7c]">Chờ đủ thời gian hoàn</b>Tiền hoàn được xác nhận sau khi hết thời gian đổi trả.</li></ul></div></aside></section>
  </main>;
}
