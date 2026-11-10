import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const name = "20261110_contributor_general_link_v2";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(2026111003)");
  await client.query("CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const applied = await client.query("SELECT 1 FROM app_migrations WHERE name = $1", [name]);
  if (!applied.rowCount) {
    await client.query("ALTER TABLE contributor_shares ALTER COLUMN article_id DROP NOT NULL");
    await client.query("CREATE UNIQUE INDEX contributor_shares_default_owner_idx ON contributor_shares (contributor_id) WHERE article_id IS NULL");
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
