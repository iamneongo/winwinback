import { count, desc, ilike } from "drizzle-orm";
import { db } from "@/db";
import { articleMedia } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { storeArticleImage } from "@/lib/articles/media";
import { hasTrustedArticleMediaOrigin } from "@/lib/articles/media-origin";
export const runtime = "nodejs";
export async function GET(request: Request) {
  if ((await getCurrentUser())?.role !== "admin") return Response.json({ error: "Không có quyền truy cập." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  if (params.get("manage") === "1") {
    const q = (params.get("q") || "").trim().slice(0, 150).replace(/[%_\\]/g, "");
    const requestedPage = Number(params.get("page"));
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 1_000_000) : 1;
    const where = q ? ilike(articleMedia.name, `%${q}%`) : undefined;
    const pageSize = 24;
    const [items, [{ total }]] = await Promise.all([
      db.select().from(articleMedia).where(where).orderBy(desc(articleMedia.createdAt), desc(articleMedia.id)).limit(pageSize).offset((page - 1) * pageSize),
      db.select({ total: count() }).from(articleMedia).where(where),
    ]);
    return Response.json({ items, total, page, pageSize }, { headers: { "Cache-Control": "private, no-store" } });
  }
  return Response.json(await db.select().from(articleMedia).orderBy(desc(articleMedia.createdAt)).limit(200), { headers: { "Cache-Control": "private, no-store" } });
}
export async function POST(request: Request) {
  if ((await getCurrentUser())?.role !== "admin") return Response.json({ error: "Không có quyền truy cập." }, { status: 403 });
  if (!hasTrustedArticleMediaOrigin(request)) return Response.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  const size = Number(request.headers.get("content-length"));
  if (!size || size > 11 * 1024 * 1024) return Response.json({ error: "Ảnh tối đa 10 MB." }, { status: 413 });
  try {
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024) return Response.json({ error: "Ảnh tối đa 10 MB." }, { status: 400 });
    return Response.json(await storeArticleImage(Buffer.from(await file.arrayBuffer()), file.name));
  } catch { return Response.json({ error: "Không lưu được ảnh. Kiểm tra định dạng ảnh và cấu hình volume lưu trữ." }, { status: 400 }); }
}
