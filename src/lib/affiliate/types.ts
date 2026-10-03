export type Platform = "shopee" | "tiktok";

export interface ConvertResult {
  /** The deep affiliate link the customer is ultimately redirected to. */
  affiliateUrl: string;
  /** Optional product title if the provider resolves it. */
  title?: string;
  /** Marketplace product id the link points to (TikTok: starts with 17...). */
  productId?: string;
  /**
   * Best-effort estimated affiliate commission for the product in VND, when the
   * provider can resolve it before purchase. Used to preview the buyer's
   * estimated cashback; undefined when unknown. For a product with several SKUs
   * this is the lower bound and `estimatedCommissionMax` the upper bound.
   */
  estimatedCommission?: number;
  /** Upper bound of the commission range (VND) when the product spans SKUs. */
  estimatedCommissionMax?: number;
}

/**
 * An affiliate provider turns a raw product URL into a trackable affiliate
 * link. Implementations: mock (default), AccessTrade, Shopee, TikTok.
 *
 * Order & commission data does NOT come from here — it arrives asynchronously
 * via the webhook (POST /api/webhooks/affiliate) or admin entry, because
 * affiliate networks report conversions after the fact via postback/report.
 */
export interface AffiliateProvider {
  readonly name: string;
  convertLink(
    platform: Platform,
    url: string,
    opts?: {
      /** Tracking sub id embedded in the link for order→user attribution. */
      subId?: string;
      /** Stable internal user id for providers that support server-side attribution. */
      userId?: string;
    },
  ): Promise<ConvertResult>;
}
