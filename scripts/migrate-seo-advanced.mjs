import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const name = "20261019_seo_advanced_v1";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(2026101904)");
  await client.query("CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const applied = await client.query("SELECT 1 FROM app_migrations WHERE name = $1", [name]);
  if (!applied.rowCount) {
    await client.query(`
      CREATE TABLE seo_templates (
        key text PRIMARY KEY, title_pattern text NOT NULL,
        description_pattern text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE seo_audit_records (
        article_id uuid PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
        findings jsonb NOT NULL DEFAULT '[]'::jsonb,
        checked_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE seo_audit_runs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), article_count integer NOT NULL,
        finding_count integer NOT NULL, completed_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE seo_search_console (
        id text PRIMARY KEY, property text NOT NULL, refresh_token text NOT NULL,
        connected_at timestamptz NOT NULL DEFAULT now(), synced_at timestamptz
      );
      CREATE TABLE seo_search_metrics (
        property text NOT NULL, date text NOT NULL, page text NOT NULL,
        clicks integer NOT NULL, impressions integer NOT NULL,
        ctr text NOT NULL, position text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX seo_search_metrics_property_date_page_idx ON seo_search_metrics(property, date, page);
      CREATE TABLE seo_ai_usage (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id) ON DELETE SET NULL,
        task text NOT NULL, model text NOT NULL, prompt_tokens integer,
        completion_tokens integer, estimated_cost_usd text,
        status text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX seo_ai_usage_user_created_idx ON seo_ai_usage(user_id, created_at);
    `);
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
