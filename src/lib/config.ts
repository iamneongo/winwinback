export const cashbackRate = (() => {
  const v = Number(process.env.CASHBACK_RATE);
  return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.7;
})();

export const minWithdrawal = (() => {
  const v = Number(process.env.MIN_WITHDRAWAL);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 50000;
})();

export const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

/** Format an integer VND amount, e.g. 1234000 -> "1.234.000 ₫". */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
