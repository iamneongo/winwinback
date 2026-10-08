export const FIRST_ORDER_WAIT_MS = 3 * 24 * 60 * 60 * 1000;
export const REFERRAL_WINDOW_MS = 60 * 24 * 60 * 60 * 1000;

export function firstOrderRewardReady(creditedAt: Date | null, now: Date): boolean {
  return creditedAt !== null && now.getTime() - creditedAt.getTime() >= FIRST_ORDER_WAIT_MS;
}

export function referralOrderEligible(input: {
  joinedAt: Date;
  referredAt: Date;
  orderedAt: Date;
  completed: boolean;
  cashbackCreditedAt: Date | null;
  commissionAmount: number;
}): boolean {
  const elapsed = input.orderedAt.getTime() - input.joinedAt.getTime();
  return input.completed
    && input.cashbackCreditedAt !== null
    && input.commissionAmount > 0
    && elapsed >= 0
    && input.orderedAt.getTime() >= input.referredAt.getTime()
    && elapsed <= REFERRAL_WINDOW_MS;
}
