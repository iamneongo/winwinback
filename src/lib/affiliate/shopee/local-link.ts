import "server-only";
import { getShopeeAffiliateId } from "./config";
import { extractShopeeItemId } from "./product";

export class ShopeeLocalLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopeeLocalLinkError";
  }
}

const TRACKING_PARAMS = new Set(["sp_atk"]);

function isShopeeProductHost(host: string): boolean {
  return host === "shopee.vn" || host.endsWith(".shopee.vn");
}

function normalizeProductUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ShopeeLocalLinkError("Link Shopee không hợp lệ");
  }

  if (url.protocol !== "https:" || !isShopeeProductHost(url.hostname.toLowerCase())) {
    throw new ShopeeLocalLinkError("Hãy dùng link sản phẩm Shopee VN đầy đủ");
  }
  if (!extractShopeeItemId(url.toString())) {
    throw new ShopeeLocalLinkError("Link này không chứa mã sản phẩm Shopee");
  }

  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_") || TRACKING_PARAMS.has(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  url.hash = "";
  return url;
}

/**
 * Build an `an_redir` URL locally from a Shopee VN product URL.
 *
 * This deliberately does not call AddliveTag or fetch product data. `subId`
 * is carried as Shopee's `sub_id` query parameter (our caller's `sub1`). It
 * does not validate affiliate attribution or provide order/conversion data.
 */
export function buildLocalShopeeAffiliateLink(
  originUrl: string,
  subId?: string,
): { affiliateUrl: string; productId: string } {
  const affiliateId = getShopeeAffiliateId().trim();
  if (!/^\d{6,20}$/.test(affiliateId)) {
    throw new ShopeeLocalLinkError("Chưa cấu hình SHOPEE_AFFILIATE_ID hợp lệ");
  }

  const origin = normalizeProductUrl(originUrl);
  const productId = extractShopeeItemId(origin.toString());
  if (!productId) {
    throw new ShopeeLocalLinkError("Không nhận diện được mã sản phẩm Shopee");
  }

  const link = new URL("https://s.shopee.vn/an_redir");
  link.searchParams.set("origin_link", origin.toString());
  link.searchParams.set("affiliate_id", affiliateId);
  if (subId) link.searchParams.set("sub_id", subId);

  return { affiliateUrl: link.toString(), productId };
}
