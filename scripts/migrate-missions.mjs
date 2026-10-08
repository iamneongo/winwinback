import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_at timestamptz;
    -- Do not award the new two-sided bonus retroactively for old purchases.
    UPDATE users SET referred_at = now()
      WHERE referred_by IS NOT NULL AND referred_at IS NULL;

    CREATE TABLE IF NOT EXISTS referral_rewards (
      referred_user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      referrer_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      mission_key text NOT NULL,
      reward_each bigint NOT NULL,
      reversed_at timestamptz,
      referrer_unrecovered bigint NOT NULL DEFAULT 0,
      referred_unrecovered bigint NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE referral_rewards
      ADD COLUMN IF NOT EXISTS reversed_at timestamptz,
      ADD COLUMN IF NOT EXISTS referrer_unrecovered bigint NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS referred_unrecovered bigint NOT NULL DEFAULT 0;

    ALTER TABLE mission_claims
      ADD COLUMN IF NOT EXISTS proof_image_data text,
      ADD COLUMN IF NOT EXISTS proof_image_mime text;

    CREATE INDEX IF NOT EXISTS referral_rewards_referrer_idx
      ON referral_rewards (referrer_user_id);
    CREATE INDEX IF NOT EXISTS referral_rewards_order_idx
      ON referral_rewards (order_id);
  `);
  console.log("Mission reward data is ready. The fixed catalog is loaded from code.");
} finally {
  await client.end();
}
