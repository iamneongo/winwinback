import "server-only";
import { and, between, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  prizeFund,
  luckyDrawPeriods,
  luckyDrawTickets,
} from "@/db/schema";
import { prizeFundRate } from "@/lib/config";
import { recordWalletTx } from "@/lib/wallet";

const FUND_ID = "global";
/** Share of the fund the nearest ticket wins when no number matches exactly. */
const NEAREST_SHARE = 0.2;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The 4-digit lottery number for an order: last 4 digits of its external id. */
export function ticketNumber(externalOrderId: string): string {
  const digits = externalOrderId.replace(/\D/g, "");
  return digits.slice(-4).padStart(4, "0");
}

/** Make sure the single global fund row exists (no-op if it already does). */
async function ensureFund(tx: Tx): Promise<void> {
  await tx
    .insert(prizeFund)
    .values({ id: FUND_ID, balance: 0 })
    .onConflictDoNothing();
}

/**
 * Contribute this order's prize-fund share and mint its lottery ticket.
 * Must run inside the same transaction that settles the order's cashback so it
 * happens exactly once per order (guarded there by cashbackCreditedAt, and by
 * the unique orderId on the ticket as a second line of defence).
 */
export async function contributeAndIssueTicket(
  tx: Tx,
  order: {
    id: string;
    userId: string;
    externalOrderId: string;
    commissionAmount: number;
  },
): Promise<void> {
  const contribution = Math.round(order.commissionAmount * prizeFundRate);
  if (contribution > 0) {
    await tx
      .insert(prizeFund)
      .values({ id: FUND_ID, balance: contribution })
      .onConflictDoUpdate({
        target: prizeFund.id,
        set: {
          balance: sql`${prizeFund.balance} + ${contribution}`,
          updatedAt: new Date(),
        },
      });
  }

  await tx
    .insert(luckyDrawTickets)
    .values({
      userId: order.userId,
      orderId: order.id,
      number: ticketNumber(order.externalOrderId),
    })
    .onConflictDoNothing();
}

/** Current global fund balance (VND). */
export async function getFundBalance(): Promise<number> {
  const rows = await db
    .select({ balance: prizeFund.balance })
    .from(prizeFund)
    .where(eq(prizeFund.id, FUND_ID))
    .limit(1);
  return rows[0]?.balance ?? 0;
}

export interface DrawWinner {
  userId: string;
  ticketId: string;
  number: string;
  amount: number;
}

export interface DrawResult {
  periodId: string;
  winningNumber: string;
  pot: number;
  ticketCount: number;
  /** null when there were no tickets at all (whole pot rolls over). */
  exactMatch: boolean | null;
  paidOut: number;
  rollover: number;
  winners: DrawWinner[];
}

/**
 * Draw a period: pick a random 4-digit number and pay out the fund.
 *
 * - Exact match on a ticket's last-4 → those tickets split the whole fund.
 * - No exact match → the numerically nearest ticket(s) split 20% of the fund;
 *   the remaining 80% stays in the fund (rolls over to the next period).
 * - No eligible tickets → nothing is paid; the whole fund rolls over.
 *
 * Idempotent per period (guarded by status) and atomic (one transaction).
 */
export async function runDraw(periodId: string): Promise<DrawResult> {
  return db.transaction(async (tx) => {
    const periodRows = await tx
      .select()
      .from(luckyDrawPeriods)
      .where(eq(luckyDrawPeriods.id, periodId))
      .for("update")
      .limit(1);
    const period = periodRows[0];
    if (!period) throw new Error("Không tìm thấy kỳ quay");
    if (period.status === "drawn") throw new Error("Kỳ này đã được quay");

    await ensureFund(tx);
    const fundRows = await tx
      .select()
      .from(prizeFund)
      .where(eq(prizeFund.id, FUND_ID))
      .for("update")
      .limit(1);
    const pot = fundRows[0]?.balance ?? 0;

    // Tickets inside the window that no earlier draw has consumed.
    const tickets = await tx
      .select()
      .from(luckyDrawTickets)
      .where(
        and(
          isNull(luckyDrawTickets.periodId),
          between(luckyDrawTickets.createdAt, period.startAt, period.endAt),
        ),
      );

    const winningNumber = String(Math.floor(Math.random() * 10000)).padStart(
      4,
      "0",
    );
    const winNum = Number(winningNumber);

    let exactMatch: boolean | null = tickets.length > 0 ? false : null;
    let winnerTickets: typeof tickets = [];
    if (tickets.length > 0) {
      const exact = tickets.filter((t) => t.number === winningNumber);
      if (exact.length > 0) {
        exactMatch = true;
        winnerTickets = exact;
      } else {
        let best = Infinity;
        for (const t of tickets) {
          best = Math.min(best, Math.abs(Number(t.number) - winNum));
        }
        winnerTickets = tickets.filter(
          (t) => Math.abs(Number(t.number) - winNum) === best,
        );
      }
    }

    const payoutPool =
      winnerTickets.length === 0
        ? 0
        : exactMatch
          ? pot
          : Math.floor(pot * NEAREST_SHARE);
    const share =
      winnerTickets.length > 0
        ? Math.floor(payoutPool / winnerTickets.length)
        : 0;
    const paidOut = share * winnerTickets.length;

    const winners: DrawWinner[] = [];
    for (const t of winnerTickets) {
      if (share > 0) {
        await recordWalletTx(tx, {
          userId: t.userId,
          type: "prize",
          amount: share,
          note: `Trúng thưởng rút thăm — kỳ ${period.name}`,
        });
      }
      await tx
        .update(luckyDrawTickets)
        .set({ isWinner: true, prizeAmount: share })
        .where(eq(luckyDrawTickets.id, t.id));
      winners.push({
        userId: t.userId,
        ticketId: t.id,
        number: t.number,
        amount: share,
      });
    }

    // Consume every eligible ticket so a later draw never re-uses it.
    if (tickets.length > 0) {
      await tx
        .update(luckyDrawTickets)
        .set({ periodId })
        .where(
          inArray(
            luckyDrawTickets.id,
            tickets.map((t) => t.id),
          ),
        );
    }

    const newBalance = pot - paidOut;
    await tx
      .update(prizeFund)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(prizeFund.id, FUND_ID));

    await tx
      .update(luckyDrawPeriods)
      .set({
        status: "drawn",
        winningNumber,
        potTotal: pot,
        paidOut,
        exactMatch,
        drawnAt: new Date(),
      })
      .where(eq(luckyDrawPeriods.id, periodId));

    return {
      periodId,
      winningNumber,
      pot,
      ticketCount: tickets.length,
      exactMatch,
      paidOut,
      rollover: newBalance,
      winners,
    };
  });
}
