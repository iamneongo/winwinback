import "server-only";

/**
 * Resolve a pasted TikTok Shop URL to its numeric product (material) id.
 *
 * The Generate Affiliate Sharing Link API takes product ids, not raw URLs, so
 * we extract the id directly when present, otherwise follow redirects (short
 * links like vt.tiktok.com/xxxx or www.tiktok.com/t/xxxx) and extract from the
 * resolved URL.
 */

// TikTok product ids are long numeric strings (typically 18-19 digits).
const ID_PATTERNS: RegExp[] = [
  /\/view\/product\/(\d{8,})/i,
  /\/product\/(\d{8,})/i,
  /\/pdp\/(\d{8,})/i,
  /[?&]product_id=(\d{8,})/i,
  /[?&]pid=(\d{8,})/i,
];

export function extractProductId(url: string): string | null {
  for (const pattern of ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

async function resolveFinalUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      // A desktop UA avoids some short-link interstitials.
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });
    return res.url || null;
  } catch {
    return null;
  }
}

export async function resolveTikTokProductId(
  inputUrl: string,
): Promise<string | null> {
  const direct = extractProductId(inputUrl);
  if (direct) return direct;

  const finalUrl = await resolveFinalUrl(inputUrl);
  if (finalUrl) {
    const resolved = extractProductId(finalUrl);
    if (resolved) return resolved;
  }
  return null;
}
