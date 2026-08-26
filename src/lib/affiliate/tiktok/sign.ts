import "server-only";
import crypto from "node:crypto";

/**
 * TikTok Shop request signing (HMAC-SHA256).
 *
 * Algorithm (per "Sign your API request", API version 202309+):
 *   1. Take all query params except `sign` and `access_token`, sort keys asc.
 *   2. Concatenate as {key}{value} with no separators.
 *   3. Prepend the request path.
 *   4. If content-type is not multipart/form-data, append the exact request body.
 *   5. Wrap the whole string with the app secret on both ends.
 *   6. HMAC-SHA256 with the app secret as key, hex-encoded.
 *
 * The access token travels in the `x-tts-access-token` header and is NOT part
 * of the signature.
 */

const EXCLUDED_KEYS = new Set(["sign", "access_token"]);

export function signRequest(params: {
  path: string;
  query: Record<string, string>;
  /** Exact JSON body string that will be sent (empty/undefined for GET). */
  body?: string;
  appSecret: string;
  contentType?: string;
}): string {
  const { path, query, body, appSecret, contentType } = params;

  const keys = Object.keys(query)
    .filter((k) => !EXCLUDED_KEYS.has(k))
    .sort();

  let input = path;
  for (const key of keys) {
    input += key + query[key];
  }

  if (contentType !== "multipart/form-data" && body) {
    input += body;
  }

  input = appSecret + input + appSecret;

  return crypto.createHmac("sha256", appSecret).update(input, "utf8").digest("hex");
}
