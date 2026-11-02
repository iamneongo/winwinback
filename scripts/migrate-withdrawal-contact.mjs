import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  // PostgreSQL requires the enum addition to commit before it can be used by DML.
  await client.query("ALTER TYPE withdrawal_status ADD VALUE IF NOT EXISTS 'needs_info'");
  await client.query("BEGIN");
  await client.query(`
    ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS contact_phone text;
    ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS correction_reason text;
    CREATE TABLE IF NOT EXISTS withdrawal_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      withdrawal_id uuid NOT NULL REFERENCES withdrawals(id) ON DELETE CASCADE,
      actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
      event text NOT NULL,
      detail text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS withdrawal_events_withdrawal_idx ON withdrawal_events (withdrawal_id, created_at);
  `);
  await client.query("COMMIT");
  console.log("Withdrawal contact migration complete. Existing requests are unchanged.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}
