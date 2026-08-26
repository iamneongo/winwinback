// Seed an admin user. Run: npm run db:seed
// Credentials can be overridden via ADMIN_EMAIL / ADMIN_PASSWORD env vars.
import pg from "pg";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const email = (process.env.ADMIN_EMAIL || "admin@winwin.local").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "admin123456";
const name = process.env.ADMIN_NAME || "Quản trị viên";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  const existing = await client.query("select id from users where email=$1", [
    email,
  ]);
  const passwordHash = await hashPassword(password);
  if (existing.rows[0]) {
    await client.query(
      "update users set password_hash=$1, role='admin', name=$2 where email=$3",
      [passwordHash, name, email],
    );
    console.log(`Updated existing user to admin: ${email}`);
  } else {
    await client.query(
      "insert into users (email, password_hash, name, role) values ($1,$2,$3,'admin')",
      [email, passwordHash, name],
    );
    console.log(`Created admin: ${email}`);
  }
  console.log(`Password: ${password}`);
} finally {
  await client.end();
}
