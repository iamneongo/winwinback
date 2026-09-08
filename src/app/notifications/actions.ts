"use server";

import { requireUser } from "@/lib/auth/guards";
import { markAllRead } from "@/lib/notifications";

/**
 * Mark every unread notification of the current user (customer or admin) as
 * read. Called when the bell dropdown is opened so the red dot clears.
 */
export async function markNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await markAllRead(user.id);
}
