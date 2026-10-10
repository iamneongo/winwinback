import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { auth } from "@/lib/auth";

const databaseRetryDelaysMs = [500, 1_500, 4_000, 8_000] as const;

function isTransientDatabaseError(error: unknown): boolean {
  const pending: unknown[] = [error];
  const seen = new Set<object>();

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const record = current as { code?: unknown; message?: unknown; cause?: unknown };
    const code = typeof record.code === "string" ? record.code : "";
    const message = typeof record.message === "string" ? record.message : "";
    if (
      ["08P01", "08000", "08003", "08006", "57P01", "57P02", "57P03", "ECONNRESET", "ETIMEDOUT", "ECONNREFUSED", "ECONNABORTED", "EPIPE", "EHOSTUNREACH", "ENETUNREACH"].includes(code) ||
      /authentication timed out|connection terminated unexpectedly|before secure tls connection was established/i.test(message)
    ) return true;

    if (record.cause) pending.push(record.cause);
  }

  return false;
}

function isSessionQueryError(error: unknown): boolean {
  const pending: unknown[] = [error];
  const seen = new Set<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    const record = current as { message?: unknown; cause?: unknown };
    const message = typeof record.message === "string" ? record.message : "";
    if (/failed to get session|failed query:.*sessions/i.test(message)) return true;
    if (record.cause) pending.push(record.cause);
  }
  return false;
}

async function withDatabaseRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const delay = databaseRetryDelaysMs[attempt];
      if (!isTransientDatabaseError(error) || delay === undefined) {
        // Do not rethrow Better Auth/Drizzle errors: their messages can contain
        // bound session-cookie values. Keep the Next.js error digest safe too.
        if (isTransientDatabaseError(error) || isSessionQueryError(error)) {
          throw new Error("Unable to resolve the current session");
        }
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Resolve the current app user from the Better Auth session.
 *
 * Returns the full `users` row (including role + balance) so the rest of the
 * app can key on users.id. Wrapped in React `cache()` to run once per request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const requestHeaders = await headers();
  return withDatabaseRetry(async () => {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session?.user) return null;

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    return rows[0] ?? null;
  });
});
