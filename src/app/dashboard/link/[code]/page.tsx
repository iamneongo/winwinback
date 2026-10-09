import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, MousePointerClick } from "lucide-react";
import { db } from "@/db";
import { affiliateLinks, orders } from "@/db/schema";
import { requireUser } from "@/lib/auth/guards";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { formatVnd } from "@/lib/config";
import { orderStatusLabel, platformLabel } from "@/lib/labels";
import { RecordDetail, DetailField, DetailSection } from "@/components/detail/RecordDetail";
import { CopyLink } from "@/components/dashboard/CopyLink";

export const metadata = { title: "Chi tiết link — Win-Win Back" };
export const dynamic = "force-dynamic";

const articleStatusLabel: Record<string, string> = {
  queued: "Đang chuẩn bị",
  fetching_product: "Đang lấy thông tin sản phẩm",
  generating: "AI đang viết bài",
  published: "Bài viết đã sẵn sàng",
  failed: "Tạo bài viết chưa thành công",
  unavailable: "Bài viết hiện không công khai",
};

export default async function AffiliateLinkDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser();
  const { code } = await params;
  const [link] = await db.select().from(affiliateLinks)
    .where(and(eq(affiliateLinks.shortCode, code), eq(affiliateLinks.userId, user.id)))
    .limit(1);
  if (!link) notFound();

  const [relatedOrders, baseUrl] = await Promise.all([
    db.select().from(orders)
      .where(and(eq(orders.linkId, link.id), eq(orders.userId, user.id)))
      .orderBy(desc(orders.orderedAt))
      .limit(50),
    getRequestBaseUrl(),
  ]);
  const shareUrl = `${baseUrl}/go/${link.shortCode}`;
  const articleHref = link.articleSlug ? `/bai-viet/${link.articleSlug}` : null;

  return <RecordDetail
    backHref="/dashboard#link-cua-ban"
    backLabel="Link của bạn"
    title={link.title?.trim() || "Link sản phẩm"}
    description="Chi tiết lượt truy cập, bài viết và đơn hàng được ghi nhận từ link này."
    actions={<a href={`/go/${link.shortCode}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#a9e75e] px-4 py-2.5 text-sm font-bold text-[#173b5e] transition hover:bg-[#b7e961]">Mở link <ArrowUpRight className="size-4" /></a>}
  >
    <DetailSection title="Thông tin link">
      <DetailField label="Sàn mua sắm">{platformLabel[link.platform]}</DetailField>
      <DetailField label="Ngày tạo">{link.createdAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Mã link">{link.shortCode}</DetailField>
      <DetailField label="Lượt bấm"><span className="inline-flex items-center gap-1.5"><MousePointerClick className="size-4 text-[#287be5]" />{link.clicks}</span></DetailField>
      <DetailField label="Link sản phẩm gốc"><a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-[#1261ed] hover:underline">{link.originalUrl}</a></DetailField>
      <DetailField label="Link chia sẻ"><span className="flex flex-wrap items-center gap-2"><a href={`/go/${link.shortCode}`} target="_blank" rel="noopener noreferrer" className="break-all text-[#1261ed] hover:underline">{shareUrl}</a><CopyLink value={shareUrl} /></span></DetailField>
    </DetailSection>

    <DetailSection title="Bài viết từ link này">
      <DetailField label="Trạng thái bài viết">{link.articleStatus ? articleStatusLabel[link.articleStatus] ?? link.articleStatus : "Chưa tạo bài viết"}</DetailField>
      <DetailField label="Cập nhật lần cuối">{link.articleUpdatedAt?.toLocaleString("vi-VN") ?? "—"}</DetailField>
      {link.articlePreview && <div className="sm:col-span-2"><DetailField label="Nội dung xem trước">{link.articlePreview}</DetailField></div>}
      {articleHref && <div className="sm:col-span-2"><Link href={articleHref} className="text-sm font-bold text-[#1261ed] hover:underline">Mở bài viết liên quan <ArrowUpRight className="ml-1 inline size-4" /></Link></div>}
    </DetailSection>

    <DetailSection title={`Đơn hàng được ghi nhận (${relatedOrders.length})`}>
      {relatedOrders.length === 0 ? <p className="text-sm font-medium text-[#58749a]">Chưa có đơn hàng nào được ghép với link này.</p> : <div className="sm:col-span-2 -mx-1 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[#e8eef6] text-xs text-[#58749a]"><tr><th className="px-2 py-2">Mã đơn</th><th className="px-2 py-2">Sản phẩm</th><th className="px-2 py-2">Trạng thái</th><th className="px-2 py-2">Tiền hoàn</th><th className="px-2 py-2">Ngày mua</th></tr></thead><tbody className="divide-y divide-[#edf1f7]">{relatedOrders.map((order) => <tr key={order.id}><td className="px-2 py-3"><Link href={`/dashboard/don-hang/${order.id}`} className="font-semibold text-[#1261ed] hover:underline">{order.externalOrderId}</Link></td><td className="max-w-[16rem] truncate px-2 py-3">{order.productName}</td><td className="px-2 py-3">{orderStatusLabel[order.status]}</td><td className="px-2 py-3 font-bold text-[#168146]">{formatVnd(order.cashbackAmount)}</td><td className="whitespace-nowrap px-2 py-3">{order.orderedAt.toLocaleDateString("vi-VN")}</td></tr>)}</tbody></table></div>}
    </DetailSection>
  </RecordDetail>;
}
