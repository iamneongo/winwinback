import "server-only";
import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

// Lazily create the pool + drizzle instance on first use. Importing this module
// must NOT throw or open a connection: `next build` imports route modules to
// collect page data, but DATABASE_URL only exists at runtime (it is not present
// in the Docker build stage). A lazy proxy keeps import side-effect free.
const globalForDb = globalThis as unknown as {
  pool?: Pool;
  db?: Database;
};

function getDb(): Database {
  if (globalForDb.db) return globalForDb.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool =
    globalForDb.pool ??
    new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      // Keep connections short-lived so stale sockets across provider/network
      // interruptions are recycled instead of being reused for auth requests.
      idleTimeoutMillis: 10_000,
      maxLifetimeSeconds: 300,
      connectionTimeoutMillis: 8_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    });
  pool.on("error", () => {
    // Never print the raw pg error here; it can include query values such as
    // session cookies when a checked-out connection is interrupted.
    console.error("[db] An idle database connection was dropped; the pool will replace it");
  });
  globalForDb.pool = pool;

  const instance = drizzle(pool, { schema });
  globalForDb.db = instance;
  return instance;
}

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(instance)
      : value;
  },
});

export { schema };
