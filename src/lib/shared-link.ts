import { detectPlatform } from "./affiliate/platform";

export type SharedLinkResult =
  | { url: string; error?: never }
  | { url?: never; error: "missing" | "unsupported" | "multiple" | "too-long" };

/** Share sheets often put the URL inside promotional text, not the URL field. */
export function extractSharedLink(fields: readonly string[]): SharedLinkResult {
  if (fields.every((field) => !field.trim())) return { error: "missing" };
  if (fields.join("").length > 8000) return { error: "too-long" };
  const links = new Set<string>();
  for (const field of fields) {
    for (const match of field.matchAll(/https?:\/\/[^\s<>"'`]+/gi)) {
      const candidate = match[0].replace(/[.,;!?\u2026\u3002\uFF0C)\]}]+$/u, "");
      try {
        const parsed = new URL(candidate);
        if (parsed.username || parsed.password || parsed.port || !detectPlatform(candidate)) continue;
        links.add(parsed.href);
      } catch {
        // Other text in a share is not a product link.
      }
    }
  }
  if (!links.size) return { error: "unsupported" };
  if (links.size > 1) return { error: "multiple" };
  return { url: [...links][0] };
}
