import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      topic text NOT NULL,
      message text NOT NULL,
      status text NOT NULL DEFAULT 'new',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS contact_messages_status_created_idx
      ON contact_messages (status, created_at);
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS contact_messages_email_created_idx
      ON contact_messages (email, created_at);
  `);
  console.log("Contact messages table is ready.");
} finally {
  await client.end();
}
