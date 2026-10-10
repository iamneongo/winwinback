import { notFound } from "next/navigation";
import { MarkAllNotificationsRead, MarkNotificationReadOnView } from "@/components/dashboard/NotificationActions";
import { NotificationDetail, NotificationsInbox } from "@/components/dashboard/NotificationsInbox";
import { NotificationsTable } from "@/app/admin/thong-bao/NotificationsTable";
import {
  getAdminNotificationsPage,
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
  if (basePath === "/admin/thong-bao") {
    const rawPage = typeof params.trang === "string" ? Number(params.trang) : 1;
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const type = typeof params.type === "string" ? params.type : "";
    const read = params.read === "read" || params.read === "unread" ? params.read : "";
    const sortOptions = ["title", "type", "readAt", "createdAt"] as const;
    const sort = typeof params.sort === "string" && sortOptions.includes(params.sort as (typeof sortOptions)[number])
      ? params.sort as (typeof sortOptions)[number]
      : undefined;
    const result = await getAdminNotificationsPage(userId, {
      page,
      search: typeof params.q === "string" ? params.q : "",
      type,
      read,
      sort,
      direction: params.dir === "asc" ? "asc" : "desc",
    });

    return (
      <main className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-5 sm:px-7 lg:px-8 lg:py-7">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#11335e] sm:text-[28px] lg:hidden">Thông báo</h1>
            <p className="mt-1 text-sm leading-6 text-[#58749a]">
              {result.unreadCount > 0 ? `Bạn có ${result.unreadCount} thông báo chưa đọc.` : "Theo dõi cập nhật mới nhất của hệ thống."}
            </p>
          </div>
          <MarkAllNotificationsRead unreadCount={result.unreadCount} />
        </header>
        <NotificationsTable rows={result.items} total={result.total} page={result.page} />
      </main>
    );
  }

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
