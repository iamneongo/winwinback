import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { seoTemplates } from "@/db/schema";
export async function getSeoTemplate(category: string, manual: boolean) {
  const keys = [`category:${category}`, manual ? "manual" : "product"];
  const rows = await db.select().from(seoTemplates).where(eq(seoTemplates.key, keys[0])).limit(1);
  if (rows[0]) return rows[0];
  const fallback = await db.select().from(seoTemplates).where(eq(seoTemplates.key, keys[1])).limit(1);
  return fallback[0] || null;
}
