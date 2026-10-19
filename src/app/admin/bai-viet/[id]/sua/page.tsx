import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getArticleById, articleContentHtml } from "@/lib/articles/service";
import { ArticleEditor } from "../../ArticleEditor";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { listManagedCategories } from "@/lib/articles/category-service";
import { loadStudio } from "@/lib/articles/studio";

export const metadata = { title: "Sửa bài viết — Quản trị" };
export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const a = await getArticleById(id);
  if (!a) notFound();
  const studio = await loadStudio(id);
  const categories = await listManagedCategories();

  return (
    <AdminPageContainer className="py-6 lg:py-7">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href="/admin/bai-viet"
          className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-[#34527d] hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Danh sách bài viết
        </Link>
        <h1 className="text-[26px] font-black leading-tight tracking-tight text-[#11335e]">
          Sửa bài viết
        </h1>
        <p className="mb-5 mt-1 text-sm text-[#58749a]">{a.title}</p>
        <ArticleEditor
          id={a.id}
          initialDocument={studio?.document}
          initialRevision={studio?.revision}
          initialPublished={a.status === "published"}
          slug={a.slug}
          categories={categories.map((category) => category.name)}
          initialHtml={articleContentHtml(a)}
          initialTitle={a.title}
          initialDescription={a.metaDescription ?? ""}
          initialCategory={a.category ?? ""}
          initialImageUrl={a.imageUrl ?? ""}
        />
      </div>
    </AdminPageContainer>
  );
}
