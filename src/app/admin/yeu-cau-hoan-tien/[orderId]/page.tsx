import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  FileText,
  Mail,
  ShoppingBag,
} from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { OrderDecisionControls } from "@/components/admin/OrderDecisionControls";
import { OrderReviewForm } from "@/components/admin/OrderReviewForm";

export const dynamic = "force-dynamic";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-[#e4ebf5] bg-white"><h2 className="border-b border-[#edf1f7] px-4 py-3 text-sm font-black text-[#12355f]">{title}</h2>{children}</section>;
}

function Row({ icon: Icon, label, value, green = false }: { icon: typeof Mail; label: string; value: string; green?: boolean }) {
  return <div className="flex items-center justify-between gap-3 border-b border-dashed border-[#e2eaf5] py-2 last:border-0"><span className="flex items-center gap-2 text-[11px] text-[#627b9d]"><Icon className="size-3.5" />{label}</span><strong className={`text-[11px] ${green ? "text-[#15923a]" : "text-[#294a74]"}`}>{value}</strong></div>;
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireAdmin();
  const { orderId } = await params;
  const result = await db.select({ order: orders, name: users.name, email: users.email, image: users.image }).from(orders).innerJoin(users, eq(orders.userId, users.id)).where(eq(orders.id, orderId)).limit(1);
  const data = result[0];
  if (!data) notFound();
  const { order, name, email } = data;
  const pending = order.status === "pending";
  const submitted = order.createdAt.toLocaleString("vi-VN");

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs text-[#6881a4]"><Link href="/admin/yeu-cau-hoan-tien" className="hover:text-[#2576e9]">Yêu cầu hoàn tiền</Link> <span className="px-1">/</span> Chi tiết yêu cầu</p><h1 className="text-[27px] font-black tracking-tight text-[#102e5c]">Chi tiết yêu cầu hoàn tiền</h1><p className="mt-1 text-sm text-[#60799c]">Xem và kiểm duyệt thông tin yêu cầu hoàn tiền</p></div><div className="flex gap-2"><Link href="/admin/yeu-cau-hoan-tien" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dbe6f3] px-4 text-xs font-bold text-[#466184]"><ArrowLeft className="size-4" />Quay lại</Link>{pending && <OrderDecisionControls orderId={order.id} />}</div></header>
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_1.25fr]"><article className="flex items-center gap-4 rounded-xl border border-[#e4ebf5] bg-white p-4"><span className="grid size-10 place-items-center rounded-full bg-[#e9f1ff] text-[#2877ec]"><FileText className="size-5" /></span><div><p className="text-xs text-[#60799c]">Mã yêu cầu</p><strong className="text-xl text-[#102e5c]">YC{order.externalOrderId}</strong></div></article><article className="flex items-center gap-4 rounded-xl border border-[#e4ebf5] bg-white p-4"><span className="grid size-10 place-items-center rounded-full bg-[#fff1d6] text-[#e8a212]"><Clock3 className="size-5" /></span><div><p className="text-xs text-[#60799c]">Trạng thái</p><strong className="text-base text-[#d88700]">{orderStatusLabel[order.status]}</strong></div></article><article className="flex items-center gap-4 rounded-xl border border-[#e4ebf5] bg-white p-4"><span className="grid size-10 place-items-center rounded-full bg-[#e8f8de] text-[#48a829]"><BadgeDollarSign className="size-5" /></span><div><p className="text-xs text-[#60799c]">Số tiền hoàn</p><strong className="text-xl text-[#15923a]">{formatVnd(order.cashbackAmount)}</strong></div></article><article className="relative hidden min-h-[81px] overflow-hidden rounded-xl bg-[#062a51] p-4 xl:block"><Image src="/images/dashboard-overview-mascot-banner-v5.png" alt="" fill sizes="24rem" className="object-cover object-[78%_38%] opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-[#062a51] via-[#062a51]/90 to-transparent" /><p className="relative z-10 max-w-[11rem] text-base font-black text-[#c9f463]">Kiểm duyệt chính xác, xử lý nhanh</p></article></section>
    <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"><div className="space-y-3"><Card title="Thông tin yêu cầu"><div className="grid gap-x-5 px-4 py-2 md:grid-cols-2"><div><Row icon={ClipboardCheck} label="Người dùng" value={name} /><Row icon={Mail} label="Email" value={email} /><Row icon={ShoppingBag} label="Sàn" value={platformLabel[order.platform]} /><Row icon={FileText} label="Sản phẩm" value={order.productName} /><Row icon={FileText} label="Mã đơn hàng" value={order.externalOrderId} /></div><div><Row icon={Clock3} label="Thời gian gửi yêu cầu" value={submitted} /><Row icon={CalendarDays} label="Thời gian mua hàng" value={order.orderedAt.toLocaleString("vi-VN")} /><Row icon={BadgeDollarSign} label="Giá trị đơn hàng" value={formatVnd(order.orderAmount)} /><Row icon={BadgeDollarSign} label="Hoa hồng" value={formatVnd(order.commissionAmount)} /><Row icon={BadgeDollarSign} label="Số tiền hoàn dự kiến" value={formatVnd(order.cashbackAmount)} green /></div></div></Card><Card title="Ghi chú nội bộ"><div className="space-y-2 p-4">{order.cashbackCreditedAt && <p className="rounded-lg bg-[#f0faed] p-3 text-[11px] text-[#426448]"><b>Đã hoàn tiền vào ví người dùng.</b><br />{order.cashbackCreditedAt.toLocaleString("vi-VN")}</p>}{order.adminNote ? <p className="rounded-lg bg-[#f0f6ff] p-3 text-[11px] whitespace-pre-wrap text-[#385a83]"><b>Ghi chú kiểm duyệt:</b><br />{order.adminNote}</p> : <p className="rounded-lg bg-[#f7faff] p-3 text-[11px] text-[#8298b6]">Chưa có ghi chú kiểm duyệt. Dùng khung “Thao tác kiểm duyệt” bên phải để lưu ghi chú và kết quả.</p>}</div></Card></div><aside className="space-y-3"><Card title="Thao tác kiểm duyệt"><div className="p-4"><OrderReviewForm orderId={order.id} status={order.status} adminNote={order.adminNote} /></div></Card></aside></section>
  </main>;
}
