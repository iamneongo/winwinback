"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/guards";
import { markAllRead, markNotificationRead } from "@/lib/notifications";

function revalidateNotificationViews() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/thong-bao");
  revalidatePath("/admin");
  revalidatePath("/admin/thong-bao");
}

/** Mark one notification read, scoped to the signed-in account. */
export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const user = await requireUser();
  await markNotificationRead(user.id, notificationId);
  revalidateNotificationViews();
}

/** Mark all notifications for the signed-in account read. */
export async function markNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await markAllRead(user.id);
  revalidateNotificationViews();
}
