import { desc } from "drizzle-orm";
import { db } from "@/db";
import { articleMedia } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { storeArticleImage } from "@/lib/articles/media";
import { hasTrustedArticleMediaOrigin } from "@/lib/articles/media-origin";
export const runtime = "nodejs";
export async function GET() {
  if ((await getCurrentUser())?.role !== "admin") return Response.json({ error: "Không có quyền truy cập." }, { status: 403 });
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
