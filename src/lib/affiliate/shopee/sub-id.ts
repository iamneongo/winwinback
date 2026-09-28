/**
 * Shopee Affiliate accepts only ASCII letters and digits in SubId values.
 * Our internal user IDs are UUIDs, so their separator hyphens must not be
 * sent to Shopee. Keeping the 32 hexadecimal characters is reversible and
 * preserves a one-to-one mapping to the original UUID.
 */
export function toShopeeSubId1(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9]/g, "");
}

/** Restore the UUID representation used by the Win-Win database. */
export function fromShopeeSubId1(subId: string): string | null {
  const compact = subId.trim().toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(compact)) return null;

  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}
