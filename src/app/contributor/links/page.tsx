import Link from "next/link";
import { and, desc, eq, ilike } from "drizzle-orm";
import { ArrowRight, Search } from "lucide-react";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { contributorShareStats } from "@/lib/contributor/stats";
import { createContributorShareAction } from "./actions";
import { DashboardPageHeader } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = { title: "Link và QR — Cộng tác viên" };

export default async function ContributorLinksPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireContributor();
  const search = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const [shares, candidates] = await Promise.all([
    contributorShareStats(user.id),
    db.select({ id: articles.id, title: articles.title, platform: articles.platform })
      .from(articles)
      .where(and(eq(articles.status, "published"), search ? ilike(articles.title, `%${search.replace(/[%_]/g, "")}%`) : undefined))
      .orderBy(desc(articles.createdAt)).limit(12),
  ]);
  return <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-7 lg:py-8">
    <DashboardPageHeader title="Link và mã QR theo dõi" description="Chia sẻ bài sản phẩm trên Win-Win Back. Thống kê lượt mở link và đơn mua được ghi nhận từ khách truy cập; tiền hoàn vẫn thuộc về khách." />
    <section className="mb-8"><h2 className="mb-3 text-base font-bold">Link đã tạo</h2>
      {shares.length ? <div className="overflow-x-auto rounded-xl border border-[#dce8f5] bg-white"><Table><TableHeader><TableRow><TableHead>Bài viết</TableHead><TableHead>Lượt mở link</TableHead><TableHead>Đơn ghi nhận</TableHead><TableHead>Link & QR</TableHead></TableRow></TableHeader><TableBody>{shares.map((share) => <TableRow key={share.id}><TableCell className="max-w-[24rem] font-medium"><Link href={`/bai-viet/${share.slug}`} className="line-clamp-2 hover:underline">{share.title}</Link></TableCell><TableCell>{share.visits.toLocaleString("vi-VN")}</TableCell><TableCell>{share.purchases.toLocaleString("vi-VN")}</TableCell><TableCell><Link href={`/contributor/links/${share.code}`} className="font-semibold text-[#1261ed] hover:underline">Xem link và QR</Link></TableCell></TableRow>)}</TableBody></Table></div> : <p className="rounded-xl border border-dashed border-[#cbd9ec] bg-[#f8fbff] p-5 text-sm text-[#58749a]">Chưa có link theo dõi. Chọn một bài công khai bên dưới để tạo.</p>}
    </section>
    <section><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-bold">Chọn bài để chia sẻ</h2><form action="/contributor/links" className="flex min-w-0 items-center gap-2"><Input name="q" defaultValue={search} placeholder="Tìm bài viết…" aria-label="Tìm bài viết công khai" className="w-56" /><Button type="submit" variant="outline"><Search data-icon="inline-start" />Tìm</Button></form></div>
      <div className="divide-y rounded-xl border border-[#dce8f5] bg-white">{candidates.map((article) => <div key={article.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold">{article.title}</p><p className="mt-1 text-xs text-[#58749a]">Bài công khai{article.platform === "tiktok" ? " · TikTok Shop" : article.platform === "shopee" ? " · Shopee" : ""}</p></div><form action={createContributorShareAction}><input type="hidden" name="articleId" value={article.id} /><Button type="submit" variant="outline">Tạo link & QR <ArrowRight data-icon="inline-end" /></Button></form></div>)}{!candidates.length && <p className="p-5 text-sm text-[#58749a]">Không tìm thấy bài viết công khai phù hợp.</p>}</div>
    </section>
  </main>;
}
