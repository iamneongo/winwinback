import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { incrementClicks } from "@/lib/wallet";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const rows = await db
    .select()
    .from(affiliateLinks)
    .where(eq(affiliateLinks.shortCode, code))
    .limit(1);
  const link = rows[0];

  if (!link) {
    return NextResponse.redirect(new URL("/", _req.url), 302);
  }

  // Best-effort click tracking; never block the redirect.
  incrementClicks(link.id).catch(() => {});

  return NextResponse.redirect(link.affiliateUrl, 302);
}
