import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

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
    })
    .from(affiliateLinks)
    .where(and(eq(affiliateLinks.shortCode, code), eq(affiliateLinks.userId, user.id)))
    .limit(1);
  if (!link) return NextResponse.json({ error: "Không tìm thấy link" }, { status: 404 });
  return NextResponse.json(link, { headers: { "Cache-Control": "no-store" } });
}
