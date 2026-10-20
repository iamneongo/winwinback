"use client";

import { useEffect, useState } from "react";
import { LuckyDrawFloatingPromo } from "@/components/dashboard/LuckyDrawFloatingPromo";
import type { LuckyDrawPromoData } from "@/lib/lucky-draw/promo";

export function LandingLuckyDrawPromo() {
  const [promo, setPromo] = useState<LuckyDrawPromoData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/lucky-draw-promo", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data: unknown) => {
        if (data && typeof data === "object" && "prizeAmount" in data && "isActive" in data
          && typeof data.prizeAmount === "number" && Number.isFinite(data.prizeAmount)
          && typeof data.isActive === "boolean") {
          setPromo({ prizeAmount: data.prizeAmount, isActive: data.isActive });
        }
      })
      .catch(() => {
        // A temporary API failure must not interrupt the landing page.
      });
    return () => controller.abort();
  }, []);

  return promo ? <LuckyDrawFloatingPromo {...promo} placement="landing" /> : null;
}
