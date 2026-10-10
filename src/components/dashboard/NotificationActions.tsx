"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import {
  markNotificationReadAction,
  markNotificationsReadAction,
} from "@/app/notifications/actions";

export function MarkAllNotificationsRead({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (unreadCount === 0) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await markNotificationsReadAction();
          router.refresh();
        })
      }
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dbe7f6] px-3 text-xs font-bold text-[#315a90] transition-colors hover:bg-[#f2f7fd] disabled:opacity-60"
    >
      <CheckCheck className="size-4" />
      {pending ? "Đang cập nhật…" : "Đánh dấu đã đọc"}
    </button>
  );
}

export function MarkNotificationReadOnView({
  notificationId,
  read,
}: {
  notificationId: string;
  read: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (read) return;
    startTransition(async () => {
      await markNotificationReadAction(notificationId);
      router.refresh();
    });
  }, [notificationId, read, router]);

  return null;
}
