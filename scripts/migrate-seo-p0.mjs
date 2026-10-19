import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const name = "20261019_seo_p0_v1";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(2026101903)");
  await client.query("CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const applied = await client.query("SELECT 1 FROM app_migrations WHERE name = $1", [name]);
  if (applied.rowCount) {
    await client.query("COMMIT");
    console.log(`${name} already applied`);
  } else {
    // Existing article SEO is JSONB. Add defaults without changing columns,
    // historical versions, draft content, or any existing SEO overrides.
    const result = await client.query(`
      UPDATE articles
      SET seo = jsonb_build_object('follow', true, 'schemaType', 'Article') || COALESCE(seo, '{}'::jsonb)
      WHERE seo IS NULL OR NOT (seo ? 'follow' AND seo ? 'schemaType')
    `);
    await client.query("INSERT INTO app_migrations(name) VALUES ($1)", [name]);
    await client.query("COMMIT");
    console.log(`${name} applied; ${result.rowCount} article SEO records normalized`);
  }
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
