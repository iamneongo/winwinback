import { getLuckyDrawPromoData, type LuckyDrawPromoData } from "@/lib/lucky-draw/promo";
import { LuckyDrawFloatingPromo } from "./LuckyDrawFloatingPromo";

export async function LuckyDrawFloatingPromoData() {
  let promo: LuckyDrawPromoData | null;
  try {
    promo = await getLuckyDrawPromoData();
  } catch (error) {
    // The promotion must not block the customer's dashboard if draw data is unavailable.
    console.error("Unable to load lucky draw promotion", error);
    return null;
  }
  return promo ? <LuckyDrawFloatingPromo {...promo} /> : null;
}
