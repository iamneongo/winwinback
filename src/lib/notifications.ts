import "server-only";
import { and, asc, count, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import type { Notification } from "@/db/schema";

export const notificationTypes = [
  "cashback",
  "cashback_reversed",
  "withdrawal",
  "withdrawal_request",
  "order",
  "reward",
  "system",
] as const;

export type NotificationType = (typeof notificationTypes)[number];
export type NotificationFilter = "all" | "unread" | NotificationType;
export const NOTIFICATIONS_PAGE_SIZE = 20;

type NewNotification = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  dedupeKey?: string;
};

/** Insert a single in-app notification, ignoring a retried event when keyed. */
export async function createNotification(input: NewNotification): Promise<void> {
  await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      dedupeKey: input.dedupeKey ?? null,
    })
    .onConflictDoNothing();
}

/**
 * Fan a notification out to every admin — one row each, so read-state is
 * tracked per admin. The optional event key is unique per admin recipient.
 */
export async function notifyAdmins(
  input: Omit<NewNotification, "userId">,
): Promise<void> {
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"));
  if (admins.length === 0) return;
  await db
    .insert(notifications)
    .values(
      admins.map((a) => ({
        userId: a.id,
        type: input.type,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
        dedupeKey: input.dedupeKey ?? null,
      })),
    )
    .onConflictDoNothing();
}

function filterConditions(userId: string, filter: NotificationFilter) {
  const conditions = [eq(notifications.userId, userId)];
  if (filter === "unread") conditions.push(isNull(notifications.readAt));
  else if (filter !== "all") conditions.push(eq(notifications.type, filter));
  return conditions;
}

/** Latest notifications for the compact bell preview (newest first). */
export async function listNotifications(
  userId: string,
  limit = 6,
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(limit);
}

/** Paginated inbox data, always scoped to the signed-in recipient. */
export async function getNotificationsPage(
  userId: string,
  page: number,
  filter: NotificationFilter,
): Promise<{ items: Notification[]; total: number; unreadCount: number; page: number; pages: number }> {
  const safePage = Math.max(1, Math.floor(page));
  const conditions = filterConditions(userId, filter);
  const where = and(...conditions);
  const [countRows, unreadRows] = await Promise.all([
    db.select({ value: count() }).from(notifications).where(where),
    db
      .select({ value: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
  ]);
  const total = countRows[0]?.value ?? 0;
  const pages = Math.max(1, Math.ceil(total / NOTIFICATIONS_PAGE_SIZE));
  const currentPage = Math.min(safePage, pages);
  const items = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt), desc(notifications.id))
    .limit(NOTIFICATIONS_PAGE_SIZE)
    .offset((currentPage - 1) * NOTIFICATIONS_PAGE_SIZE);

  return {
    items,
    total,
    unreadCount: unreadRows[0]?.value ?? 0,
    page: currentPage,
    pages,
  };
}

/** Admin notification table, scoped to this admin's own inbox/read state. */
export async function getAdminNotificationsPage(
  userId: string,
  options: {
    page: number;
    search?: string;
    type?: string;
    read?: "read" | "unread" | "";
    sort?: "title" | "type" | "readAt" | "createdAt";
    direction?: "asc" | "desc";
  },
): Promise<{ items: Notification[]; total: number; unreadCount: number; page: number; pages: number }> {
  const safePage = Math.max(1, Math.floor(options.page));
  const conditions = [eq(notifications.userId, userId)];
  const search = options.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    const searchCondition = or(ilike(notifications.title, pattern), ilike(notifications.body, pattern));
    if (searchCondition) conditions.push(searchCondition);
  }
  if (notificationTypes.includes(options.type as NotificationType)) {
    conditions.push(eq(notifications.type, options.type as NotificationType));
  }
  if (options.read === "unread") conditions.push(isNull(notifications.readAt));
  else if (options.read === "read") conditions.push(isNotNull(notifications.readAt));

  const where = and(...conditions);
  const [countRows, unreadRows] = await Promise.all([
    db.select({ value: count() }).from(notifications).where(where),
    db.select({ value: count() }).from(notifications).where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
  ]);
  const total = countRows[0]?.value ?? 0;
  const pages = Math.max(1, Math.ceil(total / NOTIFICATIONS_PAGE_SIZE));
  const currentPage = Math.min(safePage, pages);
  const sortColumn = {
    title: notifications.title,
    type: notifications.type,
    readAt: notifications.readAt,
    createdAt: notifications.createdAt,
  }[options.sort ?? "createdAt"];
  const order = options.direction === "asc" ? asc(sortColumn) : desc(sortColumn);
  const items = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(order, desc(notifications.createdAt), desc(notifications.id))
    .limit(NOTIFICATIONS_PAGE_SIZE)
    .offset((currentPage - 1) * NOTIFICATIONS_PAGE_SIZE);

  return { items, total, unreadCount: unreadRows[0]?.value ?? 0, page: currentPage, pages };
}

/** Look up one notification only when it belongs to the signed-in recipient. */
export async function getNotificationForUser(
  userId: string,
  notificationId: string,
): Promise<Notification | null> {
  const rows = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.id, notificationId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Count of unread notifications for the bell badge. */
export async function countUnread(userId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return rows[0]?.value ?? 0;
}

/** Serializable payload for the header bell (preview + unread count). */
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

/** Mark one of the recipient's notifications read. */
export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.id, notificationId),
        isNull(notifications.readAt),
      ),
    );
}

/** Mark all of the signed-in recipient's unread notifications read. */
export async function markAllRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
