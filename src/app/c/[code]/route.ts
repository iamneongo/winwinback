import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { contributorShares, users } from "@/db/schema";
import { getBaseUrl } from "@/lib/baseUrl";
import { CONTRIBUTOR_COOKIE } from "@/lib/contributor/tracking";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[a-z0-9]{8,16}$/.test(code)) return new Response("Không tìm thấy link", { status: 404 });
  const [share] = await db.select({ id: contributorShares.id }).from(contributorShares)
    .innerJoin(users, eq(users.id, contributorShares.contributorId))
    .where(and(eq(contributorShares.code, code), eq(users.role, "contributor"))).limit(1);
  if (!share) return new Response("Không tìm thấy link", { status: 404 });

  const previewBot = /bot|crawler|spider|facebookexternalhit|whatsapp|telegram|discord|slack|preview/i.test(request.headers.get("user-agent") ?? "");
  if (!previewBot) await db.update(contributorShares).set({ visits: sql`${contributorShares.visits} + 1` }).where(eq(contributorShares.id, share.id));
  const response = NextResponse.redirect(new URL("/", getBaseUrl(request)), 302);
  response.headers.set("Cache-Control", "private, no-store");
  if (!previewBot) response.cookies.set(CONTRIBUTOR_COOKIE, code, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
