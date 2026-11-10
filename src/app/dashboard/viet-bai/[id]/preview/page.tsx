import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { loadStudio, getOutro } from "@/lib/articles/studio";
import { RealArticleDetail } from "@/components/sections/RealArticleDetail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Xem trước bản nháp", robots: { index: false, follow: false } };
export default async function ContributorPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireContributor();
  const { id } = await params;
  const [article] = await db.select().from(articles).where(and(eq(articles.id, id), eq(articles.userId, user.id))).limit(1);
  if (!article || !article.productId.startsWith("manual:")) notFound();
  const studio = await loadStudio(id);
  if (!studio) notFound();
  const d = studio.document;
  return <><p className="bg-amber-50 p-4 text-center text-sm text-amber-900">Xem trước bản đã lưu · Chỉ bạn và admin truy cập</p><RealArticleDetail article={{ ...article, title: d.title, intro: d.intro, metaDescription: d.metaDescription, imageUrl: d.imageUrl, seo: d.seo }} related={[]} buyHref={null} platform="Bài viết" category={d.category} contentHtml={d.html} outro={await getOutro(d.seo.outro)} /></>;
}
