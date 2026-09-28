import "server-only";
import {
  getShopeeAffApiKey,
  isShopeeAffConfigured,
  SHOPEE_AFF_API_URL,
} from "./config";

export class ShopeeAffApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string | number,
  ) {
    super(message);
    this.name = "ShopeeAffApiError";
  }
}

export interface ShopeeAffReportItem {
  order_sn?: string;
  orderId?: string;
  sub_ids?: string[] | string;
  subIds?: string[] | string;
  commission?: number | string;
  estimated_commission?: number | string;
  order_status?: string;
  display_order_status?: string;
  purchase_time?: number | string;
  purchaseTime?: number | string;
  shop_name?: string;
  shopName?: string;
  item_name?: string;
  itemName?: string;
  item_id?: string | number;
  itemId?: string | number;
  order_amount?: number | string;
  orderAmount?: number | string;
}

interface JsonEnvelope {
  ok?: boolean;
  error?: string;
  message?: string;
  code?: string | number;
  shortLink?: string;
  longLink?: string;
  list?: ShopeeAffReportItem[];
}

async function request<T extends JsonEnvelope>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!isShopeeAffConfigured()) {
    throw new ShopeeAffApiError(
      "ShopeeAff chưa được cấu hình. Thiết lập SHOPEE_AFF_API_URL và SHOPEE_AFF_API_KEY.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${SHOPEE_AFF_API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "x-api-key": getShopeeAffApiKey(),
        ...init?.headers,
      },
    });
  } catch {
    throw new ShopeeAffApiError("Không kết nối được ShopeeAff worker.");
  }

  const body = (await response.json().catch(() => ({}))) as T;
  if (!response.ok || body.ok === false) {
    throw new ShopeeAffApiError(
      body.error ?? body.message ?? "ShopeeAff không thể xử lý yêu cầu.",
      response.status,
      body.code,
    );
  }
  return body;
}

export async function createShopeeAffLink(input: {
  originalLink: string;
  userId: string;
}): Promise<{ affiliateUrl: string }> {
  const response = await request<JsonEnvelope>("/api/link", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const affiliateUrl = response.shortLink ?? response.longLink;
  if (!affiliateUrl) {
    throw new ShopeeAffApiError("ShopeeAff không trả về affiliate link.");
  }
  return { affiliateUrl };
}

export async function getShopeeAffReport(input: {
  days: number;
  page: number;
  size: number;
}): Promise<{ list: ShopeeAffReportItem[] }> {
  const query = new URLSearchParams({
    days: String(input.days),
    page: String(input.page),
    size: String(input.size),
  });
  const response = await request<JsonEnvelope>(`/api/report?${query}`);
  return { list: response.list ?? [] };
}
