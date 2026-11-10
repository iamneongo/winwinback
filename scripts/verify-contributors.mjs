import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const { rows: versions } = await client.query("SELECT 1 FROM app_migrations WHERE name = '20261110_contributors_v1'");
  const { rows: columns } = await client.query("SELECT table_name, column_name FROM information_schema.columns WHERE (table_name = 'articles' AND column_name = 'editorial_status') OR (table_name = 'article_media' AND column_name = 'uploaded_by') ORDER BY table_name");
  const { rows: counts } = await client.query("SELECT (SELECT count(*)::int FROM users) AS users, (SELECT count(*)::int FROM articles) AS articles, (SELECT count(*)::int FROM article_media) AS media");
  const { rows: roles } = await client.query("SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumsortorder");
  console.log(JSON.stringify({ migrated: versions.length === 1, columns, roles: roles.map((row) => row.enumlabel), counts: counts[0] }));
} finally {
  await client.end();
}
