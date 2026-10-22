import { readArticleImage } from "@/lib/articles/media";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { articleMedia } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { hasTrustedArticleMediaOrigin } from "@/lib/articles/media-origin";
import { getArticleMediaUsage } from "@/lib/articles/media-usage";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (new URL(request.url).searchParams.get("usage") === "1") {
    if ((await getCurrentUser())?.role !== "admin") return Response.json({ error: "Không có quyền truy cập." }, { status: 403 });
    if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "Ảnh không hợp lệ." }, { status: 400 });
    const [media] = await db.select().from(articleMedia).where(eq(articleMedia.id, id)).limit(1);
    if (!media) return Response.json({ error: "Không tìm thấy ảnh trong thư viện." }, { status: 404 });
    return Response.json({ media, usage: await getArticleMediaUsage(id) }, { headers: { "Cache-Control": "private, no-store" } });
  }
  try {
    const bytes = await readArticleImage(id, new URL(request.url).searchParams.get("thumb") === "1");
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if ((await getCurrentUser())?.role !== "admin" || !hasTrustedArticleMediaOrigin(request)) return Response.json({ error: "Không có quyền truy cập." }, { status: 403 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "Ảnh không hợp lệ." }, { status: 400 });
  const usage = await getArticleMediaUsage(id);
  if (usage.some((reference) => reference.blocksRemoval)) return Response.json({ error: "Ảnh vẫn đang được dùng. Kiểm tra vị trí sử dụng trước khi gỡ.", usage }, { status: 409 });
  // Hide unused media from the library; retain immutable files for recovery and in-flight editors.
  const removed = await db.delete(articleMedia).where(eq(articleMedia.id, id)).returning({ id: articleMedia.id });
  if (!removed.length) return Response.json({ error: "Không tìm thấy ảnh trong thư viện." }, { status: 404 });
  return Response.json({ ok: true });
}
