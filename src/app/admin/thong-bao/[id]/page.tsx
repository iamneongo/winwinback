import { requireAdmin } from "@/lib/auth/guards";
import { NotificationDetailPage } from "@/components/dashboard/NotificationCenterPage";

export const metadata = { title: "Chi tiết thông báo quản trị — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminNotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [admin, { id }] = await Promise.all([requireAdmin(), params]);
  return (
    <NotificationDetailPage
      userId={admin.id}
      notificationId={id}
      basePath="/admin/thong-bao"
    />
  );
}
