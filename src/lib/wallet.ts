import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, orders, walletTransactions } from "@/db/schema";
import { notifyCashbackCredited } from "@/lib/notify";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type WalletTxType = "cashback" | "withdrawal" | "refund" | "adjustment";

/**
 * Record a wallet movement atomically: lock the user row, compute the new
 * balance, append a ledger entry (with running balanceAfter) and update the
 * cached balance. `amount` is signed (positive = credit, negative = debit).
 * Returns the new balance.
 */
export async function recordWalletTx(
  tx: Tx,
  input: {
    userId: string;
    type: WalletTxType;
    amount: number;
    orderId?: string;
    note?: string;
  },
): Promise<number> {
  const locked = await tx
    .select({ balance: users.balance })
    .from(users)
    .where(eq(users.id, input.userId))
    .for("update")
    .limit(1);

  const current = locked[0]?.balance ?? 0;
  const next = current + input.amount;
  if (next < 0) {
    throw new Error("INSUFFICIENT_BALANCE");
  }

  await tx.insert(walletTransactions).values({
    userId: input.userId,
    type: input.type,
    amount: input.amount,
    balanceAfter: next,
    orderId: input.orderId,
    note: input.note,
  });

  await tx
    .update(users)
    .set({ balance: next })
    .where(eq(users.id, input.userId));

  return next;
}

/**
 * Credit an order's cashback to the owner's wallet exactly once. Idempotent:
 * guarded by orders.cashbackCreditedAt. Safe to call whenever an order becomes
 * "completed" (from webhook or admin).
 */
export async function settleOrderCashback(orderId: string): Promise<boolean> {
  const credited = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .for("update")
      .limit(1);

    const order = rows[0];
    if (!order) return null;
    if (order.status !== "completed") return null;
    if (order.cashbackCreditedAt) return null;
    if (order.cashbackAmount <= 0) {
      await tx
        .update(orders)
        .set({ cashbackCreditedAt: new Date() })
        .where(eq(orders.id, orderId));
      return null;
    }

    await recordWalletTx(tx, {
      userId: order.userId,
      type: "cashback",
      amount: order.cashbackAmount,
      orderId: order.id,
      note: `Hoàn tiền đơn ${order.externalOrderId}`,
    });

    await tx
      .update(orders)
      .set({ cashbackCreditedAt: new Date() })
      .where(eq(orders.id, orderId));

    return {
      userId: order.userId,
      externalOrderId: order.externalOrderId,
      amount: order.cashbackAmount,
    };
  });

  if (!credited) return false;

  // Best-effort notification; never block or fail the settlement.
  void notifyCashbackCredited(credited).catch(() => {});
  return true;
}

/**
 * Record a /go/<code> visit: append a click row (for order→user attribution)
 * and bump the link's click counter. Best effort — never blocks the redirect.
 */
export async function recordLinkClick(link: {
  id: string;
  userId: string;
  platform: "shopee" | "tiktok";
  productId: string | null;
}): Promise<void> {
  const { affiliateLinks, linkClicks } = await import("@/db/schema");
  await Promise.all([
    db.insert(linkClicks).values({
      linkId: link.id,
      userId: link.userId,
      platform: link.platform,
      productId: link.productId,
    }),
    db
      .update(affiliateLinks)
      .set({ clicks: sql`${affiliateLinks.clicks} + 1` })
      .where(eq(affiliateLinks.id, link.id)),
  ]);
}
