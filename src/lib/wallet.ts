import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { users, orders, walletTransactions } from "@/db/schema";
import { notifyCashbackCredited, notifyCashbackReversed } from "@/lib/notify";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type WalletTxType = "cashback" | "withdrawal" | "refund" | "adjustment" | "reward" | "prize";

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

    // Every completed order funds the lucky draw (10% of commission) and mints
    // one lottery ticket — exactly once, inside the same settlement guard.
    // Dynamic import avoids a wallet <-> lucky-draw import cycle.
    const { contributeAndIssueTicket } = await import("@/lib/lucky-draw/service");
    await contributeAndIssueTicket(tx, {
      id: order.id,
      userId: order.userId,
      externalOrderId: order.externalOrderId,
      commissionAmount: order.commissionAmount,
    });

    if (order.cashbackAmount > 0) {
      await recordWalletTx(tx, {
        userId: order.userId,
        type: "cashback",
        amount: order.cashbackAmount,
        orderId: order.id,
        note: `Hoàn tiền đơn ${order.externalOrderId}`,
      });
    }

    await tx
      .update(orders)
      .set({ cashbackCreditedAt: new Date() })
      .where(eq(orders.id, orderId));

    return order.cashbackAmount > 0
      ? {
          userId: order.userId,
          orderId: order.id,
          externalOrderId: order.externalOrderId,
          amount: order.cashbackAmount,
        }
      : null;
  });

  if (!credited) return false;

  // Invitation bonuses are independent from cashback settlement. A failure
  // here must never undo or block the customer's earned order cashback; cron
  // reconciliation retries eligible orders.
  const { settleReferralReward } = await import("@/lib/missions/referral");
  await settleReferralReward(orderId).catch((error: unknown) => {
    console.error("Referral reward settlement failed", error);
  });

  // Best-effort notification; never block or fail the settlement.
  await notifyCashbackCredited(credited).catch(() => {});
  return true;
}

/**
 * Claw back an order's cashback when it is cancelled / refunded / flagged fraud
 * after having been credited. Debits the wallet (clamped so the balance never
 * goes negative — any shortfall, e.g. already withdrawn, is noted on the order
 * for manual follow-up), clears the credited marker, marks the order cancelled,
 * and reverses its lucky-draw contribution + still-undrawn ticket. Idempotent:
 * does nothing if the order was never credited.
 */
export async function reverseOrderCashback(orderId: string): Promise<boolean> {
  const reversed = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .for("update")
      .limit(1);
    const order = rows[0];
    if (!order || !order.cashbackCreditedAt) return false;

    const locked = await tx
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, order.userId))
      .for("update")
      .limit(1);
    const balance = locked[0]?.balance ?? 0;
    const debit = Math.min(order.cashbackAmount, Math.max(0, balance));
    if (debit > 0) {
      await recordWalletTx(tx, {
        userId: order.userId,
        type: "adjustment",
        amount: -debit,
        orderId: order.id,
        note: `Thu hồi hoàn tiền đơn ${order.externalOrderId} (huỷ/hoàn/fraud)`,
      });
    }
    const shortfall = order.cashbackAmount - debit;
    await tx
      .update(orders)
      .set({
        status: "cancelled",
        cashbackCreditedAt: null,
        adminNote:
          shortfall > 0
            ? `Thu hồi thiếu ${shortfall}₫ (số dư không đủ, cần xử lý tay)`
            : order.adminNote,
      })
      .where(eq(orders.id, order.id));

    const { reverseContributionAndTicket } = await import(
      "@/lib/lucky-draw/service"
    );
    await reverseContributionAndTicket(tx, {
      orderId: order.id,
      commissionAmount: order.commissionAmount,
    });
    return {
      orderId: order.id,
      userId: order.userId,
      externalOrderId: order.externalOrderId,
      amount: order.cashbackAmount,
    };
  });
  if (reversed) {
    const { reverseReferralReward } = await import("@/lib/missions/referral");
    await reverseReferralReward(orderId).catch((error: unknown) => {
      console.error("Referral reward reversal failed", error);
    });
    await notifyCashbackReversed(reversed).catch(() => {});
  }
  return Boolean(reversed);
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
