import type pg from "pg";
import { ARTICLE_CATEGORIES, normalizeArticleCategory } from "./categories";

/** Idempotent manual migration for article categories. */
export async function migrateArticleCategories(client: pg.Client): Promise<void> {
  await client.query("BEGIN");
  try {
    // Serialize concurrent manual migration runs.
    await client.query("SELECT pg_advisory_xact_lock(607783215)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS article_categories (
        name text PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await client.query("CREATE UNIQUE INDEX IF NOT EXISTS article_categories_name_lower_idx ON article_categories (lower(name))");

    const existingCategories = await client.query<{ name: string }>("SELECT name FROM article_categories");
    if (existingCategories.rowCount === 0) {
      for (const name of ARTICLE_CATEGORIES) {
        await client.query("INSERT INTO article_categories (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
      }
    }

    const constraint = await client.query(
      "SELECT 1 FROM pg_constraint WHERE conname = 'articles_category_article_categories_name_fk' AND conrelid = 'articles'::regclass",
    );
    if (constraint.rowCount === 0) {
      const categoryRows = await client.query<{ name: string }>("SELECT name FROM article_categories");
      const known = new Set(categoryRows.rows.map(({ name }) => name));
      const { rows } = await client.query<{ category: string | null }>("SELECT DISTINCT category FROM articles");
      for (const { category } of rows) {
        if (category && known.has(category)) continue;
        await client.query(
          "UPDATE articles SET category = $1 WHERE category IS NOT DISTINCT FROM $2",
          [normalizeArticleCategory(category), category],
        );
      }
      await client.query(`
        ALTER TABLE articles ADD CONSTRAINT articles_category_article_categories_name_fk
          FOREIGN KEY (category) REFERENCES article_categories(name)
          ON UPDATE CASCADE ON DELETE RESTRICT
      `);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
