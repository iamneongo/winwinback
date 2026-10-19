import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listManagedCategories } from "@/lib/articles/category-service";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { ArticleEditor } from "../ArticleEditor";

export const metadata = { title: "Viết bài mới — Quản trị" };
export const dynamic = "force-dynamic";

export default async function CreateArticlePage() {
  await requireAdmin();
  const categories = await listManagedCategories();
  return <AdminPageContainer className="py-6 lg:py-7"><div className="mx-auto w-full max-w-7xl">
    <Link href="/admin/bai-viet" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-[#34527d] hover:underline"><ChevronLeft className="size-4" /> Danh sách bài viết</Link>
    <h1 className="text-[26px] font-black leading-tight text-[#11335e]">Viết bài mới</h1>
    <p className="mb-5 mt-1 text-sm text-[#58749a]">Lưu bản nháp để hoàn thiện sau, hoặc xuất bản khi nội dung đã sẵn sàng.</p>
    <ArticleEditor categories={categories.map((category) => category.name)} initialHtml="" initialTitle="" initialDescription="" initialCategory={categories[0]?.name ?? ""} initialImageUrl="" />
  </div></AdminPageContainer>;
}
