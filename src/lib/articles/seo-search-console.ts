import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { seoSearchConsole, seoSearchMetrics } from "@/db/schema";

const ID = "primary";
const callbackPath = "/api/admin/seo/search-console/callback";
export function gscConfig() {
  const clientId = process.env.GSC_CLIENT_ID;
  const clientSecret = process.env.GSC_CLIENT_SECRET;
  const secret = process.env.GSC_TOKEN_ENCRYPTION_KEY;
  const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;
  if (!clientId || !clientSecret || !secret || !baseUrl || !/^[a-f\d]{64}$/i.test(secret)) throw new Error("Search Console chưa được cấu hình đủ OAuth và khóa mã hóa 32 byte.");
  const origin = new URL(baseUrl).origin;
  if (process.env.NODE_ENV === "production" && !origin.startsWith("https://")) throw new Error("Search Console cần HTTPS ở production.");
  return { clientId, clientSecret, key: Buffer.from(secret, "hex"), origin, redirectUri: `${origin}${callbackPath}` };
}
export function encryptRefreshToken(token: string) {
  const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", gscConfig().key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}
function decryptRefreshToken(envelope: string) {
  const [iv, tag, data] = envelope.split(".");
  if (!iv || !tag || !data) throw new Error("Refresh token không hợp lệ.");
  const decipher = createDecipheriv("aes-256-gcm", gscConfig().key, Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
async function googleToken(params: URLSearchParams) {
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: params, signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok) throw new Error(`Google OAuth thất bại (${response.status}).`);
  const token = await response.json() as { access_token?: string; refresh_token?: string };
  if (!token.access_token) throw new Error("Google không cấp access token.");
  return token;
}
export async function exchangeGscCode(code: string) {
  const config = gscConfig();
  return googleToken(new URLSearchParams({ code, client_id: config.clientId, client_secret: config.clientSecret, redirect_uri: config.redirectUri, grant_type: "authorization_code" }));
}
async function refreshGscToken(envelope: string) {
  const config = gscConfig();
  const token = await googleToken(new URLSearchParams({ refresh_token: decryptRefreshToken(envelope), client_id: config.clientId, client_secret: config.clientSecret, grant_type: "refresh_token" }));
  return token.access_token!;
}
export async function findSiteProperty(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers: { authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok) throw new Error(`Không đọc được tài sản Search Console (${response.status}).`);
  const data = await response.json() as { siteEntry?: { siteUrl: string; permissionLevel: string }[] };
  const host = new URL(gscConfig().origin).hostname.replace(/^www\./, "");
  const allowed = (data.siteEntry || []).filter((site) => site.permissionLevel !== "siteUnverifiedUser");
  return allowed.find((site) => site.siteUrl === `sc-domain:${host}`)?.siteUrl || allowed.find((site) => { try { return new URL(site.siteUrl).hostname.replace(/^www\./, "") === host; } catch { return false; } })?.siteUrl || null;
}
export async function saveGscConnection(property: string, refreshToken: string) {
  const encryptedToken = encryptRefreshToken(refreshToken);
  await db.insert(seoSearchConsole).values({ id: ID, property, refreshToken: encryptedToken }).onConflictDoUpdate({ target: seoSearchConsole.id, set: { property, refreshToken: encryptedToken, connectedAt: new Date(), syncedAt: null } });
}
export async function syncGscMetrics() {
  const [connection] = await db.select().from(seoSearchConsole).where(eq(seoSearchConsole.id, ID));
  if (!connection) return { status: "not_connected" as const };
  const accessToken = await refreshGscToken(connection.refreshToken);
  const end = new Date(); end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 28);
  const date = (d: Date) => d.toISOString().slice(0, 10);
  let startRow = 0; let total = 0;
  while (startRow < 100000) {
    const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(connection.property)}/searchAnalytics/query`, { method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" }, body: JSON.stringify({ startDate: date(start), endDate: date(end), dimensions: ["date", "page"], rowLimit: 25000, startRow }), signal: AbortSignal.timeout(30000), cache: "no-store" });
    if (!response.ok) throw new Error(`Search Console query thất bại (${response.status}).`);
    const result = await response.json() as { rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] };
    const rows = result.rows || [];
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100).filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.keys[0]) && /^https?:\/\//.test(r.keys[1]));
      if (!batch.length) continue;
      await db.insert(seoSearchMetrics).values(batch.map((r) => ({ property: connection.property, date: r.keys[0], page: r.keys[1], clicks: Math.round(r.clicks), impressions: Math.round(r.impressions), ctr: String(r.ctr), position: String(r.position), updatedAt: new Date() }))).onConflictDoUpdate({ target: [seoSearchMetrics.property, seoSearchMetrics.date, seoSearchMetrics.page], set: { clicks: sql`excluded.clicks`, impressions: sql`excluded.impressions`, ctr: sql`excluded.ctr`, position: sql`excluded.position`, updatedAt: new Date() } });
    }
    total += rows.length;
    if (rows.length < 25000) break;
    startRow += rows.length;
  }
  await db.update(seoSearchConsole).set({ syncedAt: new Date() }).where(eq(seoSearchConsole.id, ID));
  return { status: "synced" as const, rows: total };
}
