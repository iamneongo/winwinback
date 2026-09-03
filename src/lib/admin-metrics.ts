import "server-only";
import { gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export interface OrderTrend {
  labels: string[];
  total: number[];
  approved: number[];
  cashback: number[];
}

/**
 * Aggregate the last `days` days of orders into a per-day series for the admin
 * charts: total orders, approved (confirmed/completed) orders, and cashback
 * sum. Missing days are filled with zeros so the axis is always continuous.
 */
export async function getOrderTrend(days = 7): Promise<OrderTrend> {
  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.orderedAt}), 'YYYY-MM-DD')`,
      total: sql<number>`count(*)::int`,
      approved: sql<number>`count(*) filter (where ${orders.status} in ('confirmed', 'completed'))::int`,
      cashback: sql<number>`coalesce(sum(${orders.cashbackAmount}), 0)::float8`,
    })
    .from(orders)
    .where(gte(orders.orderedAt, sql`now() - (${days - 1} || ' days')::interval`))
    .groupBy(sql`date_trunc('day', ${orders.orderedAt})`)
    .orderBy(sql`date_trunc('day', ${orders.orderedAt})`);

  const map = new Map(rows.map((r) => [r.day, r]));
  const labels: string[] = [];
  const total: number[] = [];
  const approved: number[] = [];
  const cashback: number[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const row = map.get(key);
    labels.push(
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
    total.push(row?.total ?? 0);
    approved.push(row?.approved ?? 0);
    cashback.push(row?.cashback ?? 0);
  }

  return { labels, total, approved, cashback };
}
