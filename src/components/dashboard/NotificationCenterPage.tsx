import { notFound } from "next/navigation";
import { MarkNotificationReadOnView } from "@/components/dashboard/NotificationActions";
import { NotificationDetail, NotificationsInbox } from "@/components/dashboard/NotificationsInbox";
import {
  getNotificationForUser,
  getNotificationsPage,
  notificationTypes,
  type NotificationFilter,
} from "@/lib/notifications";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function NotificationCenterPage({
  userId,
  basePath,
  searchParams,
}: {
  userId: string;
  basePath: "/dashboard/thong-bao" | "/admin/thong-bao";
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const rawFilter = typeof params.filter === "string" ? params.filter : "all";
  const filter: NotificationFilter =
    rawFilter === "unread" || notificationTypes.includes(rawFilter as (typeof notificationTypes)[number])
      ? rawFilter as NotificationFilter
      : "all";
  const result = await getNotificationsPage(userId, page, filter);

  return (
    <NotificationsInbox
      basePath={basePath}
      items={result.items}
      total={result.total}
      unreadCount={result.unreadCount}
      page={result.page}
      pages={result.pages}
      filter={filter}
    />
  );
}

export async function NotificationDetailPage({
  userId,
  notificationId,
  basePath,
}: {
  userId: string;
  notificationId: string;
  basePath: "/dashboard/thong-bao" | "/admin/thong-bao";
}) {
  const item = await getNotificationForUser(userId, notificationId);
  if (!item) notFound();

  return (
    <>
      <MarkNotificationReadOnView notificationId={item.id} read={item.readAt !== null} />
      <NotificationDetail item={item} basePath={basePath} />
    </>
  );
}
