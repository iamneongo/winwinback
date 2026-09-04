import "server-only";

/**
 * Extract the Shopee item (product) id from a product URL. Used as the
 * attribution join key: `-i.<shopId>.<itemId>` or `/product/<shopId>/<itemId>`.
 * Returns null for non-product URLs (shop pages, campaigns, ...).
 */
const ID_PATTERNS: RegExp[] = [
  /-i\.\d+\.(\d+)/i, // slug-i.<shopId>.<itemId>
  /\/product\/\d+\/(\d+)/i, // /product/<shopId>/<itemId>
  /[?&]itemId=(\d+)/i,
];

export function extractShopeeItemId(url: string): string | null {
  for (const pattern of ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}
