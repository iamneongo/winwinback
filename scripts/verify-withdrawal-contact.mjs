import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  const { rows: [summary] } = await client.query(`
    SELECT count(*)::int AS count,
      md5(coalesce(string_agg(concat_ws('|', id, user_id, amount, status, bank_name, bank_account, account_holder, note, requested_at, processed_at), E'\n' ORDER BY id), '')) AS existing_data_hash
    FROM withdrawals
  `);
  const { rows: columns } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'withdrawals'
      AND column_name IN ('contact_phone', 'correction_reason') ORDER BY column_name
  `);
  const { rows: [events] } = await client.query("SELECT to_regclass('withdrawal_events') IS NOT NULL AS exists");
  console.log(JSON.stringify({ count: summary.count, existingDataHash: summary.existing_data_hash, addedColumns: columns.map((row) => row.column_name), eventTableExists: events.exists }));
} finally {
  await client.end();
}
