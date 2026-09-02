import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Resolve the current app user from the Better Auth session.
 *
 * Returns the full `users` row (including role + balance) so the rest of the
 * app can key on users.id. Wrapped in React `cache()` to run once per request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  return rows[0] ?? null;
});
