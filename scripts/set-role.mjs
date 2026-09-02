// Set a user's role by email. Auth is handled by Clerk; this only flips the
// DB `role` column for a user that has already signed in at least once (so the
// row exists). Usage:
//   node --env-file=.env.local scripts/set-role.mjs <email> [user|admin]
import pg from "pg";

const email = (process.argv[2] || "").toLowerCase();
const role = process.argv[3] || "admin";

if (!email) {
  console.error("Usage: node scripts/set-role.mjs <email> [user|admin]");
  process.exit(1);
}
if (role !== "user" && role !== "admin") {
  console.error(`Invalid role "${role}" (expected "user" or "admin")`);
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  const res = await client.query(
    "update users set role=$1 where email=$2 returning id, email, role",
    [role, email],
  );
  if (res.rows[0]) {
    console.log(`Updated ${res.rows[0].email} -> role=${res.rows[0].role}`);
  } else {
    console.log(
      `No user with email ${email}. Have them sign in via Clerk once first.`,
    );
  }
} finally {
  await client.end();
}
