import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const name = "20261110_contributors_v1";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(2026111001)");
  await client.query("CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const applied = await client.query("SELECT 1 FROM app_migrations WHERE name = $1", [name]);
  if (!applied.rowCount) {
    await client.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'contributor' BEFORE 'admin'");
    await client.query("ALTER TABLE articles ADD COLUMN IF NOT EXISTS editorial_status text");
    await client.query("CREATE INDEX IF NOT EXISTS articles_contributor_review_idx ON articles (editorial_status, created_at DESC) WHERE editorial_status IS NOT NULL");
    await client.query("ALTER TABLE article_media ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL");
    await client.query("CREATE INDEX IF NOT EXISTS article_media_uploaded_by_idx ON article_media (uploaded_by, created_at DESC)");
    await client.query("INSERT INTO app_migrations(name) VALUES ($1)", [name]);
  }
  await client.query("COMMIT");
  console.log(applied.rowCount ? `${name} already applied` : `${name} applied`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
