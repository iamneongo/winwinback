import "server-only";

import { asc, eq, sql } from "drizzle-orm";
import pg from "pg";
import { db } from "@/db";
import { articleCategories, articles } from "@/db/schema";
import { normalizeArticleCategory, UNCATEGORIZED } from "./categories";
import { migrateArticleCategories } from "./category-migration";

export type ManagedCategory = { name: string; count: number };

let pendingMigration: Promise<void> | undefined;

async function recoverMissingCategoryTable(): Promise<void> {
  if (!pendingMigration) {
    pendingMigration = (async () => {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) throw new Error("DATABASE_URL is not set");
      const client = new pg.Client({ connectionString });
      await client.connect();
      try {
        await migrateArticleCategories(client);
        console.info("[articles] Article category schema initialized.");
      } finally {
        await client.end();
      }
    })().catch((error: unknown) => {
      pendingMigration = undefined;
      throw error;
    });
  }
  await pendingMigration;
}

function isMissingCategoryTable(error: unknown): boolean {
  let cause = error;
  for (let depth = 0; depth < 4 && cause && typeof cause === "object"; depth++) {
    if ("code" in cause && cause.code === "42P01" && "message" in cause
      && String(cause.message).includes('"article_categories"')) return true;
    cause = "cause" in cause ? cause.cause : undefined;
  }
  return false;
}

async function ensureCategoryTableForMutation(): Promise<void> {
  const result = await db.execute<{ exists: boolean }>(sql`select to_regclass('article_categories') is not null as exists`);
  if (!result.rows[0]?.exists) await recoverMissingCategoryTable();
}

export async function listManagedCategories(): Promise<ManagedCategory[]> {
  const query = () => db.select({
      name: articleCategories.name,
      count: sql<number>`count(${articles.id})::int`,
    }).from(articleCategories)
      .leftJoin(articles, eq(articles.category, articleCategories.name))
      .groupBy(articleCategories.name)
      .orderBy(asc(articleCategories.name));
  let rows;
  try {
    rows = await query();
  } catch (error) {
    if (!isMissingCategoryTable(error)) throw error;
    await recoverMissingCategoryTable();
    rows = await query();
  }
  return rows.map((row) => ({ name: row.name, count: Number(row.count) }));
}

export async function resolveArticleCategory(raw: string | null | undefined): Promise<string> {
  const categories = await listManagedCategories();
  const desired = normalizeArticleCategory(raw);
  return categories.find((item) => item.name === desired)?.name
    ?? categories.find((item) => item.name === UNCATEGORIZED)?.name
    ?? categories[0]?.name
    ?? UNCATEGORIZED;
}

export async function createManagedCategory(name: string): Promise<void> {
  await ensureCategoryTableForMutation();
  const existing = await db.select({ name: articleCategories.name }).from(articleCategories)
    .where(sql`lower(${articleCategories.name}) = lower(${name})`).limit(1);
  if (existing.length) throw new Error("Danh mục này đã tồn tại.");
  await db.insert(articleCategories).values({ name });
}

export async function renameManagedCategory(from: string, to: string): Promise<void> {
  await ensureCategoryTableForMutation();
  await db.transaction(async (tx) => {
    const [current] = await tx.select({ name: articleCategories.name }).from(articleCategories)
      .where(eq(articleCategories.name, from)).for("update").limit(1);
    if (!current) throw new Error("Danh mục không còn tồn tại.");
    const duplicate = await tx.select({ name: articleCategories.name }).from(articleCategories)
      .where(sql`lower(${articleCategories.name}) = lower(${to}) and ${articleCategories.name} <> ${from}`).limit(1);
    if (duplicate.length) throw new Error("Tên danh mục đã được sử dụng.");
    // The foreign key cascades the new name to every article in this category.
    await tx.update(articleCategories).set({ name: to }).where(eq(articleCategories.name, from));
  });
}

export async function deleteManagedCategory(name: string, destination: string | null): Promise<number> {
  await ensureCategoryTableForMutation();
  return db.transaction(async (tx) => {
    const [source] = await tx.select({ name: articleCategories.name }).from(articleCategories)
      .where(eq(articleCategories.name, name)).for("update").limit(1);
    if (!source) throw new Error("Danh mục không còn tồn tại.");
    const [{ total }] = await tx.select({ total: sql<number>`count(*)::int` }).from(articleCategories);
    if (Number(total) <= 1) throw new Error("Cần giữ ít nhất một danh mục bài viết.");
    const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(articles)
      .where(eq(articles.category, name));
    const affected = Number(count);
    if (affected > 0) {
      if (!destination || destination === name) throw new Error("Chọn danh mục khác để chuyển bài viết trước khi xóa.");
      const [target] = await tx.select({ name: articleCategories.name }).from(articleCategories)
        .where(eq(articleCategories.name, destination)).for("update").limit(1);
      if (!target) throw new Error("Danh mục đích không còn tồn tại.");
      await tx.update(articles).set({ category: destination }).where(eq(articles.category, name));
    }
    await tx.delete(articleCategories).where(eq(articleCategories.name, name));
    return affected;
  });
}
