import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(`
    ALTER TABLE articles
      ADD COLUMN IF NOT EXISTS category text;

    CREATE INDEX IF NOT EXISTS articles_status_category_created_idx
      ON articles (status, category, created_at DESC);
  `);
  console.log("Applied articles category migration.");
} finally {
  await client.end();
}
