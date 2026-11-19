import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

function valid(request: Request): string | null {
  const url = new URL(request.url);
  const id = url.searchParams.get("uid") || "";
  const signature = url.searchParams.get("sig") || "";
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || !/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/i.test(signature)) return null;
  const expected = createHmac("sha256", secret).update(`draw-email:${id}`).digest("hex");
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? id : null;
}

export async function GET(request: Request) {
  if (!valid(request)) return new Response("Liên kết không hợp lệ", { status: 400 });
  const url = new URL(request.url);
  const action = `${url.pathname}${url.search}`.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return new Response(`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Ngừng nhận email kết quả</title><body style="font-family:system-ui;max-width:440px;margin:80px auto;padding:24px;color:#173861"><h1>Ngừng nhận email kết quả rút thăm?</h1><p>Bạn vẫn có thể xem kết quả trong tài khoản.</p><form method="post" action="${action}"><button style="padding:12px 20px;cursor:pointer">Xác nhận</button></form></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const id = valid(request);
  if (!id) return new Response("Liên kết không hợp lệ", { status: 400 });
  await db.update(users).set({ notifyDrawEmail: false }).where(eq(users.id, id));
  return new Response("Đã tắt email kết quả rút thăm. Bạn có thể bật lại trong Cài đặt tài khoản.", { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
