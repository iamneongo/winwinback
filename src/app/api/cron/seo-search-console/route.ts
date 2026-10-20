import { timingSafeEqual } from "node:crypto";
import { syncGscMetrics } from "@/lib/articles/seo-search-console";

export const dynamic = "force-dynamic";
export const maxDuration = 120;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("x-cron-secret") || "";
  if (!secret || secret === "change-me-cron-secret" || Buffer.byteLength(secret) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))) return new Response("Unauthorized", { status: 401 });
  try { return Response.json({ ok: true, ...await syncGscMetrics() }); }
  catch { return Response.json({ ok: false, error: "Đồng bộ Search Console thất bại; xem log server." }, { status: 500 }); }
}
