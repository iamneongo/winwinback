import Link from "next/link";
import { asc, desc, eq, gte, sql, and } from "drizzle-orm";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { requireAdmin } from "@/lib/auth/guards";
import { getSeoAuditDashboard } from "@/lib/articles/seo-audit";
import { db } from "@/db";
import { articleCategories, seoAiUsage, seoSearchConsole, seoSearchMetrics, seoTemplates } from "@/db/schema";
import { SeoDashboard } from "./SeoDashboard";

export const metadata = { title: "Tổng quan SEO — Quản trị" };
export const dynamic = "force-dynamic";
export default async function SeoDashboardPage() {
  await requireAdmin();
  const [connection] = await db.select({ property: seoSearchConsole.property, syncedAt: seoSearchConsole.syncedAt }).from(seoSearchConsole).limit(1);
  const since = new Date(); since.setUTCDate(since.getUTCDate() - 16);
  const [audit, templates, categories, metrics, trend, usage] = await Promise.all([
    getSeoAuditDashboard(),
    db.select().from(seoTemplates).orderBy(asc(seoTemplates.key)),
    db.select({ name: articleCategories.name }).from(articleCategories).orderBy(asc(articleCategories.name)),
    connection ? db.select().from(seoSearchMetrics).where(eq(seoSearchMetrics.property, connection.property)).orderBy(desc(seoSearchMetrics.date)).limit(1000) : Promise.resolve([]),
    connection ? db.select({ date: seoSearchMetrics.date, clicks: sql<number>`sum(${seoSearchMetrics.clicks})::int`, impressions: sql<number>`sum(${seoSearchMetrics.impressions})::int`, weightedPosition: sql<number>`coalesce(sum((${seoSearchMetrics.position})::numeric * ${seoSearchMetrics.impressions}) / nullif(sum(${seoSearchMetrics.impressions}), 0), 0)::float` }).from(seoSearchMetrics).where(and(eq(seoSearchMetrics.property, connection.property), gte(seoSearchMetrics.date, since.toISOString().slice(0, 10)))).groupBy(seoSearchMetrics.date).orderBy(desc(seoSearchMetrics.date)) : Promise.resolve([]),
    db.select({ task: seoAiUsage.task, status: seoAiUsage.status, promptTokens: seoAiUsage.promptTokens, completionTokens: seoAiUsage.completionTokens, estimatedCostUsd: seoAiUsage.estimatedCostUsd, createdAt: seoAiUsage.createdAt }).from(seoAiUsage).orderBy(desc(seoAiUsage.createdAt)).limit(100),
  ]);
  return <AdminPageContainer className="py-6 lg:py-7"><div className="space-y-6">
    <div><Link href="/admin/bai-viet" className="text-sm text-[#34527d] hover:underline">← Bài viết</Link><h1 className="mt-2 text-2xl font-black text-[#11335e]">Tổng quan SEO</h1><p className="mt-1 text-sm text-[#58749a]">Kiểm tra nội dung, quản lý mẫu và xem dữ liệu tìm kiếm đã đồng bộ.</p></div>
    <SeoDashboard audit={audit.records.map((row) => ({ ...row, checkedAt: row.checkedAt.toISOString() }))} lastRun={audit.lastRun ? { articleCount: audit.lastRun.articleCount, findingCount: audit.lastRun.findingCount, completedAt: audit.lastRun.completedAt.toISOString() } : null} templates={templates.map((t) => ({ key: t.key, titlePattern: t.titlePattern, descriptionPattern: t.descriptionPattern }))} categories={categories.map((c) => c.name)} connection={connection ? { property: connection.property, syncedAt: connection.syncedAt?.toISOString() || null } : null} metrics={metrics.map((m) => ({ date: m.date, page: m.page, clicks: m.clicks, impressions: m.impressions, ctr: Number(m.ctr), position: Number(m.position) }))} trend={trend} usage={usage.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} oauthConfigured={Boolean(process.env.GSC_CLIENT_ID && process.env.GSC_CLIENT_SECRET && process.env.GSC_TOKEN_ENCRYPTION_KEY)} />
  </div></AdminPageContainer>;
}
