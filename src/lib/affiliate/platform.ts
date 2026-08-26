import type { Platform } from "./types";

const SHOPEE_HOSTS = ["shopee.vn", "shopee.com", "s.shopee.vn"];
const TIKTOK_HOSTS = [
  "tiktok.com",
  "shop.tiktok.com",
  "vt.tiktok.com",
  "tiktokshop.com",
];

/** Detect the marketplace from a product URL. Returns null if unsupported. */
export function detectPlatform(url: string): Platform | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
  if (SHOPEE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return "shopee";
  }
  if (TIKTOK_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    return "tiktok";
  }
  return null;
}
