import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_draw_email boolean NOT NULL DEFAULT true`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS lucky_draw_result_emails (
      period_id uuid NOT NULL REFERENCES lucky_draw_periods(id) ON DELETE CASCADE,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped')),
      attempts integer NOT NULL DEFAULT 0,
      next_attempt_at timestamptz NOT NULL DEFAULT now(),
      provider_id text,
      last_error text,
      sent_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (period_id, user_id)
    )
  `);
  await client.query(`CREATE INDEX IF NOT EXISTS lucky_draw_result_emails_pending_idx ON lucky_draw_result_emails (status, next_attempt_at)`);
  await client.query("COMMIT");
  console.log("Lucky draw result email migration complete.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
