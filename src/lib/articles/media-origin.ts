/** Only the configured public site may mutate article media. */
export function isAllowedArticleMediaOrigin(
  origin: string | null,
  publicSiteUrl: string | undefined,
  requestUrl: string,
  production: boolean,
): boolean {
  if (!origin || origin === "null") return false;

  try {
    const expected = publicSiteUrl
      ? new URL(publicSiteUrl).origin
      : production ? null : new URL(requestUrl).origin;
    return expected !== null && origin === expected;
  } catch {
    return false;
  }
}

export function hasTrustedArticleMediaOrigin(request: Request): boolean {
  return isAllowedArticleMediaOrigin(
    request.headers.get("origin"),
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
    request.url,
    process.env.NODE_ENV === "production",
  );
}
