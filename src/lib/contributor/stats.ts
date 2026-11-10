import "server-only";
import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks, articles, contributorShares, orders } from "@/db/schema";

export async function contributorShareStats(contributorId: string) {
  const [shares, purchases] = await Promise.all([
    db.select({ id: contributorShares.id, code: contributorShares.code, articleId: contributorShares.articleId, title: articles.title, slug: articles.slug, visits: contributorShares.visits, createdAt: contributorShares.createdAt })
      .from(contributorShares)
      .leftJoin(articles, eq(articles.id, contributorShares.articleId))
      .where(eq(contributorShares.contributorId, contributorId))
      .orderBy(desc(contributorShares.createdAt)),
    db.select({ shareId: affiliateLinks.contributorShareId, total: count(orders.id) })
      .from(affiliateLinks)
      .innerJoin(contributorShares, eq(contributorShares.id, affiliateLinks.contributorShareId))
      .innerJoin(orders, and(eq(orders.linkId, affiliateLinks.id), ne(orders.status, "cancelled")))
      .where(and(eq(contributorShares.contributorId, contributorId), eq(affiliateLinks.userId, orders.userId), ne(affiliateLinks.userId, contributorId)))
      .groupBy(affiliateLinks.contributorShareId),
  ]);
  const totals = new Map(purchases.map((row) => [row.shareId, row.total]));
  return shares.map((share) => ({ ...share, purchases: totals.get(share.id) ?? 0 }));
}
