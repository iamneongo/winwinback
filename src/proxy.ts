import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleSlugs } from "@/db/schema";
export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (!slug || slug.length > 160) return NextResponse.next();
  const [target] = await db.select({ slug: articles.slug }).from(articleSlugs).innerJoin(articles, eq(articles.id, articleSlugs.articleId)).where(and(eq(articleSlugs.slug, slug), eq(articles.status, "published"))).limit(1);
  if (target && target.slug !== slug) { const url = request.nextUrl.clone(); url.pathname = `/bai-viet/${target.slug}`; return NextResponse.redirect(url, 301); }
  return NextResponse.next();
}
export const config = { matcher: "/bai-viet/:slug" };
