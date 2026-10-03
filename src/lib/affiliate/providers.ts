import "server-only";
import type { AffiliateProvider, ConvertResult, Platform } from "./types";
import { isTikTokConfigured } from "./tiktok/config";
import { resolveTikTokProductId } from "./tiktok/product";
import {
  generateSharingLinks,
  getOpenCollaborationProductsByIds,
  TikTokApiError,
} from "./tiktok/client";

/**
 * Parse an affiliate commission amount into a VND range. The value is either a
 * single number ("6300") or a "min - max" range ("2099.93 - 6299.93") when the
 * product has several SKUs. Returns null when nothing parseable is present.
 */
function parseCommissionRange(
  amount: string | undefined,
): { min: number; max: number } | null {
  if (!amount) return null;
  const nums = (amount.match(/[\d][\d.,]*/g) ?? [])
    .map((n) => Math.round(parseFloat(n.replace(/,/g, ""))))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;
  return { min: Math.min(...nums), max: Math.max(...nums) };
}
import { getValidTikTokAccessToken } from "./tiktok/tokens";
import { isShopeeConfigured } from "./shopee/config";
import { generateShortLink, ShopeeApiError } from "./shopee/client";
import { extractShopeeItemId } from "./shopee/product";
import { getAffiliateProductLink, ShopeeDataApiError } from "./shopee/data-client";
import {
  getCashbackLink,
  getShopeeProductInfo,
  ShopeeAffApiError,
} from "./shopee/automation-client";

/**
 * Mock provider — works with no external credentials.
 *
 * It appends a tracking parameter to the original URL so the flow is fully
 * functional end-to-end. Swap AFFILIATE_PROVIDER once you have real API access.
 */
class MockProvider implements AffiliateProvider {
  readonly name = "mock";
  async convertLink(platform: Platform, url: string): Promise<ConvertResult> {
    const u = new URL(url);
    u.searchParams.set("aff", "winwin");
    u.searchParams.set("aff_platform", platform);
    return { affiliateUrl: u.toString() };
  }
}

/**
 * AccessTrade (accesstrade.vn) aggregator — covers both Shopee and TikTok Shop
 * in Vietnam. Create a link via POST https://api.accesstrade.vn/v1/product_link
 * with header `Authorization: Token <ACCESSTRADE_API_KEY>`.
 * TODO: implement once ACCESSTRADE_API_KEY is provided.
 */
class AccessTradeProvider implements AffiliateProvider {
  readonly name = "accesstrade";
  async convertLink(): Promise<ConvertResult> {
    throw new Error(
      "AccessTrade provider not configured. Set ACCESSTRADE_API_KEY and implement convertLink().",
    );
  }
}

/**
 * Shopee Affiliate Open API.
 *
 * Turns a pasted Shopee product/shop URL into a trackable affiliate short link
 * via the `generateShortLink` GraphQL mutation. The link's short code is
 * embedded as a sub id (utm_content) so the conversion report can attribute the
 * order back to the user. Requires SHOPEE_APP_ID / SHOPEE_APP_SECRET.
 */
class ShopeeProvider implements AffiliateProvider {
  readonly name = "shopee";
  async convertLink(
    platform: Platform,
    url: string,
    opts?: { subId?: string },
  ): Promise<ConvertResult> {
    if (platform !== "shopee") {
      throw new Error("Provider Shopee chỉ xử lý link Shopee");
    }
    if (!isShopeeConfigured()) {
      throw new Error(
        "Chưa cấu hình Shopee App ID/Secret (SHOPEE_APP_ID / SHOPEE_APP_SECRET)",
      );
    }

    let affiliateUrl: string;
    try {
      affiliateUrl = await generateShortLink(url, opts?.subId ? [opts.subId] : []);
    } catch (e) {
      if (e instanceof ShopeeApiError) {
        throw new Error(`Shopee từ chối tạo link: ${e.message}`);
      }
      throw e;
    }

    return { affiliateUrl, productId: extractShopeeItemId(url) ?? undefined };
  }
}

/**
 * AddliveTag product-data API. This is an external, non-official data source
 * documented by bcat95/shopee-aff. It uses an API key plus the business's
 * Shopee Affiliate ID; no Shopee Open API App Secret is required.
 */
class AddliveTagShopeeProvider implements AffiliateProvider {
  readonly name = "addlivetag";

  async convertLink(
    platform: Platform,
    url: string,
    opts?: { subId?: string },
  ): Promise<ConvertResult> {
    if (platform !== "shopee") {
      throw new Error("Provider AddliveTag chỉ xử lý link Shopee");
    }
    try {
      return await getAffiliateProductLink(url, opts?.subId);
    } catch (error) {
      if (error instanceof ShopeeDataApiError) {
        throw new Error(`Không tạo được link Shopee: ${error.message}`);
      }
      throw error;
    }
  }
}

/** ShopeeAff uses an authenticated real-Chrome worker and records a safe user ID in SubId1. */
class ShopeeAffProvider implements AffiliateProvider {
  readonly name = "shopee-aff";

  async convertLink(
    platform: Platform,
    url: string,
    opts?: { subId?: string; userId?: string },
  ): Promise<ConvertResult> {
    if (platform !== "shopee") {
      throw new Error("ShopeeAff chỉ hỗ trợ link Shopee");
    }
    if (!opts?.userId) {
      throw new Error("Thiếu người dùng để gắn SubId1 cho link Shopee");
    }
    try {
      // getCashbackLink compacts the UUID into a Shopee-safe subId1 and caches
      // the result, so repeated pastes of the same URL don't re-hit the worker.
      const affiliateUrl = await getCashbackLink(opts.userId, url);
      // Best-effort projected commission (same worker) to preview cashback.
      const info = await getShopeeProductInfo(url);
      const estimatedCommission =
        info?.commission && info.commission > 0
          ? Math.round(info.commission)
          : undefined;
      return {
        affiliateUrl,
        productId: extractShopeeItemId(url) ?? undefined,
        estimatedCommission,
      };
    } catch (error) {
      if (error instanceof ShopeeAffApiError) {
        throw new Error(`ShopeeAff không tạo được link: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * TikTok Shop Affiliate Creator API.
 *
 * Turns a pasted TikTok Shop product URL into an affiliate sharing link via
 * POST /affiliate_creator/202505/.../generate_batch. Requires:
 *  - TIKTOK_APP_KEY / TIKTOK_APP_SECRET (Partner Center app credentials)
 *  - a connected affiliate-creator OAuth token (see /admin integrations)
 */
class TikTokProvider implements AffiliateProvider {
  readonly name = "tiktok";
  async convertLink(platform: Platform, url: string): Promise<ConvertResult> {
    if (platform !== "tiktok") {
      throw new Error("Provider TikTok chỉ xử lý link TikTok Shop");
    }
    if (!isTikTokConfigured()) {
      throw new Error(
        "Chưa cấu hình TikTok App key/secret (TIKTOK_APP_KEY / TIKTOK_APP_SECRET)",
      );
    }

    const accessToken = await getValidTikTokAccessToken();
    if (!accessToken) {
      throw new Error(
        "TikTok Shop chưa được kết nối. Vào trang Quản trị để kết nối tài khoản Affiliate Creator.",
      );
    }

    const productId = await resolveTikTokProductId(url);
    if (!productId) {
      throw new Error(
        "Không nhận diện được mã sản phẩm từ link TikTok Shop này",
      );
    }

    let result;
    try {
      result = await generateSharingLinks([productId], accessToken);
    } catch (e) {
      if (e instanceof TikTokApiError) {
        throw new Error(`TikTok từ chối tạo link (mã ${e.code}): ${e.message}`);
      }
      throw e;
    }

    const link = result.links[0];
    // Prefer the OneLink smart deeplink (opens the TikTok app when installed,
    // falls back to web/store otherwise). Fall back to the raw scheme deep_link,
    // then the plain web sharing_link.
    const affiliateUrl =
      link?.one_link || link?.deep_link || link?.sharing_link;
    if (!affiliateUrl) {
      const failed = result.failed[0];
      throw new Error(
        failed?.reason || failed?.message
          ? `TikTok không tạo được link: ${failed?.reason ?? failed?.message}`
          : "TikTok không trả về link affiliate cho sản phẩm này",
      );
    }

    // Best-effort commission estimate to preview cashback — never block the link.
    let estimatedCommission: number | undefined;
    let estimatedCommissionMax: number | undefined;
    try {
      const [info] = await getOpenCollaborationProductsByIds(
        [productId],
        accessToken,
      );
      const range = parseCommissionRange(info?.commission?.amount);
      if (range) {
        estimatedCommission = range.min;
        estimatedCommissionMax = range.max;
      }
    } catch {
      // Ignore — the estimate is optional.
    }

    return { affiliateUrl, productId, estimatedCommission, estimatedCommissionMax };
  }
}

function providerByName(name: string | undefined): AffiliateProvider {
  switch (name) {
    case "accesstrade":
      return new AccessTradeProvider();
    case "shopee":
      return new ShopeeProvider();
    case "addlivetag":
      return new AddliveTagShopeeProvider();
    case "shopee-aff":
      return new ShopeeAffProvider();
    case "tiktok":
      return new TikTokProvider();
    case "mock":
    default:
      return new MockProvider();
  }
}

/**
 * Resolve the provider for a platform. A per-platform override
 * (AFFILIATE_PROVIDER_TIKTOK / AFFILIATE_PROVIDER_SHOPEE) takes precedence over
 * the global AFFILIATE_PROVIDER, so TikTok can go live while Shopee stays mock.
 */
export function getAffiliateProvider(platform?: Platform): AffiliateProvider {
  const override =
    platform === "tiktok"
      ? process.env.AFFILIATE_PROVIDER_TIKTOK
      : platform === "shopee"
        ? process.env.AFFILIATE_PROVIDER_SHOPEE
        : undefined;
  return providerByName(override || process.env.AFFILIATE_PROVIDER);
}
