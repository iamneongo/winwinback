import { NextResponse, type NextRequest } from "next/server";
import { syncTikTokOrders } from "@/lib/affiliate/tiktok/sync";
import { reconcile as reconcileShopeeOrders } from "@/lib/affiliate/shopee/sync";

export const dynamic = "force-dynamic";

/**
 * Periodic TikTok affiliate order reconciliation. Protected by a shared secret
 * in the `x-cron-secret` header (CRON_SECRET). Schedule an external cron to
 * call this every 1–6h, e.g.:
 *   curl -H "x-cron-secret: $CRON_SECRET" https://<host>/api/cron/sync-orders
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Reconcile both marketplaces; one failing must not hide the other.
    const [tiktok, shopee] = await Promise.allSettled([
      // 30-day windows so a late-settling or delayed order is never missed
      // between runs (Shopee's report alone can lag ~1.5 days).
      syncTikTokOrders({ sinceDays: 30 }),
      reconcileShopeeOrders({ sinceDays: 30 }),
    ]);
    return NextResponse.json({
      ok: true,
      tiktok:
        tiktok.status === "fulfilled"
          ? tiktok.value
          : { error: String(tiktok.reason) },
      shopee:
        shopee.status === "fulfilled"
          ? shopee.value
          : { error: String(shopee.reason) },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "sync failed" },
      { status: 500 },
    );
  }
}
