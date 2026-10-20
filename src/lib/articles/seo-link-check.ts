import "server-only";
import { lookup } from "node:dns/promises";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP } from "node:net";

function publicIp(address: string) {
  if (isIP(address) === 4) {
    const p = address.split(".").map(Number);
    if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
    const [a, b, c] = p;
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 0 || b === 168)) || (a === 198 && (b === 18 || b === 19)) || (a === 203 && b === 0 && c === 113) || (a === 198 && b === 51 && c === 100) || (a === 192 && b === 0 && c === 2));
  }
  if (isIP(address) === 6) return /^[23][0-9a-f]{3}:/i.test(address) && !address.toLowerCase().startsWith("2001:db8:");
  return false;
}

/** Only reports definitive HTTP 404/410. Network/permission errors stay unknown. */
export async function checkExternalLink(href: string): Promise<"broken" | "ok" | "unknown"> {
  let current = href;
  for (let redirect = 0; redirect < 4; redirect++) {
    let url: URL;
    try { url = new URL(current); } catch { return "unknown"; }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || (url.port && url.port !== "80" && url.port !== "443") || isIP(url.hostname)) return "unknown";
    let addresses: { address: string; family: number }[];
    try { addresses = await lookup(url.hostname, { all: true }); } catch { return "unknown"; }
    if (!Array.isArray(addresses) || !addresses.length || addresses.some((entry) => !publicIp(entry.address))) return "unknown";
    const address = addresses[0];
    const response = await new Promise<{ status: number; location?: string } | null>((resolve) => {
      const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(url, {
        method: "HEAD",
        headers: { "user-agent": "WinWinBack-SEO-Audit/1.0" },
        lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
        timeout: 5000,
      }, (res) => { resolve({ status: res.statusCode || 0, location: res.headers.location }); res.destroy(); });
      request.on("timeout", () => request.destroy());
      request.on("error", () => resolve(null));
      request.end();
    });
    if (!response) return "unknown";
    if (response.status === 404 || response.status === 410) return "broken";
    if (response.status >= 300 && response.status < 400 && response.location) { current = new URL(response.location, url).toString(); continue; }
    return response.status >= 200 && response.status < 400 ? "ok" : "unknown";
  }
  return "unknown";
}
