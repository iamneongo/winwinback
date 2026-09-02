import Image from "next/image";
import { Link2, ShieldCheck, Clock3, ShoppingBag, CircleCheck, CircleAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { TikTokIntegration, type TikTokStatus } from "@/components/admin/TikTokIntegration";
import { isTikTokConfigured } from "@/lib/affiliate/tiktok/config";
import { getStoredTikTokToken } from "@/lib/affiliate/tiktok/tokens";

export const metadata = { title: "Kết nối sàn — Win-Win Back" };
export const dynamic = "force-dynamic";

const callbacks: Record<string, { text: string; ok: boolean }> = {
  connected: { text: "Đã kết nối TikTok Shop Affiliate Creator thành công.", ok: true },
  not_creator: { text: "Tài khoản đã uỷ quyền không phải tài khoản Creator.", ok: false },
  denied: { text: "Bạn đã từ chối uỷ quyền hoặc thiếu mã code.", ok: false },
  bad_state: { text: "Phiên uỷ quyền không hợp lệ hoặc đã hết hạn.", ok: false },
  misconfigured: { text: "Chưa cấu hình thông tin ứng dụng TikTok.", ok: false },
  error: { text: "Không thể hoàn tất kết nối TikTok.", ok: false },
};

function Metric({ icon: Icon, tone, label, value, hint }: { icon: typeof Link2; tone: string; label: string; value: string; hint: string }) {
  return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="text-xs font-semibold text-[#587298]">{label}</p></div><p className="mt-3 text-[26px] font-black tracking-tight text-[#102e5c]">{value}</p><p className="mt-2 text-[11px] text-[#6c86a8]">{hint}</p></article>;
}

function MarketplaceLogo({ platform, size = 40 }: { platform: "shopee" | "tiktok"; size?: number }) {
  const src = platform === "shopee" ? "/images/logo-shopee.png" : "/images/logo-tiktok.png";
  const alt = platform === "shopee" ? "Shopee" : "TikTok Shop";
  return <Image src={src} alt={alt} width={size} height={size} className="shrink-0 rounded-lg object-contain" />;
}

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ tiktok?: string }> }) {
  await requireAdmin();
  const { tiktok } = await searchParams;
  const stored = await getStoredTikTokToken();
  const status: TikTokStatus = {
    configured: isTikTokConfigured(),
    connected: Boolean(stored),
    sellerName: stored?.sellerName ?? null,
    openId: stored?.openId ?? null,
    userType: stored?.userType ?? null,
    grantedScopes: stored?.grantedScopes ? (JSON.parse(stored.grantedScopes) as string[]) : [],
    accessTokenExpiresAt: stored?.accessTokenExpiresAt?.toLocaleString("vi-VN") ?? null,
    refreshTokenExpiresAt: stored?.refreshTokenExpiresAt?.toLocaleString("vi-VN") ?? null,
  };
  const banner = tiktok ? callbacks[tiktok] : undefined;
  const connectedCount = status.connected ? 1 : 0;

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <header className="mb-4 flex items-center gap-3 lg:hidden"><span className="grid size-9 place-items-center rounded-lg bg-[#e8f8dc] text-[#60b924]"><Link2 className="size-5" /></span><h1 className="text-xl font-black text-[#11345f]">Quản lý kết nối sàn</h1></header>
    {banner && <p className={`mb-3 rounded-lg border px-4 py-3 text-sm ${banner.ok ? "border-[#b7e961]/70 bg-[#eefbe0] text-[#2f7a1c]" : "border-red-200 bg-red-50 text-red-600"}`}>{banner.text}</p>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Link2} tone="bg-[#e9f8de] text-[#64bd27]" label="Sàn đang kết nối" value={String(connectedCount)} hint={status.connected ? "TikTok Shop đang được liên kết" : "Chưa có sàn nào liên kết"} /><Metric icon={ShieldCheck} tone="bg-[#e8f1ff] text-[#2b78e9]" label="Kết nối hoạt động ổn định" value={`${connectedCount}/1`} hint={status.connected ? "TikTok token đang có hiệu lực" : "Chờ kết nối TikTok Shop"} /><Metric icon={Clock3} tone="bg-[#f4e8ff] text-[#a142db]" label="Lần đồng bộ gần nhất" value={status.connected ? "Sẵn sàng" : "—"} hint={status.accessTokenExpiresAt ?? "Chưa có dữ liệu token"} /><Metric icon={ShoppingBag} tone="bg-[#fff3dc] text-[#eda815]" label="Đơn đã đồng bộ hôm nay" value="—" hint="Cập nhật khi bạn bấm đồng bộ đơn" /></section>
    <section className="mt-3 grid gap-3 xl:grid-cols-2"><article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white"><div className="flex items-center justify-between border-b border-[#edf1f7] px-5 py-4"><div className="flex items-center gap-3"><MarketplaceLogo platform="shopee" /><div><h2 className="font-black text-[#102e5c]">Shopee</h2><p className="text-[11px] text-[#6c86a8]">Kết nối Shopee Affiliate</p></div></div><span className="rounded-full bg-[#f2f5f9] px-3 py-1 text-[11px] font-bold text-[#7188a6]">Chưa hỗ trợ</span></div><div className="p-5"><p className="text-sm leading-6 text-[#60799c]">Kết nối API Shopee chưa được cấu hình trong hệ thống hiện tại. Các liên kết Shopee vẫn hoạt động ở chế độ mock.</p><div className="mt-5 flex items-center gap-2 rounded-lg bg-[#f8fbff] p-3 text-xs text-[#587298]"><CircleAlert className="size-4 text-[#e9a414]" />Sẽ hiển thị trạng thái token và đồng bộ khi tích hợp hoàn tất.</div></div></article><article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white"><div className="flex items-center justify-between border-b border-[#edf1f7] px-5 py-4"><div className="flex items-center gap-3"><MarketplaceLogo platform="tiktok" /><div><h2 className="font-black text-[#102e5c]">TikTok Shop</h2><p className="text-[11px] text-[#6c86a8]">Affiliate Creator API</p></div></div><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${status.connected ? "bg-[#e7f7e8] text-[#208b37]" : "bg-[#fff5df] text-[#d88700]"}`}>{status.connected ? "Đang hoạt động" : "Chưa kết nối"}</span></div><div className="p-5"><TikTokIntegration status={status} /></div></article></section>
    <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]"><article className="rounded-xl border border-[#e4ebf5] bg-white"><h2 className="border-b border-[#edf1f7] px-5 py-4 text-sm font-black text-[#12355f]">Trạng thái hệ thống kết nối</h2><div className="divide-y divide-[#edf1f7] px-5"><div className="flex items-center gap-3 py-4"><span className="grid size-8 place-items-center rounded-md bg-[#fff0eb] font-black text-[#f25532]">S</span><div className="flex-1"><b className="text-sm text-[#35557e]">Shopee</b><p className="text-[11px] text-[#8298b6]">Chưa kết nối API</p></div><span className="text-xs font-bold text-[#8298b6]">—</span></div><div className="flex items-center gap-3 py-4"><span className="grid size-8 place-items-center rounded-md bg-[#111827] text-white">♪</span><div className="flex-1"><b className="text-sm text-[#35557e]">TikTok Shop</b><p className="text-[11px] text-[#8298b6]">{status.connected ? status.sellerName ?? "Creator đã kết nối" : "Chờ uỷ quyền Creator"}</p></div><span className={`flex items-center gap-1 text-xs font-bold ${status.connected ? "text-[#26943d]" : "text-[#d88700]"}`}>{status.connected ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}{status.connected ? "Hoạt động" : "Chưa kết nối"}</span></div></div></article><article className="rounded-xl border border-[#e4ebf5] bg-white"><h2 className="border-b border-[#edf1f7] px-5 py-4 text-sm font-black text-[#12355f]">Cấu hình hoa hồng theo sàn</h2><div className="space-y-3 p-5 text-sm"><p className="flex justify-between text-[#577298]"><span>Shopee</span><b className="text-[#8298b6]">Chưa thiết lập</b></p><p className="flex justify-between text-[#577298]"><span>TikTok Shop</span><b className="text-[#102e5c]">Theo hoa hồng Affiliate</b></p><p className="border-t border-[#edf1f7] pt-3 text-[11px] text-[#8298b6]">Tỷ lệ hoàn tiền cho người dùng được tính từ cấu hình CASHBACK_RATE hiện tại.</p></div></article></section>
  </main>;
}
