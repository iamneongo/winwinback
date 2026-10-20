import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleSlugs, seoAuditRecords, seoAuditRuns } from "@/db/schema";
import { adaptArticleForSeo } from "./seo-engine";
import { seoSchema } from "./document";
import { articleContentHtml } from "./service";
import { checkExternalLink } from "./seo-link-check";
import { auditArticleSeo } from "./seo-audit-rules";

export async function runSeoAudit() {
  const [published, aliases] = await Promise.all([
    db.select().from(articles).where(eq(articles.status, "published")),
    db.select({ slug: articleSlugs.slug, articleId: articleSlugs.articleId }).from(articleSlugs),
  ]);
  const publishedIds = new Set(published.map((a) => a.id));
  const slugs = new Set([...published.map((a) => a.slug), ...aliases.filter((a) => publishedIds.has(a.articleId)).map((a) => a.slug)]);
  const counts = new Map<string, number>();
  for (const article of published) {
    const canonical = seoSchema.parse(article.seo ?? {}).canonical.trim();
    if (canonical) counts.set(canonical, (counts.get(canonical) || 0) + 1);
  }
  const duplicates = new Set([...counts].filter(([, count]) => count > 1).map(([url]) => url));
  const findings = published.map((article) => ({ articleId: article.id, findings: auditArticleSeo(article, articleContentHtml(article), slugs, duplicates), checkedAt: new Date() }));
  const external = new Map<string, string[]>();
  for (const article of published) {
    const links = adaptArticleForSeo({ title: article.title, slug: article.slug, html: articleContentHtml(article), intro: "", metaDescription: "", category: "", imageUrl: "", seo: seoSchema.parse(article.seo ?? {}) }).links;
    for (const link of links) {
      try {
        const url = new URL(link.href);
        if (!["http:", "https:"].includes(url.protocol) || url.hostname === "winwinback.com") continue;
        const owners = external.get(url.toString()) || [];
        owners.push(article.id); external.set(url.toString(), owners);
      } catch { /* Relative links are checked above. */ }
    }
  }
  const checked = [...external].slice(0, 200);
  for (let offset = 0; offset < checked.length; offset += 8) {
    await Promise.all(checked.slice(offset, offset + 8).map(async ([url, ownerIds]) => {
      if (await checkExternalLink(url) !== "broken") return;
      for (const ownerId of ownerIds) findings.find((record) => record.articleId === ownerId)?.findings.push({ code: "broken_external_link", message: "Liên kết ngoài trả về 404/410.", href: url.slice(0, 500) });
    }));
  }
  const now = new Date();
  findings.forEach((record) => { record.checkedAt = now; });
  await db.transaction(async (tx) => {
    // Replace the snapshot atomically so removed/hidden articles never retain stale findings.
    await tx.delete(seoAuditRecords);
    for (let offset = 0; offset < findings.length; offset += 100) await tx.insert(seoAuditRecords).values(findings.slice(offset, offset + 100));
    await tx.insert(seoAuditRuns).values({ articleCount: published.length, findingCount: findings.reduce((n, a) => n + a.findings.length, 0), completedAt: now });
  });
  return { articles: published.length, findings: findings.reduce((n, a) => n + a.findings.length, 0), checkedExternalLinks: checked.length, skippedExternalLinks: Math.max(0, external.size - checked.length), completedAt: now.toISOString() };
}

export async function getSeoAuditDashboard() {
  const [records, runs] = await Promise.all([
    db.select({ id: articles.id, slug: articles.slug, title: articles.title, findings: seoAuditRecords.findings, checkedAt: seoAuditRecords.checkedAt }).from(seoAuditRecords).innerJoin(articles, eq(articles.id, seoAuditRecords.articleId)).orderBy(desc(seoAuditRecords.checkedAt)),
    db.select().from(seoAuditRuns).orderBy(desc(seoAuditRuns.completedAt)).limit(1),
  ]);
  return { records, lastRun: runs[0] || null };
}
