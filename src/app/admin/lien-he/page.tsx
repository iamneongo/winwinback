import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Inbox } from "lucide-react";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { requireAdmin } from "@/lib/auth/guards";
import { ContactMessagesTable } from "./ContactMessagesTable";

export const metadata = { title: "Yêu cầu liên hệ — Quản trị" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const one = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = one("q").trim().slice(0, 120);
  const status = ["new", "read", "resolved"].includes(one("status")) ? one("status") : "";
  const conditions = [];
  if (status) conditions.push(eq(contactMessages.status, status));
  if (q) {
    const pattern = `%${q}%`;
    conditions.push(or(
      ilike(contactMessages.name, pattern),
      ilike(contactMessages.email, pattern),
      ilike(contactMessages.topic, pattern),
      ilike(contactMessages.message, pattern),
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
  const requestedPage = Number(one("trang"));
  const page = Math.min(
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    Math.max(1, Math.ceil(total / PAGE_SIZE)),
  );
  const sortMap = {
    name: contactMessages.name,
    topic: contactMessages.topic,
    status: contactMessages.status,
    createdAt: contactMessages.createdAt,
  };
  const sortColumn = Object.hasOwn(sortMap, one("sort"))
    ? sortMap[one("sort") as keyof typeof sortMap]
    : contactMessages.createdAt;
  const order = one("dir") === "asc" ? asc(sortColumn) : desc(sortColumn);
  const rows = await db.select({
    id: contactMessages.id,
    name: contactMessages.name,
    email: contactMessages.email,
    topic: contactMessages.topic,
    message: contactMessages.message,
    status: contactMessages.status,
    createdAt: contactMessages.createdAt,
  }).from(contactMessages).where(where)
    .orderBy(order, desc(contactMessages.id))
    .limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);

  return <AdminPageContainer className="py-5 lg:py-7">
    <header className="mb-5">
      <h1 className="text-xl font-black text-[#11345f] lg:hidden">Liên hệ</h1>
      <p className="mt-1 text-sm text-[#60799c]">Yêu cầu gửi từ biểu mẫu liên hệ trên website.</p>
    </header>
    <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#34527d]">
      <Inbox className="size-4 shrink-0 text-[#287be5]" aria-hidden="true" />
      <span>Tổng: <b>{summary?.total ?? 0}</b></span>
      <span aria-hidden="true">·</span>
      <span>Chưa xem: <b>{summary?.newCount ?? 0}</b></span>
    </div>
    <p className="mb-2 text-xs text-[#58749a] sm:hidden">Vuốt ngang để xem đủ cột trong bảng.</p>
    <ContactMessagesTable rows={rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }))} total={total} page={page} />
  </AdminPageContainer>;
}
