import "server-only";
import crypto from "node:crypto";
import {
  SHOPEE_API_BASE,
  SHOPEE_GRAPHQL_PATH,
  getShopeeAppId,
  getShopeeSecret,
} from "./config";

export class ShopeeApiError extends Error {
  constructor(
    message: string,
    readonly code?: string | number,
  ) {
    super(message);
    this.name = "ShopeeApiError";
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string | number } }[];
}

/**
 * POST a signed GraphQL request to the Shopee Affiliate Open API.
 *
 * Signature = SHA256(appId + timestamp + rawBody + secret), sent in the
 * Authorization header. The body must be the exact string that was signed, so
 * we sign then send the identical `payload`.
 */
async function graphql<T>(query: string): Promise<T> {
  const appId = getShopeeAppId();
  const secret = getShopeeSecret();
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({ query });
  const signature = crypto
    .createHash("sha256")
    .update(`${appId}${timestamp}${payload}${secret}`, "utf8")
    .digest("hex");

  const res = await fetch(`${SHOPEE_API_BASE}${SHOPEE_GRAPHQL_PATH}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
    },
    body: payload,
    signal: AbortSignal.timeout(15000),
  });

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const e = json.errors[0];
    throw new ShopeeApiError(e.message || "Shopee API error", e.extensions?.code);
  }
  if (!json.data) throw new ShopeeApiError("Shopee trả về dữ liệu rỗng");
  return json.data;
}

/** Escape a value as a GraphQL string literal (JSON encoding is compatible). */
const gqlStr = (s: string) => JSON.stringify(s);

/**
 * Generate an affiliate short link from any Shopee product/shop URL.
 * `subIds` (max 5) ride along in the link's utm_content and come back on the
 * conversion report, enabling order→user attribution.
 */
export async function generateShortLink(
  originUrl: string,
  subIds: string[] = [],
): Promise<string> {
  const sub = subIds.length
    ? `, subIds:[${subIds.slice(0, 5).map(gqlStr).join(",")}]`
    : "";
  const query = `mutation{generateShortLink(input:{originUrl:${gqlStr(originUrl)}${sub}}){shortLink}}`;
  const data = await graphql<{ generateShortLink?: { shortLink?: string } }>(
    query,
  );
  const link = data.generateShortLink?.shortLink;
  if (!link) throw new ShopeeApiError("Shopee không trả về shortLink");
  return link;
}

/** One conversion (affiliate order) line from the Shopee report. */
export interface ShopeeConversion {
  conversionId?: number;
  orderId: string;
  orderStatus?: string; // UNPAID | PENDING | COMPLETED | CANCELLED
  purchaseTime?: number; // unix seconds
  totalCommission?: string;
  netCommission?: string;
  /** Sub ids echoed back from the short link (attribution key). */
  utmContent?: string;
  items?: { itemId?: string; itemName?: string }[];
}

/**
 * Fetch affiliate conversions (orders + commission + status) in a time window.
 * Uses Shopee's scrollId cursor (note: scrollId expires after ~30s).
 *
 * NOTE: field names follow the documented conversionReport schema; verify them
 * against your app's schema in the Shopee API playground if a query errors.
 */
export async function getConversionReport(params: {
  purchaseTimeStart?: number;
  purchaseTimeEnd?: number;
  scrollId?: string;
  limit?: number;
}): Promise<{ nodes: ShopeeConversion[]; scrollId?: string; hasNextPage: boolean }> {
  const args: string[] = [`limit:${params.limit ?? 100}`];
  if (params.purchaseTimeStart) args.push(`purchaseTimeStart:${params.purchaseTimeStart}`);
  if (params.purchaseTimeEnd) args.push(`purchaseTimeEnd:${params.purchaseTimeEnd}`);
  if (params.scrollId) args.push(`scrollId:${gqlStr(params.scrollId)}`);

  const query = `query{conversionReport(${args.join(",")}){nodes{conversionId orderId orderStatus purchaseTime totalCommission netCommission utmContent items{itemId itemName}} pageInfo{hasNextPage scrollId}}}`;
  const data = await graphql<{
    conversionReport?: {
      nodes?: ShopeeConversion[];
      pageInfo?: { hasNextPage?: boolean; scrollId?: string };
    };
  }>(query);
  const cr = data.conversionReport;
  return {
    nodes: cr?.nodes ?? [],
    scrollId: cr?.pageInfo?.scrollId,
    hasNextPage: Boolean(cr?.pageInfo?.hasNextPage),
  };
}
