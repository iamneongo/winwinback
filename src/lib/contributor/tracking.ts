import "server-only";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, contributorShares, users } from "@/db/schema";

export const CONTRIBUTOR_COOKIE = "ww_contributor_share";

/** A marketing source, never an affiliate-link owner or cashback recipient. */
export async function contributorSourceFromCookie(customerId?: string) {
  const code = (await cookies()).get(CONTRIBUTOR_COOKIE)?.value;
  if (!code || !/^[a-z0-9]{8,16}$/.test(code)) return null;
  const [source] = await db.select({ id: contributorShares.id, articleId: contributorShares.articleId, contributorId: contributorShares.contributorId })
    .from(contributorShares)
    .innerJoin(users, eq(users.id, contributorShares.contributorId))
    .innerJoin(articles, eq(articles.id, contributorShares.articleId))
    .where(and(eq(contributorShares.code, code), eq(users.role, "contributor"), eq(articles.status, "published")))
    .limit(1);
  return source && source.contributorId !== customerId ? source : null;
}
