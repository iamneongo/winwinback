export type Platform = "shopee" | "tiktok";

export interface ConvertResult {
  /** The deep affiliate link the customer is ultimately redirected to. */
  affiliateUrl: string;
  /** Optional product title if the provider resolves it. */
  title?: string;
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
  convertLink(platform: Platform, url: string): Promise<ConvertResult>;
}
