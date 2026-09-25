import "server-only";
import {
  ADDLIVETAG_PRODUCT_DATA_URL,
  getAddliveTagApiKey,
  getShopeeAffiliateId,
} from "./config";

export class ShopeeDataApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopeeDataApiError";
  }
}

interface ProductInfo {
  itemId?: number | string;
  productName?: string;
  productLink?: string;
  commission?: number;
  affLink?: string | null;
}

interface ProductDataResponse {
  status?: "success" | "error";
  message?: string;
  productInfo?: ProductInfo;
}

function isShortShopeeUrl(value: string): boolean {
  const host = new URL(value).hostname.toLowerCase();
  return host === "s.shopee.vn" || host === "shp.ee" || host.endsWith(".shp.ee");
}

/**
 * The data API recommends resolving short links before its product lookup.
 * Keep this server-side because Shopee can rate-limit or block browser calls.
 */
async function expandShortShopeeUrl(value: string): Promise<string> {
  if (!isShortShopeeUrl(value)) return value;
  try {
    const response = await fetch(value, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; WinWinBack/1.0)",
      },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    return response.url;
  } catch {
    throw new ShopeeDataApiError("Không mở rộng được link Shopee rút gọn");
  }
}

/**
 * Check a product and construct its Shopee `an_redir` affiliate URL through
 * the AddliveTag data API. The API key never leaves this server.
 */
export async function getAffiliateProductLink(
  originUrl: string,
  subId?: string,
): Promise<{ affiliateUrl: string; productId?: string; title?: string }> {
  const apiKey = getAddliveTagApiKey();
  const affiliateId = getShopeeAffiliateId();
  if (!apiKey || !affiliateId) {
    throw new ShopeeDataApiError(
      "Chưa cấu hình ADDLIVETAG_API_KEY hoặc SHOPEE_AFFILIATE_ID",
    );
  }

  const resolvedUrl = await expandShortShopeeUrl(originUrl);
  const url = new URL(ADDLIVETAG_PRODUCT_DATA_URL);
  url.searchParams.set("url", resolvedUrl);
  url.searchParams.set("affid", affiliateId);
  if (subId) url.searchParams.set("sub1", subId);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-API-Key": apiKey },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch {
    throw new ShopeeDataApiError("Không kết nối được Shopee Data API");
  }

  let data: ProductDataResponse;
  try {
    data = (await response.json()) as ProductDataResponse;
  } catch {
    throw new ShopeeDataApiError("Shopee Data API trả về dữ liệu không hợp lệ");
  }
  if (!response.ok || data.status !== "success" || !data.productInfo) {
    throw new ShopeeDataApiError(data.message || "Không tìm thấy sản phẩm Shopee");
  }

  const affiliateUrl = data.productInfo.affLink;
  if (!affiliateUrl) {
    throw new ShopeeDataApiError("Sản phẩm này chưa tạo được link affiliate");
  }

  return {
    affiliateUrl,
    productId: data.productInfo.itemId?.toString(),
    title: data.productInfo.productName,
  };
}
