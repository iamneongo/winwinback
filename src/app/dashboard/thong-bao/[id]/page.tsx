import { requireUser } from "@/lib/auth/guards";
import { NotificationDetailPage } from "@/components/dashboard/NotificationCenterPage";

export const metadata = { title: "Chi tiết thông báo — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function CustomerNotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([requireUser(), params]);
  return (
    <NotificationDetailPage
      userId={user.id}
      notificationId={id}
      basePath="/dashboard/thong-bao"
    />
  );
}
