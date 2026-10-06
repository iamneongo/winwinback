/** Only allow a return to the customer dashboard after sign-in. */
export function dashboardReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  try {
    const base = "https://winwinback.invalid";
    const url = new URL(value, base);
    if (url.origin !== base || url.pathname !== "/dashboard") return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}
