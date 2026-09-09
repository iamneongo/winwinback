import "server-only";
import {
  searchOpenCollaborationProducts,
  type CollabSortField,
} from "./client";
import { getValidTikTokAccessToken } from "./tokens";

export interface CollabFetchResult {
  total?: number;
  count: number;
  /** Pretty-printed raw response so we can confirm exact field names. */
  raw: string;
}

/**
 * Fetch open-collaboration products for the connected creator, sorted by
 * commission rate (highest first). Returns a count + the raw JSON so we can
 * lock the product field names before building the customer "săn sale" page.
 */
export async function fetchOpenCollaborationProducts(
  opts: { sortField?: CollabSortField } = {},
): Promise<CollabFetchResult> {
  const accessToken = await getValidTikTokAccessToken();
  if (!accessToken) {
    throw new Error("Chưa kết nối tài khoản Creator TikTok.");
  }
  const { products, total, raw } = await searchOpenCollaborationProducts(
    accessToken,
    { pageSize: 20, sortField: opts.sortField ?? "commission_rate", sortOrder: "DESC" },
  );
  return { total, count: products.length, raw: JSON.stringify(raw, null, 2) };
}
