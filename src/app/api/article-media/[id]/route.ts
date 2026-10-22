import { readArticleImage } from "@/lib/articles/media";
import { db } from "@/db";
import { sql, eq } from "drizzle-orm";
import { articleMedia } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasTrustedArticleMediaOrigin } from "@/lib/articles/media-origin";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const bytes = await readArticleImage((await params).id, new URL(request.url).searchParams.get("thumb") === "1");
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if ((await getCurrentUser())?.role !== "admin" || !hasTrustedArticleMediaOrigin(request)) return Response.json({ error: "Không có quyền truy cập." }, { status: 403 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "Ảnh không hợp lệ." }, { status: 400 });
  const used = await db.execute(sql`SELECT 1 FROM articles WHERE content_html LIKE ${`%${id}%`} OR image_url LIKE ${`%${id}%`} OR seo::text LIKE ${`%${id}%`} UNION ALL SELECT 1 FROM article_drafts WHERE document::text LIKE ${`%${id}%`} UNION ALL SELECT 1 FROM article_versions WHERE document::text LIKE ${`%${id}%`} UNION ALL SELECT 1 FROM article_outros WHERE image_url LIKE ${`%${id}%`} OR links::text LIKE ${`%${id}%`} LIMIT 1`);
  if (used.rows.length) return Response.json({ error: "Ảnh đang được sử dụng trong bài, bản nháp, lịch sử hoặc mẫu cuối bài." }, { status: 409 });
  // Hide unused media from the library; retain immutable files for recovery and in-flight editors.
  await db.delete(articleMedia).where(eq(articleMedia.id, id));
  return Response.json({ ok: true });
}
