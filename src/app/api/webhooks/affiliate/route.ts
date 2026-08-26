import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, affiliateLinks, orders } from "@/db/schema";
import { settleOrderCashback } from "@/lib/wallet";
import { cashbackRate } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Ingestion endpoint for affiliate order & commission postbacks.
 *
 * Auth: header `x-webhook-secret: <WEBHOOK_SECRET>`.
 * Upserts an order by externalOrderId. The order owner is resolved from the
 * `shortCode` of the link that drove the sale, or from `userEmail`.
 * When status becomes "completed", cashback is credited to the wallet (once).
 */
const payloadSchema = z.object({
  shortCode: z.string().optional(),
  userEmail: z.string().email().optional(),
  platform: z.enum(["shopee", "tiktok"]),
  externalOrderId: z.string().min(1),
  productName: z.string().min(1),
  orderAmount: z.number().int().nonnegative().default(0),
  commissionAmount: z.number().int().nonnegative().default(0),
  cashbackAmount: z.number().int().nonnegative().optional(),
  status: z
    .enum(["pending", "confirmed", "completed", "cancelled"])
    .default("pending"),
});

export async function POST(req: Request) {
  const secret = req.headers.get("x-webhook-secret");
  if (!process.env.WEBHOOK_SECRET || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const p = parsed.data;

  // Resolve the owning user + originating link.
  let userId: string | undefined;
  let linkId: string | undefined;
  if (p.shortCode) {
    const link = await db
      .select()
      .from(affiliateLinks)
      .where(eq(affiliateLinks.shortCode, p.shortCode))
      .limit(1);
    if (link[0]) {
      userId = link[0].userId;
      linkId = link[0].id;
    }
  }
  if (!userId && p.userEmail) {
    const u = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, p.userEmail.toLowerCase()))
      .limit(1);
    if (u[0]) userId = u[0].id;
  }
  if (!userId) {
    return NextResponse.json(
      { error: "Could not resolve user (shortCode or userEmail)" },
      { status: 422 },
    );
  }

  const cashback =
    p.cashbackAmount ?? Math.round(p.commissionAmount * cashbackRate);

  // Upsert by externalOrderId.
  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.externalOrderId, p.externalOrderId))
    .limit(1);

  let orderId: string;
  if (existing[0]) {
    orderId = existing[0].id;
    await db
      .update(orders)
      .set({
        status: p.status,
        productName: p.productName,
        orderAmount: p.orderAmount,
        commissionAmount: p.commissionAmount,
        cashbackAmount: cashback,
        linkId: linkId ?? undefined,
      })
      .where(eq(orders.id, orderId));
  } else {
    const inserted = await db
      .insert(orders)
      .values({
        userId,
        linkId,
        platform: p.platform,
        externalOrderId: p.externalOrderId,
        productName: p.productName,
        orderAmount: p.orderAmount,
        commissionAmount: p.commissionAmount,
        cashbackAmount: cashback,
        status: p.status,
      })
      .returning({ id: orders.id });
    orderId = inserted[0].id;
  }

  let credited = false;
  if (p.status === "completed") {
    credited = await settleOrderCashback(orderId);
  }

  return NextResponse.json({ ok: true, orderId, credited });
}
