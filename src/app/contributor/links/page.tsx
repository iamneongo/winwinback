import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contributorShares } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { contributorShareStats } from "@/lib/contributor/stats";
import { ShareQr } from "@/components/contributor/ShareQr";
import { DashboardPageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { createContributorShareAction } from "./actions";

export const metadata = { title: "Link và QR — Cộng tác viên" };

export default async function ContributorLinksPage() {
  const user = await requireContributor();
  const [shares, [primary], baseUrl] = await Promise.all([
    contributorShareStats(user.id),
    db.select({ code: contributorShares.code }).from(contributorShares)
      .where(and(eq(contributorShares.contributorId, user.id), isNull(contributorShares.articleId))).limit(1),
    getRequestBaseUrl(),
  ]);
  const visits = shares.reduce((sum, share) => sum + share.visits, 0);
  const purchases = shares.reduce((sum, share) => sum + share.purchases, 0);

  return <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-7 lg:py-8">
    <DashboardPageHeader title="Link và mã QR của bạn" description="Đăng bài trên Facebook, TikTok hoặc nền tảng bạn dùng, rồi chèn link hoặc mã QR này để đưa người đọc vào Win-Win Back." />
    {primary ? <ShareQr url={`${baseUrl}/c/${primary.code}`} title="Win-Win Back" /> : <div className="rounded-xl border border-[#dce8f5] bg-white p-6">
      <h2 className="text-lg font-bold">Tạo link chia sẻ cá nhân</h2>
      <p className="mt-2 text-sm text-[#58749a]">Một link dùng cho các bài đăng của bạn trên mạng xã hội. Khách nhấp vào sẽ đến trang chủ Win-Win Back.</p>
      <form action={createContributorShareAction} className="mt-5"><Button type="submit" variant="cta">Tạo link và mã QR</Button></form>
    </div>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-[#dce8f5] bg-white p-5"><p className="text-sm text-[#58749a]">Lượt mở link</p><p className="mt-2 text-2xl font-bold">{visits.toLocaleString("vi-VN")}</p></div>
      <div className="rounded-xl border border-[#dce8f5] bg-white p-5"><p className="text-sm text-[#58749a]">Đơn mua đã ghi nhận</p><p className="mt-2 text-2xl font-bold">{purchases.toLocaleString("vi-VN")}</p></div>
    </div>
    <p className="mt-4 text-sm leading-6 text-[#58749a]">Khách dùng link này rồi tự tạo link mua hàng trên Win-Win Back. Đơn được tính khi hệ thống nhận thông tin từ sàn; đơn bị hủy không tính. Tiền hoàn thuộc ví của khách.</p>
  </main>;
}
