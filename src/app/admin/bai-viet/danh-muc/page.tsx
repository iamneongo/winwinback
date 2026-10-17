import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listManagedCategories } from "@/lib/articles/category-service";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { CategoryManager } from "./CategoryManager";

export const metadata = { title: "Danh mục bài viết — Quản trị" };
export const dynamic = "force-dynamic";

export default async function ArticleCategoriesPage() {
  await requireAdmin();
  const categories = await listManagedCategories();
  return <AdminPageContainer className="py-6 lg:py-7"><div className="w-full min-w-0">
    <header className="mb-6">
      <Link href="/admin/bai-viet" className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-[#34527d] hover:underline"><ChevronLeft className="size-4" /> Danh sách bài viết</Link>
      <h1 className="text-xl font-black leading-tight tracking-tight text-[#11335e] lg:hidden">Danh mục bài viết</h1>
      <p className="mt-1 text-sm text-[#58749a]">Thêm, đổi tên hoặc chuyển bài sang danh mục khác trước khi xóa.</p>
    </header>
    <p className="mb-2 text-xs text-[#58749a] sm:hidden">Vuốt ngang để xem đủ cột trong bảng.</p>
    <CategoryManager categories={categories} />
  </div></AdminPageContainer>;
}
