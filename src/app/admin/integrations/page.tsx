import { requireAdmin } from "@/lib/auth/guards";
import {
  TikTokIntegration,
  type TikTokStatus,
} from "@/components/admin/TikTokIntegration";
import { cardClass, sectionTitleClass } from "@/components/dashboard/ui";
import { isTikTokConfigured } from "@/lib/affiliate/tiktok/config";
import { getStoredTikTokToken } from "@/lib/affiliate/tiktok/tokens";

export const metadata = { title: "Kết nối sàn — Win-Win Back" };
export const dynamic = "force-dynamic";

const CALLBACK_MESSAGES: Record<string, { text: string; ok: boolean }> = {
  connected: { text: "Đã kết nối TikTok Shop thành công.", ok: true },
  not_creator: {
    text: "Uỷ quyền xong nhưng token không phải tài khoản Creator (user_type ≠ 1).",
    ok: false,
  },
  denied: { text: "Bạn đã từ chối uỷ quyền hoặc thiếu mã code.", ok: false },
  bad_state: {
    text: "State không hợp lệ (có thể đã hết hạn). Thử lại từ đầu.",
    ok: false,
  },
  misconfigured: { text: "Chưa cấu hình TIKTOK_APP_KEY.", ok: false },
  error: { text: "Lỗi khi đổi token. Thử lại.", ok: false },
};

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tiktok?: string; reason?: string }>;
}) {
  await requireAdmin();
  const { tiktok, reason } = await searchParams;

  const stored = await getStoredTikTokToken();
  const status: TikTokStatus = {
    configured: isTikTokConfigured(),
    connected: Boolean(stored),
    sellerName: stored?.sellerName ?? null,
    openId: stored?.openId ?? null,
    userType: stored?.userType ?? null,
    grantedScopes: stored?.grantedScopes
      ? (JSON.parse(stored.grantedScopes) as string[])
      : [],
    accessTokenExpiresAt:
      stored?.accessTokenExpiresAt?.toLocaleString("vi-VN") ?? null,
    refreshTokenExpiresAt:
      stored?.refreshTokenExpiresAt?.toLocaleString("vi-VN") ?? null,
  };

  const banner = tiktok ? CALLBACK_MESSAGES[tiktok] : undefined;

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">
          Kết nối sàn affiliate
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Kết nối tài khoản Affiliate Creator để tạo link và đồng bộ đơn hàng
        </p>
      </header>

      {banner && (
        <div
          className={`mb-5 rounded-xl border p-4 text-sm ${
            banner.ok
              ? "border-[#b7e961]/60 bg-[#eefbe0] text-[#2f7a1c]"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {banner.text}
          {!banner.ok && reason && (
            <span className="mt-1 block font-mono text-xs text-red-500/90">
              Chi tiết: {reason}
            </span>
          )}
        </div>
      )}

      <section className={cardClass}>
        <h2 className={`${sectionTitleClass} mb-4`}>
          TikTok Shop (Affiliate Creator)
        </h2>
        <TikTokIntegration status={status} />
      </section>

      <section className={`${cardClass} mt-5 opacity-70`}>
        <h2 className={sectionTitleClass}>Shopee</h2>
        <p className="mt-2 text-sm text-[#6681a7]">
          Sẽ triển khai sau. Hiện link Shopee vẫn dùng chế độ mock.
        </p>
      </section>
    </main>
  );
}
