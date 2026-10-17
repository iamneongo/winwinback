import { loadEnvConfig } from "@next/env";
import pg from "pg";
import { migrateArticleCategories } from "../src/lib/articles/category-migration";

loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  try {
    await migrateArticleCategories(client);
    console.log("Article categories are ready.");
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
