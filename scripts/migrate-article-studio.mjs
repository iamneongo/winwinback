import nextEnv from "@next/env";
import pg from "pg";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SET LOCAL lock_timeout = '5s'");
  await client.query("SELECT pg_advisory_xact_lock(2026101901)");
  await client.query(`CREATE TABLE IF NOT EXISTS app_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const applied = await client.query("SELECT name FROM app_migrations WHERE name = '20261019_article_studio_v1'");
  if (!applied.rowCount) {
    const dir = path.resolve(".article-studio-backups");
    await mkdir(dir, { recursive: true });
    const before = await client.query("SELECT row_to_json(a) AS row FROM articles a");
    const backup = path.join(dir, `articles-before-studio-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify(before.rows.map((r) => r.row)), { flag: "wx", mode: 0o600 });
    console.log(`Article snapshot written: ${backup}`);
    await client.query(`
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo jsonb;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at timestamptz;
      CREATE TABLE article_drafts (article_id uuid PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE, document jsonb NOT NULL, revision integer NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
      CREATE TABLE article_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE, document jsonb NOT NULL, label text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
      CREATE INDEX article_versions_article_created_idx ON article_versions(article_id, created_at DESC);
      CREATE TABLE article_slugs (slug text PRIMARY KEY, article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE);
      INSERT INTO article_slugs(slug, article_id) SELECT slug, id FROM articles;
      CREATE TABLE article_media (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, width integer NOT NULL, height integer NOT NULL, bytes integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
      CREATE TABLE article_outros (id text PRIMARY KEY, name text NOT NULL, title text NOT NULL, body text NOT NULL, image_url text NOT NULL, button_label text NOT NULL, button_url text NOT NULL, links jsonb NOT NULL DEFAULT '[]', revision integer NOT NULL DEFAULT 0);
      INSERT INTO article_outros(id,name,title,body,image_url,button_label,button_url) VALUES ('default','Mẫu thương hiệu mặc định','Mua sắm cùng Win-Win Back','Kiểm tra tiền hoàn trước khi đặt hàng.','/images/news-cta-shopping-banner-v2.webp','Bắt đầu mua sắm ngay','/register');
      INSERT INTO app_migrations(name) VALUES ('20261019_article_studio_v1');
    `);
  }
  await client.query("COMMIT");
  console.log(applied.rowCount ? "Article studio migration already applied." : "Article studio migration applied.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally { await client.end(); }
