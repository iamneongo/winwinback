import "server-only";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import type { Notification } from "@/db/schema";

export type NotificationType =
  | "cashback"
  | "withdrawal"
  | "withdrawal_request"
  | "order"
  | "reward"
  | "system";

type NewNotification = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
};

/** Insert a single in-app notification for one recipient. */
export async function createNotification(input: NewNotification): Promise<void> {
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    href: input.href ?? null,
  });
}

/**
 * Fan a notification out to every admin — one row each, so read-state is
 * tracked per admin. No-op when there are no admins.
 */
export async function notifyAdmins(
  input: Omit<NewNotification, "userId">,
): Promise<void> {
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"));
  if (admins.length === 0) return;
  await db.insert(notifications).values(
    admins.map((a) => ({
      userId: a.id,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
    })),
  );
}

/** Latest notifications for the bell dropdown (newest first). */
export async function listNotifications(
  userId: string,
  limit = 12,
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/** Count of unread notifications for the red bell dot. */
export async function countUnread(userId: string): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows[0]?.n ?? 0;
}

/** Serializable payload for the header bell (list + unread count). */
export async function getBellData(userId: string): Promise<{
  unreadCount: number;
  items: {
    id: string;
    type: string;
    title: string;
    body: string;
    href: string | null;
    read: boolean;
    createdAt: string;
  }[];
}> {
  const [items, unreadCount] = await Promise.all([
    listNotifications(userId),
    countUnread(userId),
  ]);
  return {
    unreadCount,
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      href: n.href,
      read: n.readAt !== null,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

/** Mark all of a user's unread notifications as read. */
export async function markAllRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
