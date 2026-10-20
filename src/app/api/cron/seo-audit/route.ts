import { timingSafeEqual } from "node:crypto";
import { runSeoAudit } from "@/lib/articles/seo-audit";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("x-cron-secret") || "";
  if (!secret || secret === "change-me-cron-secret" || Buffer.byteLength(secret) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))) return new Response("Unauthorized", { status: 401 });
  try { return Response.json({ ok: true, ...await runSeoAudit() }); }
  catch { return Response.json({ ok: false, error: "SEO audit thất bại; xem log server." }, { status: 500 }); }
}
