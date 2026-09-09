import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { isTikTokConfigured } from "@/lib/affiliate/tiktok/config";
import { getStoredTikTokToken } from "@/lib/affiliate/tiktok/tokens";
import { TikTokOrdersPanel } from "@/components/admin/TikTokOrdersPanel";
import { TikTokCollabPanel } from "@/components/admin/TikTokCollabPanel";

export const metadata = { title: "Dữ liệu đơn hàng TikTok — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function TikTokOrdersPage() {
  await requireAdmin();
  const stored = await getStoredTikTokToken();
  const configured = isTikTokConfigured();
  const connected = Boolean(stored);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 lg:px-5 lg:pt-6">
      <Link
        href="/admin/integrations"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1766e7] hover:underline"
      >
        <ArrowLeft className="size-4" /> Kết nối sàn
      </Link>

      <div className="mt-3 mb-4">
        <h1 className="text-xl font-black tracking-tight text-[#11345f] sm:text-2xl">
          Dữ liệu đơn hàng từ TikTok Shop
        </h1>
        <p className="mt-1 text-sm text-[#6681a7]">
          Đồng bộ trực tiếp đơn affiliate qua TikTok Shop Affiliate Creator API
          (order id + product id thật).
        </p>
      </div>

      {!configured ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#f0d9a6] bg-[#fff8ea] p-4 text-sm text-[#8a5a00]">
          <CircleAlert className="size-4 shrink-0" />
          Chưa cấu hình <code className="mx-1">TIKTOK_APP_KEY</code> /{" "}
          <code className="mx-1">TIKTOK_APP_SECRET</code>. Thêm vào môi trường rồi
          khởi động lại.
        </div>
      ) : !connected ? (
        <div className="rounded-xl border border-[#e4ebf5] bg-white p-5">
          <div className="flex items-center gap-2 rounded-lg bg-[#f8fbff] p-3 text-sm text-[#587298]">
            <CircleAlert className="size-4 text-[#e9a414]" />
            Chưa kết nối tài khoản Affiliate Creator. Hãy kết nối trước khi đồng
            bộ đơn.
          </div>
          <Link
            href="/admin/integrations"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1766e7] px-4 py-2 text-sm font-bold text-white hover:bg-[#1257c6]"
          >
            Đi tới kết nối TikTok Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stored?.sellerName && (
            <p className="text-sm text-[#49688f]">
              Creator đang kết nối:{" "}
              <b className="text-[#173861]">{stored.sellerName}</b>
            </p>
          )}
          <TikTokOrdersPanel />
          <TikTokCollabPanel />
        </div>
      )}
    </main>
  );
}
