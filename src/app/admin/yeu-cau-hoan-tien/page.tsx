import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  ChevronRight,
  CircleX,
  Clock3,
  Filter,
  Search,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { OrderDecisionControls } from "@/components/admin/OrderDecisionControls";

export const metadata = { title: "Yêu cầu hoàn tiền — Win-Win Back" };
export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  pending: "bg-[#fff5df] text-[#d88700]",
  confirmed: "bg-[#e7f7ef] text-[#168146]",
  completed: "bg-[#e7f7ef] text-[#168146]",
  cancelled: "bg-[#fee9e8] text-[#d34843]",
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

function TrendChart() {
  return (
    <div className="relative h-[155px] px-4 pb-5 pt-3">
      <div className="absolute inset-x-4 top-6 grid h-[105px] grid-rows-4"><span className="border-t border-[#e7eef7]" /><span className="border-t border-[#e7eef7]" /><span className="border-t border-[#e7eef7]" /><span className="border-y border-[#e7eef7]" /></div>
      <svg className="relative h-[112px] w-full" viewBox="0 0 660 112" preserveAspectRatio="none" aria-label="Xu hướng yêu cầu hoàn tiền 7 ngày qua">
        <defs><linearGradient id="requests" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#39b34a" stopOpacity=".2" /><stop offset="1" stopColor="#39b34a" stopOpacity="0" /></linearGradient></defs>
        <path d="M8 79 L105 57 L200 77 L295 51 L390 79 L485 63 L580 51 L652 64 L652 112 L8 112Z" fill="url(#requests)" />
        <path d="M8 79 L105 57 L200 77 L295 51 L390 79 L485 63 L580 51 L652 64" fill="none" stroke="#36a944" strokeWidth="2" />
        <path d="M8 105 L105 95 L200 101 L295 95 L390 105 L485 95 L580 84 L652 94" fill="none" stroke="#1676ef" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-5 bottom-0 flex justify-between text-[10px] text-[#7890b0]"><span>22/08</span><span>23/08</span><span>24/08</span><span>25/08</span><span>26/08</span><span>27/08</span><span>28/08</span></div>
    </div>
  );
}

export default async function CashbackRequestsPage() {
  await requireAdmin();
  const rows = await db
    .select({ order: orders, name: users.name, email: users.email, image: users.image })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(100);

  const pending = rows.filter(({ order }) => order.status === "pending");
  const approved = rows.filter(({ order }) => order.status === "confirmed" || order.status === "completed");
  const rejected = rows.filter(({ order }) => order.status === "cancelled");
  const processing = pending.reduce((sum, row) => sum + row.order.cashbackAmount, 0);
  const selected = pending[0] ?? rows[0];
  const total = rows.length || 1;
  const approvalRate = Math.round((approved.length / total) * 100);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
      <header className="mb-4 flex items-center gap-3 lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-[#e8f8dc] text-[#53ad20]"><BadgeDollarSign className="size-5" /></span>
        <h1 className="text-xl font-black text-[#11345f]">Quản lý yêu cầu hoàn tiền</h1>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={Clock3} tone="bg-[#fff2d4] text-[#e9a414]" label="Yêu cầu chờ duyệt" value={String(pending.length)} change="12,4%" />
        <Metric icon={CheckCircle2} tone="bg-[#e5f7e5] text-[#35a948]" label="Đã duyệt hôm nay" value={String(approved.length)} change="8,7%" />
        <Metric icon={CircleX} tone="bg-[#feeae8] text-[#ed4832]" label="Đã từ chối" value={String(rejected.length)} change="5,3%" />
        <Metric icon={BadgeDollarSign} tone="bg-[#e8f0ff] text-[#2878eb]" label="Tổng tiền hoàn đang xử lý" value={formatVnd(processing)} change="15,2%" />
        <Metric icon={TrendingUp} tone="bg-[#f2e6ff] text-[#9c3bd9]" label="Tỷ lệ duyệt" value={`${approvalRate}%`} change="3,6%" />
        <article className="relative hidden min-h-[120px] overflow-hidden rounded-xl bg-[#062a51] p-4 xl:block">
          <Image src="/images/dashboard-overview-mascot-banner-v5.png" alt="" fill sizes="18rem" className="object-cover object-[76%_35%] opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#062a51] via-[#062a51]/90 to-transparent" />
          <div className="relative z-10"><p className="max-w-[10rem] text-base font-black text-[#c9f463]">Kiểm duyệt yêu cầu nhanh chóng</p><p className="mt-2 text-[10px] font-medium text-white/80">Bảo vệ hệ thống – Tối ưu chi phí</p></div>
        </article>
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)_minmax(330px,1fr)]">
        <article className="rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Xu hướng yêu cầu hoàn tiền 7 ngày qua</PanelTitle><div className="px-5 pt-3 text-[11px] text-[#587298]"><span className="mr-5 inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#36a944]" />Tổng yêu cầu</span><span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#1676ef]" />Đã duyệt</span></div><TrendChart /></article>
        <article className="rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Tỷ lệ xử lý</PanelTitle><div className="flex items-center gap-5 p-5"><div className="grid size-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#f7bc1a 0 ${(pending.length / total) * 100}%, #3cad49 0 ${((pending.length + approved.length) / total) * 100}%, #f1503d 0 100%)` }}><div className="grid size-20 place-items-center rounded-full bg-white text-center"><span className="text-[11px] text-[#7890b0]">Tổng</span><strong className="text-lg text-[#102e5c]">{rows.length}</strong></div></div><div className="space-y-3 text-[11px]"><p className="font-bold text-[#405d84]"><i className="mr-2 inline-block size-2 rounded-full bg-[#f7bc1a]" />Chờ duyệt <span className="block pl-4 text-[#7890b0]">{pending.length} ({Math.round((pending.length / total) * 100)}%)</span></p><p className="font-bold text-[#405d84]"><i className="mr-2 inline-block size-2 rounded-full bg-[#3cad49]" />Đã duyệt <span className="block pl-4 text-[#7890b0]">{approved.length} ({approvalRate}%)</span></p><p className="font-bold text-[#405d84]"><i className="mr-2 inline-block size-2 rounded-full bg-[#f1503d]" />Từ chối <span className="block pl-4 text-[#7890b0]">{rejected.length}</span></p></div></div></article>
        {selected && <aside className="row-span-2 rounded-xl border border-[#e4ebf5] bg-white"><PanelTitle>Chi tiết yêu cầu đang chọn</PanelTitle><div className="p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center overflow-hidden rounded-full bg-[#e8f1ff] font-black text-[#3676cb]">{selected.image ? <Image src={selected.image} alt="" width={40} height={40} className="size-full object-cover" /> : selected.name.charAt(0)}</span><div><b className="text-sm text-[#18375f]">{selected.name}</b><p className="text-[10px] text-[#7188a6]">{selected.email}</p></div><span className="ml-auto rounded-full bg-[#fff5df] px-2 py-1 text-[10px] font-bold text-[#d88700]">{orderStatusLabel[selected.order.status]}</span></div><dl className="mt-5 space-y-2 text-[11px]"><div className="flex justify-between"><dt className="text-[#7188a6]">Mã yêu cầu</dt><dd className="font-bold text-[#35557e]">YC{selected.order.externalOrderId}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Mã đơn hàng</dt><dd className="font-bold text-[#35557e]">{selected.order.externalOrderId}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Thời gian mua</dt><dd className="font-bold text-[#35557e]">{selected.order.orderedAt.toLocaleDateString("vi-VN")}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Giá trị đơn hàng</dt><dd className="font-bold text-[#35557e]">{formatVnd(selected.order.orderAmount)}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Số tiền hoàn</dt><dd className="font-black text-[#168146]">{formatVnd(selected.order.cashbackAmount)}</dd></div><div className="flex justify-between"><dt className="text-[#7188a6]">Sàn</dt><dd className="font-bold text-[#35557e]">{platformLabel[selected.order.platform]}</dd></div></dl>{selected.order.status === "pending" && <div className="mt-5"><OrderDecisionControls orderId={selected.order.id} /></div>}</div><div className="border-t border-[#edf1f7] p-5"><h3 className="text-xs font-black text-[#1b3b65]">Cảnh báo / kiểm tra</h3>{["Tài khoản có nhiều yêu cầu hoàn trong 7 ngày", "Số tiền hoàn cao bất thường", "Nguy cơ trùng đơn hàng"].map((item, index) => <button className="mt-3 flex w-full items-center gap-2 text-left text-[11px] text-[#526d92]" key={item}>{index === 0 ? <AlertTriangle className="size-4 text-[#f04e43]" /> : <ShieldAlert className="size-4 text-[#eead15]" />}<span className="flex-1">{item}</span><ChevronRight className="size-4" /></button>)}</div></aside>}
        <article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white xl:col-span-2"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f7] px-4 py-3"><div className="flex items-center gap-2 text-[11px] font-bold"><span className="rounded-md bg-[#35a647] px-3 py-2 text-white">Tất cả</span><span className="rounded-md bg-[#f5f8fc] px-3 py-2 text-[#607a9d]">Chờ duyệt <b>{pending.length}</b></span><span className="rounded-md bg-[#f5f8fc] px-3 py-2 text-[#607a9d]">Đã duyệt <b>{approved.length}</b></span></div><div className="flex items-center gap-2"><label className="hidden h-8 w-48 items-center gap-2 rounded-md border border-[#e1eaf6] px-2 text-[11px] text-[#879bb5] sm:flex"><Search className="size-3.5" /><input placeholder="Tìm yêu cầu..." className="w-full bg-transparent outline-none" /></label><button className="flex h-8 items-center gap-1 rounded-md border border-[#e1eaf6] px-2 text-[11px] font-semibold text-[#506a90]"><Filter className="size-3.5" />Bộ lọc</button></div></div><PanelTitle>Danh sách yêu cầu hoàn tiền</PanelTitle><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-[11px]"><thead className="bg-[#f7faff] text-[#587298]"><tr><th className="px-4 py-3">Mã YC</th><th className="px-3 py-3">Người dùng</th><th className="px-3 py-3">Sàn</th><th className="px-3 py-3">Mã đơn</th><th className="px-3 py-3">Giá trị đơn</th><th className="px-3 py-3">Hoàn tiền</th><th className="px-3 py-3">Trạng thái</th><th className="px-3 py-3">Hành động</th></tr></thead><tbody>{rows.slice(0, 8).map(({ order, name, email, image }) => <tr className="border-t border-[#edf1f7] text-[#49688f]" key={order.id}><td className="px-4 py-2.5 font-bold text-[#385a83]">YC{order.externalOrderId}</td><td className="px-3 py-2.5"><span className="flex items-center gap-2"><span className="grid size-6 place-items-center overflow-hidden rounded-full bg-[#e5effe] font-black text-[#3676cb]">{image ? <Image src={image} alt="" width={24} height={24} className="size-full object-cover" /> : name.charAt(0)}</span><span><b className="block text-[#2f4f78]">{name}</b><small className="text-[#8aa0bd]">{email}</small></span></span></td><td className="px-3 py-2.5 font-semibold">{platformLabel[order.platform]}</td><td className="px-3 py-2.5">{order.externalOrderId}</td><td className="px-3 py-2.5 font-semibold">{formatVnd(order.orderAmount)}</td><td className="px-3 py-2.5 font-black text-[#168146]">{formatVnd(order.cashbackAmount)}</td><td className="px-3 py-2.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusClass[order.status]}`}>{orderStatusLabel[order.status]}</span></td><td className="px-3 py-2.5">{order.status === "pending" ? <OrderDecisionControls orderId={order.id} /> : <span className="text-[#8ba0bb]">Đã xử lý</span>}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-12 text-center text-sm text-[#7890b0]">Chưa có yêu cầu hoàn tiền.</p>}</div><footer className="border-t border-[#edf1f7] px-4 py-3 text-[11px] text-[#7890b0]">Hiển thị 1 - {Math.min(rows.length, 8)} trong tổng số {rows.length} yêu cầu</footer></article>
      </section>
    </main>
  );
}
