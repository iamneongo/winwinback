import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(`
    ALTER TABLE lucky_draw_periods
      ADD COLUMN IF NOT EXISTS admin_contribution bigint NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS include_commission_fund boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS funding_note text,
      ADD COLUMN IF NOT EXISTS funding_updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS funding_updated_at timestamptz;
  `);
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'lucky_draw_admin_contribution_range'
      ) THEN
        ALTER TABLE lucky_draw_periods ADD CONSTRAINT lucky_draw_admin_contribution_range
          CHECK (admin_contribution >= 0 AND admin_contribution <= 100000000);
      END IF;
    END $$;
  `);
  await client.query("COMMIT");
  console.log("Lucky draw funding migration complete.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
