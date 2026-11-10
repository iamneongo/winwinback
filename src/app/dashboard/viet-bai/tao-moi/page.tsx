import Link from "next/link";
import { requireContributor } from "@/lib/auth/guards";
import { listManagedCategories } from "@/lib/articles/category-service";
import { ArticleEditor } from "@/app/admin/bai-viet/ArticleEditor";

export const metadata = { title: "Viết bài mới — Cộng tác viên" };
export const dynamic = "force-dynamic";
export default async function NewContributorArticlePage() {
  await requireContributor();
  const categories = await listManagedCategories();
  return <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-7"><Link href="/dashboard/viet-bai" className="text-sm font-semibold text-[#1261ed] hover:underline">← Bài viết cộng tác viên</Link><h1 className="my-5 text-2xl font-black">Viết bài mới</h1><ArticleEditor contributor categories={categories.map((c) => c.name)} initialHtml="" initialTitle="" initialDescription="" initialCategory={categories[0]?.name ?? ""} initialImageUrl="" /></main>;
}
