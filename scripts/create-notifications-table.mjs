// Create/update the in-app notifications storage. Safe to run repeatedly.
// Run: node --env-file=.env.local scripts/create-notifications-table.mjs
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type text NOT NULL,
      title text NOT NULL,
      body text NOT NULL,
      href text,
      read_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS dedupe_key text;
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS notifications_user_idx
      ON notifications (user_id, created_at);
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS notifications_user_dedupe_idx
      ON notifications (user_id, dedupe_key);
  `);
  console.log("OK: notifications storage + indexes ready");
} finally {
  await client.end();
}
