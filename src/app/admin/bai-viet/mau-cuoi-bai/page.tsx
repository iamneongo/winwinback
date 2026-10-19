import { requireAdmin } from "@/lib/auth/guards";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { OutroManager } from "./OutroManager";
import { listOutrosAction } from "../studio-actions";
export const dynamic = "force-dynamic";
export default async function OutroPage() {
  await requireAdmin();
  return <AdminPageContainer className="py-6"><h1 className="mb-2 text-2xl font-semibold">Mẫu cuối bài</h1><p className="mb-6 text-sm text-[#526f8e]">Thông tin thương hiệu và CTA dùng chung; dữ liệu giá và hoàn tiền vẫn lấy từ từng bài.</p><OutroManager initial={await listOutrosAction()} /></AdminPageContainer>;
}
