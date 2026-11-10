import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const name = "20261110_contributor_tracking_v1";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(2026111002)");
  await client.query("CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const applied = await client.query("SELECT 1 FROM app_migrations WHERE name = $1", [name]);
  if (!applied.rowCount) {
    await client.query(`CREATE TABLE contributor_shares (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      contributor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      code text NOT NULL UNIQUE,
      visits integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT contributor_shares_owner_article_idx UNIQUE (contributor_id, article_id)
    )`);
    await client.query("CREATE INDEX contributor_shares_owner_idx ON contributor_shares (contributor_id)");
    await client.query("ALTER TABLE affiliate_links ADD COLUMN contributor_share_id uuid REFERENCES contributor_shares(id) ON DELETE SET NULL");
    await client.query("CREATE INDEX affiliate_links_contributor_share_idx ON affiliate_links (contributor_share_id)");
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
