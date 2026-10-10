import { requireUser } from "@/lib/auth/guards";
import { NotificationCenterPage } from "@/components/dashboard/NotificationCenterPage";

export const metadata = { title: "Thông báo — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function CustomerNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  return (
    <NotificationCenterPage
      userId={user.id}
      basePath="/dashboard/thong-bao"
      searchParams={searchParams}
    />
  );
}
