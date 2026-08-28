import "server-only";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

/**
 * Resolve the site's external base URL (e.g. https://winwinback.com).
 *
 * IMPORTANT: do NOT rely on `NEXT_PUBLIC_BASE_URL` for server-side redirects.
 * `NEXT_PUBLIC_*` values are inlined at BUILD time, but our Docker build stage
 * has no env (Dokploy injects env only at runtime), so it inlines as undefined
 * and would fall back to localhost. Deriving from the incoming request's
 * forwarded host/proto is reverse-proxy safe and always correct at runtime.
 */
export function getBaseUrl(req?: NextRequest): string {
  if (req) {
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
    const host =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) return `${proto}://${host}`;
  }
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;
  return "http://localhost:3000";
}

/**
 * Same as {@link getBaseUrl} but for server components / server actions that
 * have no `NextRequest` in scope — reads the incoming request's forwarded
 * host/proto via `next/headers`. Use this when building absolute URLs (e.g.
 * the `/go/<code>` short link) so they never fall back to localhost in prod.
 */
export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${proto}://${host}`;
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (env) return env;
  return "http://localhost:3000";
}
