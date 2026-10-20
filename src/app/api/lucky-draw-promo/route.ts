import { getLuckyDrawPromoData } from "@/lib/lucky-draw/promo";

export async function GET() {
  try {
    const promo = await getLuckyDrawPromoData();
    return Response.json(promo, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Unable to load public lucky draw promotion", error);
    return Response.json({ error: "Prize information is temporarily unavailable" }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
