import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { listManagedCategories } from "@/lib/articles/category-service";
import { loadStudio } from "@/lib/articles/studio";
import { articleContentHtml } from "@/lib/articles/service";
import { ArticleEditor } from "@/app/admin/bai-viet/ArticleEditor";

export const metadata = { title: "Bài viết của tôi — Cộng tác viên" };
export const dynamic = "force-dynamic";
export default async function ContributorEditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireContributor();
  const { id } = await params;
  const [article] = await db.select().from(articles).where(and(eq(articles.id, id), eq(articles.userId, user.id))).limit(1);
  if (!article || !article.productId.startsWith("manual:")) notFound();
  const studio = await loadStudio(id);
  if (!studio) notFound();
  const categories = await listManagedCategories();
  return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-7"><Link href="/contributor/bai-viet" className="text-sm font-semibold text-[#1261ed] hover:underline">← Bài viết của tôi</Link><h1 className="my-5 text-2xl font-black">{article.status === "published" ? "Bài đã xuất bản" : "Sửa bài viết"}</h1>{article.status === "published" ? <p className="rounded-xl border bg-white p-5">Bài đã được duyệt và công khai. <Link href={`/bai-viet/${article.slug}`} className="text-[#1261ed] underline">Xem bài viết</Link></p> : <ArticleEditor contributor id={id} manual initialSubmitted={article.editorialStatus === "submitted"} initialDocument={studio.document} initialRevision={studio.revision} categories={categories.map((c) => c.name)} slug={article.slug} initialHtml={articleContentHtml(article)} initialTitle={article.title} initialDescription={article.metaDescription ?? ""} initialCategory={article.category ?? ""} initialImageUrl={article.imageUrl ?? ""} />}</main>;
}
