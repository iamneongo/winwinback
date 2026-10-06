import Image from "next/image";
import {
  CircleAlert,
  CircleCheck,
  Clock3,
  Link2,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import {
  TikTokIntegration,
  type TikTokStatus,
} from "@/components/admin/TikTokIntegration";
import { isTikTokConfigured } from "@/lib/affiliate/tiktok/config";
import { getStoredTikTokToken } from "@/lib/affiliate/tiktok/tokens";
import { getAffiliateProvider } from "@/lib/affiliate/providers";
import { isShopeeAffConfigured } from "@/lib/affiliate/shopee/config";
import { Badge } from "@/components/ui/badge";

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

function MarketplaceLogo({ platform, size = 40 }: { platform: "shopee" | "tiktok"; size?: number }) {
  const src = platform === "shopee" ? "/images/logo-shopee.png" : "/images/logo-tiktok.png";
  return <Image src={src} alt={platform === "shopee" ? "Shopee" : "TikTok Shop"} width={size} height={size} className="shrink-0 rounded-lg object-contain" />;
}

function Metric({ icon: Icon, tone, label, value, hint }: { icon: typeof Link2; tone: string; label: string; value: string; hint: string }) {
  return <article className="rounded-xl border border-[#e4ebf5] bg-white p-4"><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-full ${tone}`}><Icon className="size-5" /></span><p className="text-xs font-semibold text-[#587298]">{label}</p></div><p className="mt-3 text-[26px] font-black tracking-tight text-[#102e5c]">{value}</p><p className="mt-2 text-[11px] text-[#6c86a8]">{hint}</p></article>;
}

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ tiktok?: string }> }) {
  await requireAdmin();
  const { tiktok } = await searchParams;
  const stored = await getStoredTikTokToken();
  const tiktokStatus: TikTokStatus = {
    configured: isTikTokConfigured(),
    connected: Boolean(stored),
    sellerName: stored?.sellerName ?? null,
    openId: stored?.openId ?? null,
    userType: stored?.userType ?? null,
    grantedScopes: stored?.grantedScopes ? (JSON.parse(stored.grantedScopes) as string[]) : [],
    accessTokenExpiresAt: stored?.accessTokenExpiresAt?.toLocaleString("vi-VN") ?? null,
    refreshTokenExpiresAt: stored?.refreshTokenExpiresAt?.toLocaleString("vi-VN") ?? null,
  };
  const shopeeSelected = getAffiliateProvider("shopee").name === "shopee-aff";
  const shopeeConfigured = isShopeeAffConfigured();
  const shopeeReady = shopeeSelected && shopeeConfigured;
  const connectedCount = Number(shopeeReady) + Number(tiktokStatus.connected);
  const shopeeSetupMessage = !shopeeSelected
    ? "Chọn AFFILIATE_PROVIDER_SHOPEE=shopee-aff trong môi trường triển khai."
    : "Thiết lập SHOPEE_AFF_API_KEY và địa chỉ SHOPEE_AFF_API_URL của worker.";
  const banner = tiktok ? callbacks[tiktok] : undefined;

  return <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
    <header className="mb-4 flex items-center gap-3 lg:hidden"><span className="grid size-9 place-items-center rounded-lg bg-[#e8f8dc] text-[#60b924]"><Link2 className="size-5" /></span><h1 className="text-xl font-black text-[#11345f]">Quản lý kết nối sàn</h1></header>
    {banner && <p className={`mb-3 rounded-lg border px-4 py-3 text-sm ${banner.ok ? "border-[#b7e961]/70 bg-[#eefbe0] text-[#2f7a1c]" : "border-red-200 bg-red-50 text-red-600"}`}>{banner.text}</p>}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Link2} tone="bg-[#e9f8de] text-[#64bd27]" label="Sàn sẵn sàng" value={String(connectedCount)} hint={connectedCount ? "Đã có cấu hình tạo link affiliate" : "Chưa có sàn nào sẵn sàng tạo link"} />
      <Metric icon={ShieldCheck} tone="bg-[#e8f1ff] text-[#2b78e9]" label="Cấu hình kết nối" value={`${connectedCount}/2`} hint={shopeeReady ? "ShopeeAff gắn SubId1 theo người dùng" : "ShopeeAff chưa sẵn sàng"} />
      <Metric icon={Clock3} tone="bg-[#f4e8ff] text-[#a142db]" label="Đối soát Shopee" value={shopeeReady ? "Qua report" : "Chưa sẵn sàng"} hint="Cron đọc conversion từ worker; trạng thái này không xác nhận lịch cron đang chạy." />
      <Metric icon={ShoppingBag} tone="bg-[#fff3dc] text-[#eda815]" label="Quy tắc chi trả" value="Theo đơn" hint="Cộng ví khi đơn hoàn tất và không bị đánh dấu gian lận; hoàn tác nếu đơn bị hủy hoặc hoàn tiền." />
    </section>

    <section className="mt-3 grid gap-3 xl:grid-cols-2">
      <article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f7] px-5 py-4"><div className="flex items-center gap-3"><MarketplaceLogo platform="shopee" /><div><h2 className="font-black text-[#102e5c]">Shopee</h2><p className="text-[11px] text-[#6c86a8]">ShopeeAff browser worker</p></div></div><Badge variant={shopeeReady ? "success" : "warning"} className="px-3 py-1 text-[11px]">{shopeeReady ? "Đã cấu hình" : shopeeSelected ? "Thiếu cấu hình" : "Chưa chọn ShopeeAff"}</Badge></div>
        <div className="p-5">
          <p className="text-sm leading-6 text-[#405b7e]">Worker dùng phiên Shopee Affiliate đã đăng nhập để tạo link. Mỗi link gắn <code className="rounded bg-[#f1f5fb] px-1.5 py-0.5 text-xs text-[#35557e]">SubId1</code> theo người dùng, giúp ghép đơn trong báo cáo conversion về đúng tài khoản.</p>
          <p className="mt-3 text-sm leading-6 text-[#405b7e]">Cron đối soát đọc conversion từ worker, cập nhật trạng thái đơn và chỉ cộng hoàn tiền khi đơn hoàn tất, không bị đánh dấu gian lận. Đơn bị hủy, hoàn tiền hoặc gian lận sẽ được hoàn tác nếu đã cộng ví.</p>
          <div className={`mt-5 flex items-start gap-2 rounded-lg p-3 text-xs leading-5 ${shopeeReady ? "bg-[#f0faed] text-[#315b39]" : "bg-[#fff8e8] text-[#765215]"}`}>
            {shopeeReady ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-[#26943d]" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-[#b87908]" />}
            <span>{shopeeReady ? "ShopeeAff đã được chọn và có API key. Trạng thái này chưa kiểm tra worker hoặc lịch cron trực tiếp." : shopeeSetupMessage}</span>
          </div>
        </div>
      </article>
      <article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white"><div className="flex items-center justify-between border-b border-[#edf1f7] px-5 py-4"><div className="flex items-center gap-3"><MarketplaceLogo platform="tiktok" /><div><h2 className="font-black text-[#102e5c]">TikTok Shop</h2><p className="text-[11px] text-[#6c86a8]">Affiliate Creator API</p></div></div><Badge variant={tiktokStatus.connected ? "success" : "warning"} className="px-3 py-1 text-[11px]">{tiktokStatus.connected ? "Đang hoạt động" : "Chưa kết nối"}</Badge></div><div className="p-5"><TikTokIntegration status={tiktokStatus} /></div></article>
    </section>

    <section className="mt-3 grid gap-3 xl:grid-cols-2">
      <article className="rounded-xl border border-[#e4ebf5] bg-white"><h2 className="border-b border-[#edf1f7] px-5 py-4 text-sm font-black text-[#12355f]">Trạng thái hệ thống kết nối</h2><div className="divide-y divide-[#edf1f7] px-5"><div className="flex items-center gap-3 py-4"><MarketplaceLogo platform="shopee" size={32} /><div className="min-w-0 flex-1"><b className="text-sm text-[#35557e]">Shopee</b><p className="text-[11px] leading-5 text-[#587298]">{shopeeReady ? "ShopeeAff tạo link và cung cấp conversion cho đối soát" : "ShopeeAff chưa sẵn sàng tạo link và đối soát"}</p></div><span className={`flex shrink-0 items-center gap-1 text-xs font-bold ${shopeeReady ? "text-[#26943d]" : "text-[#a66e08]"}`}>{shopeeReady ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}{shopeeReady ? "Đã cấu hình" : "Cần thiết lập"}</span></div><div className="flex items-center gap-3 py-4"><MarketplaceLogo platform="tiktok" size={32} /><div className="flex-1"><b className="text-sm text-[#35557e]">TikTok Shop</b><p className="text-[11px] text-[#8298b6]">{tiktokStatus.connected ? tiktokStatus.sellerName ?? "Creator đã kết nối" : "Chờ uỷ quyền Creator"}</p></div><span className={`flex items-center gap-1 text-xs font-bold ${tiktokStatus.connected ? "text-[#26943d]" : "text-[#d88700]"}`}>{tiktokStatus.connected ? <CircleCheck className="size-4" /> : <CircleAlert className="size-4" />}{tiktokStatus.connected ? "Hoạt động" : "Chưa kết nối"}</span></div></div></article>
      <article className="rounded-xl border border-[#e4ebf5] bg-white"><h2 className="border-b border-[#edf1f7] px-5 py-4 text-sm font-black text-[#12355f]">Cấu hình hoa hồng theo sàn</h2><div className="space-y-3 p-5 text-sm"><p className="flex justify-between gap-3 text-[#405b7e]"><span>Shopee</span><b className={shopeeReady ? "text-[#2f7a1c]" : "text-[#587298]"}>{shopeeReady ? "Theo conversion" : "Chưa sẵn sàng"}</b></p><p className="flex justify-between gap-3 text-[#405b7e]"><span>TikTok Shop</span><b className="text-[#102e5c]">Theo hoa hồng Affiliate</b></p><p className="border-t border-[#edf1f7] pt-3 text-[11px] leading-5 text-[#587298]">Tỷ lệ hoàn tiền cho người dùng được tính từ cấu hình CASHBACK_RATE hiện tại.</p></div></article>
    </section>
  </main>;
}
