import { requireAdmin } from "@/lib/auth/guards";
import { NotificationCenterPage } from "@/components/dashboard/NotificationCenterPage";

export const metadata = { title: "Thông báo quản trị — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  return (
    <NotificationCenterPage
      userId={admin.id}
      basePath="/admin/thong-bao"
      searchParams={searchParams}
    />
  );
}
