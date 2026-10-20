import "server-only";
import { and, asc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { luckyDrawPeriods } from "@/db/schema";
import { periodPrizePool } from "./funding";
import { getFundBalance } from "./service";

export type LuckyDrawPromoData = { prizeAmount: number; isActive: boolean };

export async function getLuckyDrawPromoData(): Promise<LuckyDrawPromoData | null> {
  const now = new Date();
  const [period] = await db.select({
    startAt: luckyDrawPeriods.startAt,
    adminContribution: luckyDrawPeriods.adminContribution,
    includeCommissionFund: luckyDrawPeriods.includeCommissionFund,
  }).from(luckyDrawPeriods).where(and(
    eq(luckyDrawPeriods.status, "open"),
    gt(luckyDrawPeriods.endAt, now),
  )).orderBy(asc(luckyDrawPeriods.startAt)).limit(1);

  if (!period) return null;

  const fund = period.includeCommissionFund ? await getFundBalance() : 0;
  return {
    prizeAmount: periodPrizePool(period.adminContribution, period.includeCommissionFund, fund),
    isActive: period.startAt <= now,
  };
}
