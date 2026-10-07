import Link from "next/link";
import { ChevronRight, Landmark, FileText, ScrollText, Lock, HelpCircle, MessageCircle, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { requireUser } from "@/lib/auth/guards";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { SecuritySettings } from "@/components/dashboard/SecuritySettings";
import { NotificationSettings } from "@/components/dashboard/NotificationSettings";

export const metadata = { title: "Cài đặt — Win-Win Back" };
export const dynamic = "force-dynamic";


const supportLinks: { href: string; icon: LucideIcon; tone: string; title: string; desc: string }[] = [
  { href: "/cai-dat-ung-dung", icon: HelpCircle, tone: "bg-[#eafbe0] text-[#315c13]", title: "Cài app & chia sẻ link nhanh", desc: "Android PWA · Phím tắt iPhone" },
  { href: "/dashboard/chinh-sach-hoat-dong", icon: FileText, tone: "bg-[#e8f1ff] text-[#287be5]", title: "Chính sách hoạt động", desc: "Tỷ lệ hoa hồng, mốc T+, rút tiền, referral" },
  { href: "/dashboard/dieu-khoan", icon: ScrollText, tone: "bg-[#fff2df] text-[#ed9a0b]", title: "Điều khoản sử dụng", desc: "Quy định khi sử dụng dịch vụ" },
  { href: "/dashboard/chinh-sach-bao-mat", icon: Lock, tone: "bg-[#eafbe0] text-[#3f8a2e]", title: "Chính sách bảo mật", desc: "Cách chúng tôi bảo vệ dữ liệu của bạn" },
  { href: "/dashboard/faq", icon: HelpCircle, tone: "bg-[#fdeaea] text-[#e5484d]", title: "Câu hỏi thường gặp (FAQ)", desc: "Giải đáp nhanh trước khi bắt đầu" },
  { href: "/dashboard/lien-he", icon: MessageCircle, tone: "bg-[#f5e9ff] text-[#a32cdb]", title: "Liên hệ hỗ trợ", desc: "Zalo OA · Fanpage · Group cộng đồng" },
];

function SupportCard() {
  return (
    <section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
      <h2 className="text-xs font-bold uppercase tracking-wide text-[#8298b6]">Chính sách &amp; Hỗ trợ</h2>
      <div className="mt-2 divide-y divide-[#eef2f8]">
        {supportLinks.map(({ href, icon: Icon, tone, title, desc }) => (
          <Link key={href} href={href} className="flex items-center gap-3 py-3 transition-colors hover:bg-[#f7faff]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0 flex-1">
              <b className="block text-sm text-[#173861]">{title}</b>
              <p className="mt-0.5 truncate text-xs text-[#6882a5]">{desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#9db2cf]" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function AccountPage() {
  const user = await requireUser();
  return <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7"><header className="mb-5"><h1 className="text-[30px] font-black tracking-tight text-[#11335e]">Cài đặt</h1><p className="mt-1 text-sm text-[#58749a]">Quản lý tài khoản, bảo mật và tùy chọn sử dụng của bạn</p></header><section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22.8rem]"><div className="space-y-4"><section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><h2 className="font-bold text-[#173861]">Thông tin cá nhân</h2><div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center"><span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#b7e961] text-3xl font-black text-[#11335e]">{user.name.charAt(0).toUpperCase()}</span><div className="grid min-w-0 flex-1 gap-3 text-sm sm:grid-cols-2"><div className="min-w-0"><span className="block text-xs text-[#6c86a9]">Họ và tên</span><b className="block truncate text-[#244a7c]" title={user.name}>{user.name}</b></div><div className="min-w-0"><span className="block text-xs text-[#6c86a9]">Email</span><b className="block truncate text-[#244a7c]" title={user.email}>{user.email}</b></div><div className="min-w-0"><span className="block text-xs text-[#6c86a9]">Trạng thái email</span><b className={user.emailVerified ? "block text-[#168146]" : "block text-[#b97710]"}>{user.emailVerified ? "Đã xác minh" : "Chưa xác minh"}</b></div></div></div><ProfileForm name={user.name} email={user.email} /></section><section className="rounded-xl border border-[#e0eaf6] bg-white px-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><h2 className="pt-5 font-bold text-[#173861]">Bảo mật tài khoản</h2><SecuritySettings /></section><div className="grid gap-4 lg:grid-cols-2"><section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><h2 className="font-bold text-[#173861]">Tùy chọn thông báo</h2><NotificationSettings prefs={{ notifyOrders: user.notifyOrders, notifyCashback: user.notifyCashback, notifySystemEmail: user.notifySystemEmail }} /></section></div></div><aside className="space-y-4"><SupportCard /><section className="rounded-xl border border-[#e0eaf6] bg-white p-5 shadow-[0_5px_14px_rgba(26,73,124,0.04)]"><h2 className="flex items-center gap-2 font-bold text-[#173861]"><Landmark className="h-5 w-5" /> Liên kết ngân hàng</h2><div className="mt-4 rounded-lg border border-[#e2eaf4] p-4"><b className="text-sm text-[#244a7c]">Chưa có tài khoản liên kết</b><p className="mt-1 text-xs text-[#718bad]">Liên kết tài khoản để rút tiền hoàn.</p><button className="mt-4 w-full rounded-lg bg-[#a9e75e] py-2.5 text-xs font-bold text-[#173b5e]">Thêm tài khoản</button></div></section><section className="relative min-h-52 overflow-hidden rounded-xl border border-[#dcefcf] bg-[#effde8] p-5"><Image src="/images/dashboard-security-promo-v2.png" alt="Bảo vệ tài khoản" fill sizes="23rem" className="object-cover object-right" /><div className="relative z-10 max-w-[10rem]"><h2 className="text-lg font-black leading-5 text-[#173861]">Bảo vệ tài khoản, an tâm nhận hoàn tiền</h2><p className="mt-3 text-xs leading-5 text-[#49688f]">Win-Win Back cam kết bảo mật thông tin của bạn.</p><Link href="/dashboard" className="mt-4 inline-flex rounded-lg bg-[#a9e75e] px-3 py-2 text-xs font-bold text-[#173b5e]">Tìm hiểu thêm</Link></div></section></aside></section></main>;
}
