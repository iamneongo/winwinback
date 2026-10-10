"use client";

import { useState, useTransition } from "react";
import { Mail, ShoppingBag, Wallet } from "lucide-react";
import { updateNotificationPrefsAction } from "@/app/dashboard/actions";

type Prefs = {
  notifyOrders: boolean;
  notifyCashback: boolean;
  notifySystemEmail: boolean;
};

const ROWS: {
  key: keyof Prefs;
  icon: typeof Mail;
  tone: string;
  title: string;
  text: string;
}[] = [
  { key: "notifyOrders", icon: ShoppingBag, tone: "bg-[#eff9df] text-[#62a51d]", title: "Email cập nhật rút tiền", text: "Khi yêu cầu được duyệt, từ chối hoặc chi trả" },
  { key: "notifyCashback", icon: Wallet, tone: "bg-[#f5e9ff] text-[#a32cdb]", title: "Email hoàn tiền", text: "Khi tiền hoàn được cộng vào ví" },
];

export function NotificationSettings({ prefs }: { prefs: Prefs }) {
  const [state, setState] = useState<Prefs>(prefs);
  const [pending, startTransition] = useTransition();

  function toggle(key: keyof Prefs) {
    const next = { ...state, [key]: !state[key] };
    setState(next);
    const fd = new FormData();
    fd.set("notifyOrders", String(next.notifyOrders));
    fd.set("notifyCashback", String(next.notifyCashback));
    fd.set("notifySystemEmail", String(next.notifySystemEmail));
    startTransition(() => {
      void updateNotificationPrefsAction(undefined, fd);
    });
  }

  return (
    <div className="mt-2" aria-busy={pending}>
      <p className="mb-1 text-xs leading-5 text-[#718bad]">Các lựa chọn này chỉ bật/tắt email. Thông báo trong ứng dụng vẫn được lưu tại mục Thông báo.</p>
      {ROWS.map(({ key, icon: Icon, tone, title, text }) => {
        const on = state[key];
        return (
          <div key={key} className="flex items-center gap-3 border-b border-[#e8eef6] py-3 last:border-0">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex-1">
              <b className="block text-sm text-[#244a7c]">{title}</b>
              <small className="text-xs text-[#718bad]">{text}</small>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={title}
              onClick={() => toggle(key)}
              className={`relative h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${on ? "bg-[#27b43d]" : "bg-[#c8d4e4]"}`}
            >
              <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
