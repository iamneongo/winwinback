import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Mail } from "lucide-react";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { requireAdmin } from "@/lib/auth/guards";
import { CONTACT_STATUS_LABELS, type ContactMessageStatus } from "@/lib/contact";
import { isUuid } from "@/lib/is-uuid";
import { updateContactMessageStatus } from "../actions";

export const metadata = { title: "Chi tiết liên hệ — Quản trị" };
export const dynamic = "force-dynamic";

export default async function AdminContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [item] = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
  if (!item) notFound();
  const status: ContactMessageStatus = item.status === "read" || item.status === "resolved" ? item.status : "new";

  return <AdminPageContainer className="py-5 lg:py-7">
    <Link href="/admin/lien-he" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#315a90] hover:text-[#1766d5]"><ArrowLeft className="size-4" /> Danh sách liên hệ</Link>
    <div className="max-w-[54rem] overflow-hidden rounded-xl border border-[#dfe8f3] bg-white">
      <div className="border-b border-[#e9eff6] px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h1 className="text-xl font-black text-[#11345f]">{item.topic}</h1><p className="mt-1 text-sm text-[#6c86a8]">Gửi lúc {item.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p></div>
          <span className="rounded-full bg-[#eef4fb] px-3 py-1 text-xs font-bold text-[#315a78]">{CONTACT_STATUS_LABELS[status]}</span>
        </div>
      </div>
      <dl className="grid gap-4 border-b border-[#e9eff6] px-5 py-5 text-sm sm:grid-cols-2 sm:px-6">
        <div><dt className="text-[#6c86a8]">Người gửi</dt><dd className="mt-1 font-semibold text-[#173861]">{item.name}</dd></div>
        <div><dt className="text-[#6c86a8]">Email phản hồi</dt><dd className="mt-1 break-all font-semibold"><a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: [Win-Win Back] ${item.topic}`)}`} className="inline-flex items-center gap-1.5 text-[#1766d5] hover:underline"><Mail className="size-4 shrink-0" />{item.email}</a></dd></div>
      </dl>
      <div className="px-5 py-5 sm:px-6"><h2 className="text-sm font-bold text-[#173861]">Nội dung</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#315277]">{item.message}</p></div>
      <div className="flex flex-wrap gap-2 border-t border-[#e9eff6] px-5 py-4 sm:px-6">
        {status === "new" && <form action={updateContactMessageStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="read" /><button type="submit" className="min-h-10 rounded-lg border border-[#dbe6f3] px-4 text-sm font-semibold text-[#315a90] hover:bg-[#f4f8fc]">Đánh dấu đã xem</button></form>}
        {status !== "resolved" && <form action={updateContactMessageStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="resolved" /><button type="submit" className="ww-btn-cta min-h-10 rounded-lg px-4 text-sm font-bold text-[#173b5e]">Đã xử lý</button></form>}
      </div>
    </div>
  </AdminPageContainer>;
}
