/** Projected pool for one period. Admin money is not in the global balance yet. */
export function periodPrizePool(adminContribution: number, includeCommissionFund: boolean, fundBalance: number): number {
  return adminContribution + (includeCommissionFund ? fundBalance : 0);
}

/** Unpaid admin money becomes rollover; an excluded global fund stays intact. */
export function balanceAfterDraw(fundBalance: number, adminContribution: number, paidOut: number): number {
  return fundBalance + adminContribution - paidOut;
}
