import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks, articles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { articleContentHtml } from "@/lib/articles/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  const { code } = await params;
  const [link] = await db
    .select({
      status: affiliateLinks.articleStatus,
      preview: affiliateLinks.articlePreview,
      slug: affiliateLinks.articleSlug,
      updatedAt: affiliateLinks.articleUpdatedAt,
      platform: affiliateLinks.platform,
      productId: affiliateLinks.productId,
    })
    .from(affiliateLinks)
    .where(and(eq(affiliateLinks.shortCode, code), eq(affiliateLinks.userId, user.id)))
    .limit(1);
  if (!link) return NextResponse.json({ error: "Không tìm thấy link" }, { status: 404 });
  const [article] = link.status === "published" && link.productId
    ? await db.select().from(articles).where(and(
        eq(articles.platform, link.platform),
        eq(articles.productId, link.productId),
        eq(articles.status, "published"),
      )).limit(1)
    : [];
  return NextResponse.json({
    status: link.status === "published" && !article ? "unavailable" : link.status,
    preview: link.preview,
    slug: article?.slug ?? (link.status === "published" ? null : link.slug),
    updatedAt: link.updatedAt,
    articleTitle: article?.title ?? null,
    articleHtml: article ? articleContentHtml(article) : null,
  }, { headers: { "Cache-Control": "no-store" } });
}
