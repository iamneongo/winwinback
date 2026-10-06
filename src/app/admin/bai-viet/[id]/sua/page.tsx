import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { getArticleById, articleContentHtml } from "@/lib/articles/service";
import { ArticleEditor } from "../../ArticleEditor";

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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-7 lg:py-7">
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
        slug={a.slug}
        initialHtml={articleContentHtml(a)}
        initialTitle={a.title}
        initialDescription={a.metaDescription ?? ""}
        initialCategory={a.category ?? ""}
        initialImageUrl={a.imageUrl ?? ""}
      />
    </main>
  );
}
