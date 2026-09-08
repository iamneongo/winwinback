// Missions/referral schema: users.referral_code + referred_by, wallet_tx_type
// 'reward' value, and the mission_claims table. Idempotent.
// Run: node --env-file=.env.local scripts/create-missions.mjs
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code text;`,
  );
  await client.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by uuid;`,
  );
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS users_referral_code_idx ON users (referral_code);`,
  );
  // Enum value add cannot run inside a transaction; autocommit is fine here.
  await client.query(
    `ALTER TYPE wallet_tx_type ADD VALUE IF NOT EXISTS 'reward';`,
  );
  await client.query(`
    CREATE TABLE IF NOT EXISTS mission_claims (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mission_key text NOT NULL,
      status text NOT NULL,
      reward bigint NOT NULL DEFAULT 0,
      proof text,
      admin_note text,
      created_at timestamptz NOT NULL DEFAULT now(),
      processed_at timestamptz
    );
  `);
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS mission_claims_user_mission_idx ON mission_claims (user_id, mission_key);`,
  );
  console.log("OK: missions + referral schema ready");
} finally {
  await client.end();
}
