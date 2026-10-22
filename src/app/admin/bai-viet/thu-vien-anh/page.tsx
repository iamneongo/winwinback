import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { MediaLibraryManager } from "./MediaLibraryManager";

export const metadata = { title: "Thư viện ảnh — Quản trị" };
export const dynamic = "force-dynamic";

export default async function ArticleMediaPage({ searchParams }: { searchParams: Promise<{ anh?: string }> }) {
  await requireAdmin();
  const { anh } = await searchParams;
  const initialId = typeof anh === "string" && /^[a-f0-9-]{36}$/.test(anh) ? anh : null;
  return <AdminPageContainer className="py-6 lg:py-7">
    <header className="mb-6">
      <Link href="/admin/bai-viet" className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-[#34527d] hover:underline"><ChevronLeft className="size-4" /> Danh sách bài viết</Link>
      <h1 className="text-xl font-black leading-tight tracking-tight text-[#11335e] lg:hidden">Thư viện ảnh</h1>
      <p className="mt-1 text-sm text-[#58749a]">Ảnh dùng chung cho bài viết và mẫu cuối bài. Chọn ảnh để xem nơi sử dụng trước khi gỡ.</p>
    </header>
    <MediaLibraryManager initialId={initialId} />
  </AdminPageContainer>;
}
