import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(`
    ALTER TABLE affiliate_links
      ADD COLUMN IF NOT EXISTS article_status text,
      ADD COLUMN IF NOT EXISTS article_preview text,
      ADD COLUMN IF NOT EXISTS article_slug text,
      ADD COLUMN IF NOT EXISTS article_updated_at timestamptz;

    UPDATE affiliate_links AS link
    SET article_status = 'published',
        article_slug = article.slug,
        article_updated_at = now()
    FROM articles AS article
    WHERE link.article_status IS NULL
      AND link.platform = article.platform
      AND link.product_id = article.product_id
      AND article.status = 'published';
  `);
  console.log("Applied article progress migration.");
} finally {
  await client.end();
}
