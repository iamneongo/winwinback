import Link from "next/link";
import { ExternalLink, Eye, EyeOff, FileText, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/guards";
import { listArticles } from "@/lib/articles/service";
import { formatVnd } from "@/lib/config";
import { platformLabel } from "@/lib/labels";
import { toggleArticleAction, deleteArticleAction } from "./actions";

export const metadata = { title: "Bài viết SEO — Quản trị" };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  await requireAdmin();
  const rows = await listArticles(200);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e]">Bài viết SEO</h1>
        <p className="mt-1 text-sm text-[#58749a]">Bài do AI tự tạo khi khách tạo link mua hàng (mỗi sản phẩm 1 bài). Bạn có thể ẩn hoặc xoá.</p>
      </header>

      <div className="mb-4 flex items-center gap-2 text-sm text-[#34527d]">
        <FileText className="h-4 w-4 text-[#287be5]" />
        Tổng: <b>{rows.length}</b> bài · Hiển thị: <b>{rows.filter((r) => r.status === "published").length}</b> · Ẩn: <b>{rows.filter((r) => r.status === "hidden").length}</b>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white shadow-[0_5px_14px_rgba(26,73,124,0.04)]">
        <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left text-xs text-[#35537c]">
          <thead className="border-b border-[#dfe9f5] bg-[#f8fbff] text-[#234168]"><tr>
            <th className="px-5 py-3.5">Tiêu đề</th><th className="px-3 py-3.5">Sàn</th><th className="px-3 py-3.5">Giá</th><th className="px-3 py-3.5">Lượt xem</th><th className="px-3 py-3.5">Trạng thái</th><th className="px-3 py-3.5">Ngày tạo</th><th className="px-4 py-3.5 text-center">Thao tác</th>
          </tr></thead>
          <tbody className="divide-y divide-[#e8eef6]">
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-14 text-center text-[#6681a7]">Chưa có bài viết nào. Bài sẽ tự tạo khi khách tạo link mua hàng.</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} className="align-top hover:bg-[#fbfdff]">
                <td className="px-5 py-3.5"><Link href={`/bai-viet/${a.slug}`} target="_blank" className="inline-flex items-center gap-1.5 font-semibold text-[#1261ed] hover:underline"><span className="line-clamp-2 max-w-[22rem]">{a.title}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" /></Link></td>
                <td className="px-3 py-3.5">{platformLabel[a.platform] ?? a.platform}</td>
                <td className="px-3 py-3.5">{a.price ? formatVnd(a.price) : "—"}</td>
                <td className="px-3 py-3.5">{a.views}</td>
                <td className="px-3 py-3.5">{a.status === "published" ? <span className="rounded-full bg-[#e7f7ef] px-2.5 py-1 text-[11px] font-bold text-[#168146]">Hiển thị</span> : <span className="rounded-full bg-[#fee9ee] px-2.5 py-1 text-[11px] font-bold text-[#d34862]">Đã ẩn</span>}</td>
                <td className="px-3 py-3.5">{a.createdAt.toLocaleDateString("vi-VN")}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <form action={toggleArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value={a.status === "published" ? "hidden" : "published"} />
                      <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-[#d9e5f4] px-2.5 py-1.5 font-bold text-[#34527d] hover:bg-[#f6f9fd]">
                        {a.status === "published" ? <><EyeOff className="h-3.5 w-3.5" /> Ẩn</> : <><Eye className="h-3.5 w-3.5" /> Hiện</>}
                      </button>
                    </form>
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-[#f3c6d0] px-2.5 py-1.5 font-bold text-[#d34862] hover:bg-[#fee9ee]">
                        <Trash2 className="h-3.5 w-3.5" /> Xoá
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>
    </main>
  );
}
