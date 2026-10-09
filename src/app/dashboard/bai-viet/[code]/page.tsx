import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { ArticleProgress } from "@/components/dashboard/ArticleProgress";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireUser } from "@/lib/auth/guards";
import { platformLabel } from "@/lib/labels";

export const metadata = { title: "Chi tiết bài viết của bạn — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function MyArticleDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser();
  const { code } = await params;
  const [link] = await db.select().from(affiliateLinks)
    .where(and(eq(affiliateLinks.shortCode, code), eq(affiliateLinks.userId, user.id))).limit(1);
  if (!link || !link.articleStatus) notFound();
  return <RecordDetail backHref="/dashboard/bai-viet" backLabel="Bài viết của bạn" title={link.title?.trim() || `Sản phẩm trên ${platformLabel[link.platform]}`} description="Xem tiến độ, đọc và chia sẻ bài viết gắn với link hoàn tiền của bạn.">
    <DetailSection title="Link sản phẩm">
      <DetailField label="Sàn">{platformLabel[link.platform]}</DetailField>
      <DetailField label="Ngày tạo link">{link.createdAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Link hoàn tiền"><Link href={`/go/${link.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-[#1261ed] hover:underline">Mở link hoàn tiền</Link></DetailField>
      <DetailField label="Link sản phẩm"><a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="text-[#1261ed] hover:underline">Mở sản phẩm</a></DetailField>
    </DetailSection>
    <section className="rounded-xl border border-[#dfe9f5] bg-white p-4 sm:p-5"><h2 className="text-sm font-bold text-[#173861]">Bài viết</h2><ArticleProgress code={link.shortCode} initial={{ status: link.articleStatus, preview: link.articlePreview, slug: link.articleSlug, updatedAt: link.articleUpdatedAt?.toISOString() ?? null }} allowRetry showFullArticle /></section>
  </RecordDetail>;
}
