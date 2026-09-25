import "server-only";
import { getAddliveTagApiKey, isShopeeDataConfigured } from "./config";
import type {
  ShopeeCampaign,
  ShopeeDiscoverResponse,
  ShopeeOfferProduct,
} from "./discover-types";

const API_BASE = "https://data.addlivetag.com/offers";

type ApiResponse<T> = {
  status?: "success" | "error";
  message?: string;
  dataSource?: "api" | "db";
  offers?: T[];
  products?: T[];
};

type CampaignPayload = {
  name?: string;
  commissionRate?: number;
  image?: string;
  link?: string;
  startTime?: number;
  endTime?: number;
};

type ProductPayload = {
  itemId?: number | string;
  name?: string;
  link?: string;
  image?: string;
  commissionRate?: number;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  sales?: number;
  rating?: number;
  shopId?: number | string;
  shopName?: string;
  startTime?: number;
  endTime?: number;
};

export class ShopeeDiscoverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShopeeDiscoverError";
  }
}

async function requestOffers<T>(
  endpoint: string,
  params: Record<string, string>,
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-API-Key": getAddliveTagApiKey() },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new ShopeeDiscoverError("Không kết nối được dữ liệu ưu đãi Shopee");
  }

  let data: ApiResponse<T>;
  try {
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ShopeeDiscoverError("Dữ liệu ưu đãi Shopee không hợp lệ");
  }
  if (!response.ok || data.status !== "success") {
    throw new ShopeeDiscoverError(data.message || "Không tải được ưu đãi Shopee");
  }
  return data;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toCampaign(value: CampaignPayload): ShopeeCampaign | null {
  if (!value.name || !value.link) return null;
  return {
    name: value.name,
    commissionRate: numberOrNull(value.commissionRate),
    image: value.image || null,
    link: value.link,
    startTime: numberOrNull(value.startTime),
    endTime: numberOrNull(value.endTime),
  };
}

function toProduct(value: ProductPayload): ShopeeOfferProduct | null {
  if (!value.itemId || !value.name || !value.link) return null;
  return {
    itemId: String(value.itemId),
    name: value.name,
    link: value.link,
    image: value.image || null,
    commissionRate: numberOrNull(value.commissionRate),
    price: numberOrNull(value.price),
    priceMin: numberOrNull(value.priceMin),
    priceMax: numberOrNull(value.priceMax),
    sales: numberOrNull(value.sales),
    rating: numberOrNull(value.rating),
    shopId: value.shopId ? String(value.shopId) : null,
    shopName: value.shopName || null,
    startTime: numberOrNull(value.startTime),
    endTime: numberOrNull(value.endTime),
  };
}

/** Fetches current Shopee campaigns and affiliate products from AddliveTag. */
export async function getShopeeDiscoverData(
  keyword = "",
): Promise<ShopeeDiscoverResponse> {
  if (!isShopeeDataConfigured()) {
    throw new ShopeeDiscoverError("Shopee AddliveTag chưa được cấu hình");
  }

  const [campaignsResult, productsResult] = await Promise.all([
    requestOffers<CampaignPayload>("shopee-offer.php", { page: "1", limit: "8" }),
    requestOffers<ProductPayload>("product-offer.php", {
      keyword,
      page: "1",
      limit: "12",
    }),
  ]);

  return {
    campaigns: (campaignsResult.offers ?? [])
      .map(toCampaign)
      .filter((item): item is ShopeeCampaign => item !== null),
    products: (productsResult.products ?? [])
      .map(toProduct)
      .filter((item): item is ShopeeOfferProduct => item !== null),
    dataSource:
      campaignsResult.dataSource === "api" || productsResult.dataSource === "api"
        ? "api"
        : campaignsResult.dataSource === "db" || productsResult.dataSource === "db"
          ? "db"
          : "unknown",
  };
}
