import { desc, eq } from "drizzle-orm";
import { Link2, List } from "lucide-react";
import { db } from "@/db";
import { affiliateLinks, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { CreateLinkForm } from "@/components/dashboard/CreateLinkForm";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { BuyButton } from "@/components/dashboard/BuyButton";
import { PageHeader, Empty } from "@/components/dashboard/ui";
import { formatVnd } from "@/lib/config";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { platformLabel } from "@/lib/labels";

export const metadata = { title: "Tổng quan — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const user = await requireUser();
  const baseUrl = await getRequestBaseUrl();

  const [links, orderRows] = await Promise.all([
    db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.userId, user.id))
      .orderBy(desc(affiliateLinks.createdAt))
      .limit(20),
    db
      .select({ status: orders.status, cashbackAmount: orders.cashbackAmount })
      .from(orders)
      .where(eq(orders.userId, user.id)),
  ]);

  const pending = orderRows
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .reduce((s, o) => s + o.cashbackAmount, 0);
  const earned = orderRows
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + o.cashbackAmount, 0);

  const firstName = user.name.trim().split(" ").slice(-1)[0] || user.name;

  return (
    <>
      {/* ── Wallet hero ── */}
      <section className="ww-hero-bg relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
          <p
            className="ww-hero-enter text-sm font-medium text-white/60"
            style={{ "--delay": "0ms" } as React.CSSProperties}
          >
            Chào {firstName} 👋
          </p>
          <div
            className="ww-hero-enter mt-3"
            style={{ "--delay": "80ms" } as React.CSSProperties}
          >
            <p className="text-sm text-white/55">Số dư ví của bạn</p>
            <p className="mt-1 text-5xl font-black tracking-tight text-[#b7e961] sm:text-6xl">
              {formatVnd(user.balance)}
            </p>
          </div>
          <div
            className="ww-hero-enter mt-7 flex flex-wrap items-center gap-x-8 gap-y-3"
            style={{ "--delay": "160ms" } as React.CSSProperties}
          >
            <div>
              <p className="text-xs text-white/45">Hoàn tiền đang chờ</p>
              <p className="mt-0.5 text-xl font-bold text-white">
                {formatVnd(pending)}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" aria-hidden="true" />
            <div>
              <p className="text-xs text-white/45">Đã hoàn tiền</p>
              <p className="mt-0.5 text-xl font-bold text-white">
                {formatVnd(earned)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
        {/* ── Create link (console) ── */}
        <section data-animate>
          <PageHeader
            icon={Link2}
            title="Tạo link hoàn tiền"
            hint="Dán link sản phẩm TikTok Shop hoặc Shopee — nhận ngay link hoàn tiền."
          />
          <div
            data-animate="scale"
            className="rounded-2xl border border-white/10 bg-[#0a2f50]/60 p-3 shadow-2xl backdrop-blur-sm"
          >
            <div className="rounded-xl bg-white p-5">
              <CreateLinkForm />
              <p className="mt-3 text-xs text-gray-500">
                Sau khi tạo, bấm{" "}
                <span className="font-semibold text-[#3f8a2e]">
                  Mua trên TikTok
                </span>{" "}
                để mở app và đặt hàng. Đơn hoàn tất, tiền hoàn tự động về ví.
              </p>
            </div>
          </div>
        </section>

        {/* ── Links ── */}
        <section data-animate>
          <PageHeader
            icon={List}
            title="Link của bạn"
            hint={`${links.length} link đã tạo`}
          />
          {links.length === 0 ? (
            <Empty text="Chưa có link nào. Dán link sản phẩm ở trên để bắt đầu." />
          ) : (
            <div className="space-y-3">
              {links.map((l) => {
                const shortUrl = `${baseUrl}/go/${l.shortCode}`;
                return (
                  <div
                    key={l.id}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium">
                          {platformLabel[l.platform]}
                        </span>
                        <span className="truncate text-sm text-white/55">
                          {l.originalUrl}
                        </span>
                      </div>
                      <p className="mt-1.5 font-mono text-sm text-[#b7e961]">
                        {shortUrl}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-white/45">
                        {l.clicks} lượt click
                      </span>
                      <CopyLink value={shortUrl} />
                      <BuyButton
                        href={shortUrl}
                        platformName={platformLabel[l.platform]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
