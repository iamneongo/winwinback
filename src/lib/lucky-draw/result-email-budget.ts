const DAILY_CAP = 80;
const TRANSACTIONAL_RESERVE = 20;
const BATCH_SIZE = 25;

export type ResendUsage = {
  emails?: {
    daily?: { used: number; limit: number | null; resets_at?: string };
    monthly?: { used: number; limit: number | null; resets_at?: string };
  };
};

/** Leave space for verification, order, and security emails. */
export function drawEmailBudget(usage: ResendUsage, sentToday: number): number {
  const daily = usage.emails?.daily;
  const monthly = usage.emails?.monthly;
  if (!daily || !monthly || !Number.isFinite(daily.used) || !Number.isFinite(monthly.used)) return 0;
  const providerDaily = daily.limit === null ? Infinity : Math.max(0, daily.limit - daily.used - TRANSACTIONAL_RESERVE);
  const providerMonthly = monthly.limit === null ? Infinity : Math.max(0, monthly.limit - monthly.used - TRANSACTIONAL_RESERVE);
  return Math.max(0, Math.min(BATCH_SIZE, DAILY_CAP - sentToday, providerDaily, providerMonthly));
}
