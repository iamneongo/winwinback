import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { loadStudio, getOutro } from "@/lib/articles/studio";
import { RealArticleDetail } from "@/components/sections/RealArticleDetail";
export const dynamic = "force-dynamic";
export const metadata = { title: "Xem trước bản nháp", robots: { index: false, follow: false } };
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const studio = await loadStudio((await params).id);
  if (!studio) notFound();
  const d = studio.document;
  return <><p className="bg-amber-50 p-4 text-center text-sm text-amber-900">Xem trước bản đã lưu · Chỉ admin truy cập · Chưa thay đổi bài công khai</p><RealArticleDetail article={{ ...studio.article, title: d.title, intro: d.intro, metaDescription: d.metaDescription, imageUrl: d.imageUrl, seo: d.seo }} related={[]} buyHref={null} platform="Bài viết" category={d.category} contentHtml={d.html} outro={await getOutro(d.seo.outro)} /></>;
}
