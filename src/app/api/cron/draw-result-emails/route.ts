import { timingSafeEqual } from "node:crypto";
import { processDrawResultEmails } from "@/lib/lucky-draw/result-email-queue";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("x-cron-secret") || "";
  if (!secret || secret === "change-me-cron-secret" || Buffer.byteLength(secret) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(secret), Buffer.from(supplied))) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    return Response.json({ ok: true, ...await processDrawResultEmails() });
  } catch (error) {
    console.error("[draw-email] queue processing failed", error);
    return Response.json({ ok: false, error: "Không thể xử lý hàng đợi; xem log server." }, { status: 500 });
  }
}
