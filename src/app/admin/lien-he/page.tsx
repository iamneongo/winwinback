import Link from "next/link";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Inbox, Search } from "lucide-react";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { requireAdmin } from "@/lib/auth/guards";
import { CONTACT_STATUS_LABELS, type ContactMessageStatus } from "@/lib/contact";

export const metadata = { title: "Yêu cầu liên hệ — Quản trị" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const statuses = ["all", "new", "read", "resolved"] as const;
type Filter = (typeof statuses)[number];

function hrefFor(filter: Filter, q: string, page = 1) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("status", filter);
  if (q) params.set("q", q);
  if (page > 1) params.set("trang", String(page));
  return `/admin/lien-he${params.size ? `?${params}` : ""}`;
}

const statusTone: Record<ContactMessageStatus, string> = {
  new: "bg-[#e8f4ff] text-[#1863a8]",
  read: "bg-[#eef2f8] text-[#526b90]",
  resolved: "bg-[#e8f7e9] text-[#18753b]",
};

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const requestedStatus = one("status");
  const filter: Filter = statuses.includes(requestedStatus as Filter) ? requestedStatus as Filter : "all";
  const q = one("q").trim().slice(0, 120);
  const requestedPage = Number(one("trang"));
  const conditions = [];
  if (filter !== "all") conditions.push(eq(contactMessages.status, filter));
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(
      ilike(contactMessages.name, pattern),
      ilike(contactMessages.email, pattern),
      ilike(contactMessages.topic, pattern),
    ));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const [[summary], [matching]] = await Promise.all([
    db.select({
      total: count(),
      newCount: sql<number>`count(*) filter (where ${contactMessages.status} = 'new')::int`,
    }).from(contactMessages),
    db.select({ total: count() }).from(contactMessages).where(where),
  ]);
  const total = matching?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, pages);
  const rows = await db.select({
    id: contactMessages.id,
    name: contactMessages.name,
    email: contactMessages.email,
    topic: contactMessages.topic,
    message: contactMessages.message,
    status: contactMessages.status,
    createdAt: contactMessages.createdAt,
  }).from(contactMessages).where(where)
    .orderBy(desc(contactMessages.createdAt), desc(contactMessages.id))
    .limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <AdminPageContainer className="py-5 lg:py-7">
    <header className="mb-5">
      <h1 className="text-xl font-black text-[#11345f] lg:hidden">Yêu cầu liên hệ</h1>
      <p className="mt-1 text-sm text-[#60799c]">Yêu cầu gửi từ biểu mẫu liên hệ trên website.</p>
    </header>
    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[#34527d]">
      <span className="inline-flex items-center gap-2"><Inbox className="size-4 text-[#287be5]" /> Tổng: <b>{summary?.total ?? 0}</b></span>
      <span aria-hidden="true">·</span>
      <span>Chưa xem: <b>{summary?.newCount ?? 0}</b></span>
    </div>
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {statuses.map((status) => <Link key={status} href={hrefFor(status, q)} aria-current={filter === status ? "page" : undefined} className={`inline-flex min-h-9 items-center rounded-lg px-3 text-sm font-semibold transition-colors ${filter === status ? "bg-[#e4f5dc] text-[#176b34]" : "text-[#456489] hover:bg-[#f0f5fb]"}`}>
        {status === "all" ? "Tất cả" : CONTACT_STATUS_LABELS[status]}
      </Link>)}
    </div>
    <form action="/admin/lien-he" method="get" className="mb-4 flex max-w-[32rem] gap-2">
      {filter !== "all" && <input type="hidden" name="status" value={filter} />}
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#dbe6f3] bg-white px-3 text-[#7891b0]">
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="sr-only">Tìm kiếm yêu cầu liên hệ</span>
        <input name="q" defaultValue={q} maxLength={120} placeholder="Tên, email hoặc chủ đề..." className="h-10 min-w-0 w-full bg-transparent text-sm text-[#173861] outline-none placeholder:text-[#7891b0]" />
      </label>
      <button type="submit" className="min-h-10 rounded-lg border border-[#dbe6f3] bg-white px-4 text-sm font-semibold text-[#315a90] hover:bg-[#f4f8fc]">Tìm</button>
    </form>
    <section className="overflow-hidden rounded-xl border border-[#dfe8f3] bg-white" aria-label="Danh sách yêu cầu liên hệ">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[#f7faff] text-xs font-bold text-[#315277]"><tr>
            <th className="px-4 py-3">Người gửi</th><th className="px-4 py-3">Chủ đề</th><th className="px-4 py-3">Nội dung</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Trạng thái</th>
          </tr></thead>
          <tbody className="divide-y divide-[#e9eff6]">
            {rows.map((row) => {
              const status: ContactMessageStatus = row.status === "read" || row.status === "resolved" ? row.status : "new";
              return <tr key={row.id} className="hover:bg-[#f8fbfe]">
                <td className="px-4 py-3"><Link href={`/admin/lien-he/${row.id}`} className="font-bold text-[#1766d5] hover:underline">{row.name}</Link><span className="mt-0.5 block text-xs text-[#7891b0]">{row.email}</span></td>
                <td className="px-4 py-3 text-[#315277]">{row.topic}</td>
                <td className="max-w-[20rem] truncate px-4 py-3 text-[#526f8e]">{row.message}</td>
                <td className="whitespace-nowrap px-4 py-3 text-[#526f8e]">{row.createdAt.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[status]}`}>{CONTACT_STATUS_LABELS[status]}</span></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-[#6c86a8]">{q || filter !== "all" ? "Không có yêu cầu phù hợp với bộ lọc." : "Chưa có yêu cầu liên hệ nào. Khi khách gửi biểu mẫu, yêu cầu sẽ xuất hiện tại đây."}</div>}
      <div className="flex items-center justify-between gap-3 border-t border-[#e9eff6] px-4 py-3 text-xs text-[#6c86a8]">
        <span>{total === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)}`} / {total} yêu cầu</span>
        <div className="flex gap-2">
          {page > 1 && <Link href={hrefFor(filter, q, page - 1)} className="rounded-lg border border-[#dbe6f3] px-3 py-2 hover:bg-[#f4f8fc]">Trước</Link>}
          {page < pages && <Link href={hrefFor(filter, q, page + 1)} className="rounded-lg border border-[#dbe6f3] px-3 py-2 hover:bg-[#f4f8fc]">Sau</Link>}
        </div>
      </div>
    </section>
  </AdminPageContainer>;
}
