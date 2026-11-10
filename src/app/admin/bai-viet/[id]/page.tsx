import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailField, DetailSection, RecordDetail } from "@/components/detail/RecordDetail";
import { requireAdmin } from "@/lib/auth/guards";
import { articleContentHtml, getArticleById } from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { isUuid } from "@/lib/is-uuid";
import { platformLabel } from "@/lib/labels";
import { loadStudio } from "@/lib/articles/studio";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ApproveArticleButton } from "../ApproveArticleButton";

export const metadata = { title: "Chi tiết bài viết SEO — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const article = await getArticleById(id);
  if (!article) notFound();
  const studio = article.editorialStatus === "submitted" ? await loadStudio(id) : null;
  const [author] = article.userId ? await db.select({ name: users.name }).from(users).where(eq(users.id, article.userId)).limit(1) : [];
  return <RecordDetail layout="admin" backHref="/admin/bai-viet" backLabel="Bài viết SEO" title={studio?.document.title ?? article.title} description="Kiểm tra nội dung, dữ liệu sản phẩm và thông tin hiển thị trên trang tin tức." actions={<div className="flex flex-wrap gap-2">{article.editorialStatus === "submitted" && <ApproveArticleButton id={id} />}<Link href={`/admin/bai-viet/${article.id}/sua`} className="ww-btn-cta inline-flex rounded-lg px-4 py-2.5 text-sm font-bold">Chỉnh sửa bài viết</Link></div>}>
    <DetailSection title="Thông tin bài viết">
      <DetailField label="Trạng thái">{article.status === "published" ? "Đang hiển thị" : article.editorialStatus === "submitted" ? "Cộng tác viên gửi duyệt" : "Đã ẩn"}</DetailField>
      {author && <DetailField label="Người tạo">{author.name}</DetailField>}
      <DetailField label="Ngày tạo">{article.createdAt.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Nguồn">{article.productId.startsWith("manual:") ? "Bài tự viết" : platformLabel[article.platform]}</DetailField>
      <DetailField label="Danh mục">{article.category ?? "Chưa phân loại"}</DetailField>
      <DetailField label="Lượt xem">{article.views.toLocaleString("vi-VN")}</DetailField>
      <DetailField label="Đường dẫn"><Link href={`/bai-viet/${article.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#1261ed] hover:underline">/bai-viet/{article.slug}</Link></DetailField>
      <DetailField label="Mô tả SEO">{article.metaDescription ?? "Chưa có"}</DetailField>
    </DetailSection>
    {!article.productId.startsWith("manual:") && <DetailSection title="Sản phẩm và liên kết">
      <DetailField label="Tên sản phẩm">{article.productName ?? article.title}</DetailField>
      <DetailField label="Mã sản phẩm">{article.productId}</DetailField>
      <DetailField label="Giá">{article.price ? formatVnd(article.price) : "Chưa có"}</DetailField>
      <DetailField label="Hoàn tiền dự kiến">{article.estimatedCashback ? formatVnd(article.estimatedCashback) : "Chưa có"}</DetailField>
      <DetailField label="Link sản phẩm">{article.productUrl ? <a href={article.productUrl} target="_blank" rel="noopener noreferrer" className="text-[#1261ed] hover:underline">Mở sản phẩm</a> : "Chưa có"}</DetailField>
      <DetailField label="Mã link hoàn tiền">{article.affiliateShortCode ?? "Chưa có"}</DetailField>
    </DetailSection>}
    <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white"><h2 className="border-b border-[#e8eef6] px-4 py-3 text-sm font-bold text-[#173861] sm:px-5">{studio ? "Bản nháp chờ duyệt" : "Nội dung đã lưu"}</h2><div className="article-body max-w-none overflow-x-auto p-4 text-sm leading-7 text-[#31527d] sm:p-5" dangerouslySetInnerHTML={{ __html: studio?.document.html ?? articleContentHtml(article) }} /></section>
  </RecordDetail>;
}
