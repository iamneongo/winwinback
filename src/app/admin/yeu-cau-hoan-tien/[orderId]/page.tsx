import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileText,
  Mail,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { OrderDecisionControls } from "@/components/admin/OrderDecisionControls";

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
  const checks = ["Đơn hàng hợp lệ", "Token / dữ liệu sàn đồng bộ", "Bằng chứng đầy đủ"];
  const risks = ["Tài khoản đã gửi nhiều yêu cầu hoàn trong 7 ngày", "Giá trị hoàn tiền cao hơn mức trung bình", "Cần đối chiếu thêm với lịch sử đơn hàng"];
  const files = ["cashback-seal.jpg", "dashboard-overview-banner-v6.png", "dashboard-overview-wallet-promo-v4.png", "dashboard-cashback-tracking-promo-v2.png"];

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 text-xs text-[#6881a4]"><Link href="/admin/yeu-cau-hoan-tien" className="hover:text-[#2576e9]">Yêu cầu hoàn tiền</Link> <span className="px-1">/</span> Chi tiết yêu cầu</p><h1 className="text-[27px] font-black tracking-tight text-[#102e5c]">Chi tiết yêu cầu hoàn tiền</h1><p className="mt-1 text-sm text-[#60799c]">Xem và kiểm duyệt thông tin yêu cầu hoàn tiền</p></div><div className="flex gap-2"><Link href="/admin/yeu-cau-hoan-tien" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dbe6f3] px-4 text-xs font-bold text-[#466184]"><ArrowLeft className="size-4" />Quay lại</Link>{pending && <OrderDecisionControls orderId={order.id} />}</div></header>
    <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_1.25fr]"><article className="flex items-center gap-4 rounded-xl border border-[#e4ebf5] bg-white p-4"><span className="grid size-10 place-items-center rounded-full bg-[#e9f1ff] text-[#2877ec]"><FileText className="size-5" /></span><div><p className="text-xs text-[#60799c]">Mã yêu cầu</p><strong className="text-xl text-[#102e5c]">YC{order.externalOrderId}</strong></div></article><article className="flex items-center gap-4 rounded-xl border border-[#e4ebf5] bg-white p-4"><span className="grid size-10 place-items-center rounded-full bg-[#fff1d6] text-[#e8a212]"><Clock3 className="size-5" /></span><div><p className="text-xs text-[#60799c]">Trạng thái</p><strong className="text-base text-[#d88700]">{orderStatusLabel[order.status]}</strong></div></article><article className="flex items-center gap-4 rounded-xl border border-[#e4ebf5] bg-white p-4"><span className="grid size-10 place-items-center rounded-full bg-[#e8f8de] text-[#48a829]"><BadgeDollarSign className="size-5" /></span><div><p className="text-xs text-[#60799c]">Số tiền hoàn</p><strong className="text-xl text-[#15923a]">{formatVnd(order.cashbackAmount)}</strong></div></article><article className="relative hidden min-h-[81px] overflow-hidden rounded-xl bg-[#062a51] p-4 xl:block"><Image src="/images/dashboard-overview-mascot-banner-v5.png" alt="" fill sizes="24rem" className="object-cover object-[78%_38%] opacity-75" /><div className="absolute inset-0 bg-gradient-to-r from-[#062a51] via-[#062a51]/90 to-transparent" /><p className="relative z-10 max-w-[11rem] text-base font-black text-[#c9f463]">Kiểm duyệt chính xác, xử lý nhanh</p></article></section>
    <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"><div className="space-y-3"><Card title="A. Thông tin yêu cầu"><div className="grid gap-x-5 px-4 py-2 md:grid-cols-2"><div><Row icon={ClipboardCheck} label="Người dùng" value={name} /><Row icon={Mail} label="Email" value={email} /><Row icon={Phone} label="Số điện thoại" value="Chưa cập nhật" /><Row icon={ShoppingBag} label="Sàn" value={platformLabel[order.platform]} /><Row icon={FileText} label="Mã đơn hàng" value={order.externalOrderId} /></div><div><Row icon={Clock3} label="Thời gian gửi yêu cầu" value={submitted} /><Row icon={CalendarDays} label="Thời gian mua hàng" value={order.orderedAt.toLocaleString("vi-VN")} /><Row icon={BadgeDollarSign} label="Giá trị đơn hàng" value={formatVnd(order.orderAmount)} /><Row icon={BadgeDollarSign} label="Hoa hồng" value={formatVnd(order.commissionAmount)} /><Row icon={BadgeDollarSign} label="Số tiền hoàn dự kiến" value={formatVnd(order.cashbackAmount)} green /></div></div><div className="mx-4 mb-4 rounded-lg border border-[#e2eaf5] bg-[#f9fbfe] px-3 py-2 text-[11px] text-[#486487]"><b className="mr-2 text-[#254c7b]">Lý do hoàn tiền:</b>Mua hàng qua link giới thiệu nhưng chưa nhận hoàn tiền.</div></Card><Card title="B. Bằng chứng đính kèm"><div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">{files.map((src) => <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-[#d9e4f1]" key={src}><Image src={`/images/${src}`} alt="Bằng chứng giao dịch" fill sizes="12rem" className="object-cover" /></div>)}</div><p className="px-4 pb-3 text-[11px] text-[#7188a6]">Tổng cộng 4 tệp đính kèm</p></Card><div className="grid gap-3 md:grid-cols-2"><Card title="C. Lịch sử xử lý"><ol className="relative mx-5 my-4 border-l border-[#dbe7f5] pl-5">{["Người dùng gửi yêu cầu hoàn tiền", "Hệ thống kiểm tra điều kiện đơn hàng", "Đồng bộ dữ liệu từ sàn thành công", "Yêu cầu vào hàng chờ kiểm duyệt", "Admin đang xem chi tiết yêu cầu"].map((item, index) => <li className="relative mb-4 text-[11px] text-[#536f94] last:mb-0" key={item}><i className={`absolute -left-[26px] top-0.5 size-3 rounded-full ${index < 3 ? "bg-[#32a744]" : "bg-[#2f7aed]"}`} /><span className="mr-2 text-[#7790ae]">{submitted}</span>{item}</li>)}</ol></Card><Card title="D. Ghi chú nội bộ"><div className="space-y-2 p-4"><p className="rounded-lg bg-[#f0faed] p-3 text-[11px] text-[#426448]"><b>Hệ thống xác nhận đơn hợp lệ.</b><br />{submitted} · Hệ thống</p><p className="rounded-lg bg-[#fff8e9] p-3 text-[11px] text-[#786236]">Cần kiểm tra lại lịch sử hoàn tiền của tài khoản.</p><textarea className="h-16 w-full resize-none rounded-lg border border-[#dbe6f2] p-2 text-xs outline-none focus:border-[#82c84e]" placeholder="Nhập ghi chú nội bộ..." /><button className="ml-auto flex h-8 items-center rounded-md border border-[#8fb8ff] px-3 text-[11px] font-bold text-[#2576e9]">Lưu ghi chú</button></div></Card></div></div><aside className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><Card title="A. Tóm tắt kiểm tra"><div className="p-4">{checks.map((check) => <p className="mb-3 flex items-center gap-2 text-[11px] text-[#456084]" key={check}><CheckCircle2 className="size-4 text-[#32a744]" /><span className="flex-1">{check}</span><b className="rounded-md bg-[#edf8ec] px-2 py-1 text-[#299039]">đạt</b></p>)}<p className="flex items-center gap-2 text-[11px] text-[#456084]"><AlertTriangle className="size-4 text-[#eea614]" /><span className="flex-1">Nguy cơ gian lận</span><b className="rounded-md bg-[#fff5df] px-2 py-1 text-[#db8b00]">cần xem xét</b></p></div></Card><Card title="B. Thông tin thanh toán"><div className="p-4"><Row icon={BadgeDollarSign} label="Phương thức hoàn" value="Ví ShopeePay" /><Row icon={ClipboardCheck} label="Tài khoản nhận" value={name} /><Row icon={Clock3} label="Trạng thái chi trả" value="Chưa chi trả" /><Row icon={CalendarDays} label="Dự kiến thanh toán" value="Sau khi duyệt" /></div></Card></div><Card title="C. Cảnh báo / rủi ro"><div className="p-3">{risks.map((risk) => <p className="flex items-center gap-2 border-b border-[#fde5e3] py-2 text-[11px] text-[#e94536] last:border-0" key={risk}><CircleAlert className="size-4" />{risk}</p>)}</div></Card><Card title="D. Thao tác kiểm duyệt"><div className="space-y-3 p-4"><label className="block text-xs font-semibold text-[#526b90]">Kết quả kiểm duyệt<select defaultValue={order.status} className="mt-1.5 h-9 w-full rounded-lg border border-[#dbe6f2] bg-white px-3 text-xs text-[#3a557c] outline-none"><option value="pending">Chờ duyệt</option><option value="confirmed">Duyệt</option><option value="cancelled">Từ chối</option></select></label><label className="block text-xs font-semibold text-[#526b90]">Phản hồi cho người dùng<textarea className="mt-1.5 h-20 w-full resize-none rounded-lg border border-[#dbe6f2] p-3 text-xs font-normal outline-none focus:border-[#82c84e]" placeholder="Nhập phản hồi cho người dùng..." /></label>{pending ? <OrderDecisionControls orderId={order.id} /> : <p className="rounded-lg bg-[#f4f8fc] p-3 text-xs font-semibold text-[#587298]">Yêu cầu này đã được xử lý.</p>}</div></Card></aside></section>
  </main>;
}
