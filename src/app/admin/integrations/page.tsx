import Image from "next/image";
import {
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
  };
  const shopeeSelected = getAffiliateProvider("shopee").name === "shopee-aff";
  const shopeeConfigured = isShopeeAffConfigured();
  const shopeeReady = shopeeSelected && shopeeConfigured;
  const connectedCount = Number(shopeeReady) + Number(tiktokStatus.connected);
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
      </article>
      <article className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white"><div className="flex items-center justify-between border-b border-[#edf1f7] px-5 py-4"><div className="flex items-center gap-3"><MarketplaceLogo platform="tiktok" /><div><h2 className="font-black text-[#102e5c]">TikTok Shop</h2><p className="text-[11px] text-[#6c86a8]">Affiliate Creator API</p></div></div><Badge variant={tiktokStatus.connected ? "success" : "warning"} className="px-3 py-1 text-[11px]">{tiktokStatus.connected ? "Đang hoạt động" : "Chưa kết nối"}</Badge></div><div className="p-5"><TikTokIntegration status={tiktokStatus} /></div></article>
    </section>

  </main>;
}
