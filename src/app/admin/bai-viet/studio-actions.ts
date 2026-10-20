"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleOutros } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { documentSchema, type ArticleDocument } from "@/lib/articles/document";
import { listVersions, saveDocument } from "@/lib/articles/studio";

export async function saveStudioAction(input: { id?: string; revision: number; document: ArticleDocument; publish?: boolean }) {
  await requireAdmin();
  const parsed = z.object({ id: z.string().uuid().optional(), revision: z.number().int().nonnegative(), document: documentSchema, publish: z.boolean().optional() }).safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  try {
    const result = await saveDocument(parsed.data);
    if (input.publish) { revalidatePath("/bai-viet", "layout"); revalidatePath("/sitemap.xml"); }
    revalidatePath("/admin/bai-viet");
    return { ok: true as const, ...result };
  } catch (error) {
    const message = error instanceof Error && !/query|postgres|relation|connection/i.test(error.message) ? error.message : "Không lưu được bài. Kiểm tra kết nối và migration dữ liệu.";
    return { ok: false as const, error: message };
  }
}
export async function versionsAction(id: string) {
  await requireAdmin();
  return listVersions(z.string().uuid().parse(id));
}
export async function searchArticleLinks(query: string) {
  await requireAdmin();
  const q = z.string().max(150).parse(query).trim();
  if (!q) return [];
  const vector = sql`to_tsvector('simple', coalesce(${articles.title}, '') || ' ' || coalesce(regexp_replace(${articles.contentHtml}, '<[^>]+>', ' ', 'g'), ''))`;
  const term = sql`plainto_tsquery('simple', ${q})`;
  const rows = await db.select({ title: articles.title, slug: articles.slug }).from(articles)
    .where(and(eq(articles.status, "published"), sql`${vector} @@ ${term}`))
    .orderBy(sql`ts_rank(${vector}, ${term}) DESC`).limit(10);
  if (rows.length) return rows;
  return db.select({ title: articles.title, slug: articles.slug }).from(articles).where(and(eq(articles.status, "published"), ilike(articles.title, `%${q.replace(/[%_]/g, "")}%`))).limit(10);
}
export async function listOutrosAction() {
  await requireAdmin();
  return db.select().from(articleOutros).orderBy(asc(articleOutros.name));
}
const safeLink = z.string().max(2000).refine((v) => /^\/(?!\/)/.test(v) || /^https:\/\/[^\s]+$/.test(v));
const outroSchema = z.object({ id: z.string().regex(/^[a-z0-9-]{1,80}$/), name: z.string().min(1).max(100), title: z.string().min(1).max(200), body: z.string().max(2000), imageUrl: z.union([z.literal(""), safeLink]), buttonLabel: z.string().min(1).max(100), buttonUrl: safeLink, links: z.array(z.object({ label: z.string().min(1).max(100), url: safeLink })).max(10), revision: z.number().int().nonnegative() });
export async function saveOutroAction(input: z.infer<typeof outroSchema>, confirmed: boolean) {
  await requireAdmin();
  const data = outroSchema.parse(input);
  if (!confirmed) throw new Error("Cần xác nhận cập nhật các bài đang sử dụng mẫu.");
  const [old] = await db.select().from(articleOutros).where(eq(articleOutros.id, data.id));
  if (old) {
    const changed = await db.update(articleOutros).set({ ...data, revision: data.revision + 1 }).where(and(eq(articleOutros.id, data.id), eq(articleOutros.revision, data.revision))).returning();
    if (!changed.length) throw new Error("Mẫu đã thay đổi ở phiên khác. Hãy tải lại.");
  } else await db.insert(articleOutros).values(data);
  revalidatePath("/bai-viet", "layout");
  return { ok: true };
}
export async function outroUsageAction(id: string) {
  await requireAdmin();
  const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(articles).where(sql`coalesce(${articles.seo}->>'outro', 'default') = ${z.string().max(80).parse(id)}`);
  return result.count;
}
