import { loadEnvConfig } from "@next/env";
import pg from "pg";
import { ARTICLE_CATEGORIES, normalizeArticleCategory } from "../src/lib/articles/categories";

loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
try {
  await client.connect();
  await client.query("BEGIN");
  const existingConstraint = await client.query("SELECT 1 FROM pg_constraint WHERE conname = 'articles_category_article_categories_name_fk'");
  await client.query(`
    CREATE TABLE IF NOT EXISTS article_categories (
      name text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS article_categories_name_lower_idx
      ON article_categories (lower(name));
  `);
  const existingCategories = await client.query<{ name: string }>("SELECT name FROM article_categories");
  if (existingCategories.rowCount === 0) {
    for (const name of ARTICLE_CATEGORIES) {
      await client.query("INSERT INTO article_categories (name) VALUES ($1) ON CONFLICT DO NOTHING", [name]);
    }
  }
  const categoryRows = await client.query<{ name: string }>("SELECT name FROM article_categories");
  const known = new Set(categoryRows.rows.map(({ name }) => name));
  if (existingConstraint.rowCount === 0) {
    const { rows } = await client.query<{ category: string | null }>("SELECT DISTINCT category FROM articles");
    for (const { category } of rows) {
      if (category && known.has(category)) continue;
      const normalized = normalizeArticleCategory(category);
      await client.query("UPDATE articles SET category = $1 WHERE category IS NOT DISTINCT FROM $2", [normalized, category]);
    }
    await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_category_article_categories_name_fk') THEN
        ALTER TABLE articles ADD CONSTRAINT articles_category_article_categories_name_fk
          FOREIGN KEY (category) REFERENCES article_categories(name)
          ON UPDATE CASCADE ON DELETE RESTRICT;
      END IF;
    END $$;
    `);
  }
  await client.query("COMMIT");
  console.log("Article categories created and existing articles normalized.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
