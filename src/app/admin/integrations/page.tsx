import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { AppHeader } from "@/components/dashboard/AppHeader";
import {
  TikTokIntegration,
  type TikTokStatus,
} from "@/components/admin/TikTokIntegration";
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
  const admin = await requireAdmin();
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
    <div className="min-h-screen bg-[#082b4b] text-white">
      <AppHeader name={admin.name} role={admin.role} />
      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">Kết nối sàn affiliate</h1>
          <Link
            href="/admin"
            className="text-sm text-white/60 underline hover:text-white"
          >
            ← Về Quản trị
          </Link>
        </div>

        {banner && (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              banner.ok
                ? "border-[#b7e961]/30 bg-[#b7e961]/10 text-[#b7e961]"
                : "border-red-400/30 bg-red-500/10 text-red-200"
            }`}
          >
            {banner.text}
            {!banner.ok && reason && (
              <span className="mt-1 block font-mono text-xs text-red-300/90">
                Chi tiết: {reason}
              </span>
            )}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">
              TikTok Shop (Affiliate Creator)
            </h2>
          </div>
          <TikTokIntegration status={status} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 opacity-70">
          <h2 className="text-lg font-bold text-white">Shopee</h2>
          <p className="mt-2 text-sm text-white/50">
            Sẽ triển khai sau. Hiện link Shopee vẫn dùng chế độ mock.
          </p>
        </section>
      </main>
    </div>
  );
}
