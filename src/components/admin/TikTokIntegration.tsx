"use client";

import { useActionState } from "react";
import { RefreshCw, Unplug } from "lucide-react";
import {
  refreshTikTokAction,
  disconnectTikTokAction,
  type ActionState,
} from "@/app/admin/integrations/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export interface TikTokStatus {
  configured: boolean;
  connected: boolean;
  sellerName: string | null;
}

function RefreshButton() {
  const [state, action] = useActionState<ActionState, FormData>(
    () => refreshTikTokAction(),
    undefined,
  );
  return (
    <form action={action} className="inline-flex items-center gap-3">
      <SubmitButton
        variant="primary"
        className="px-4 text-[#173b5e] shadow-[0_3px_8px_rgba(183,233,97,0.3)] hover:brightness-105"
      >
        <RefreshCw className="size-4" />
        Làm mới token
      </SubmitButton>
      {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
      {state?.success && (
        <span className="text-sm font-medium text-[#2f7a1c]">{state.success}</span>
      )}
    </form>
  );
}

function DisconnectButton() {
  const [, action] = useActionState<ActionState, FormData>(
    () => disconnectTikTokAction(),
    undefined,
  );
  return (
    <form action={action} className="inline">
      <SubmitButton
        variant="danger"
        className="border-red-200 bg-white text-red-700 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-800"
      >
        <Unplug className="size-4" />
        Ngắt kết nối
      </SubmitButton>
    </form>
  );
}

export function TikTokIntegration({ status }: { status: TikTokStatus }) {
  if (!status.configured) {
    return (
      <p className="text-sm text-[#b7791f]">
        Chưa cấu hình <code>TIKTOK_APP_KEY</code> / <code>TIKTOK_APP_SECRET</code>{" "}
        trong biến môi trường. Thêm vào <code>.env.local</code> rồi khởi động lại.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {status.connected ? (
        <div className="space-y-3 rounded-2xl border border-[#b7e961]/60 bg-[#eefbe0] p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#b7e961] px-3 py-0.5 text-xs font-bold text-[#173b5e]">
              Đã kết nối
            </span>
            {status.sellerName && (
              <span className="text-sm font-semibold text-[#173861]">
                {status.sellerName}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <RefreshButton />
            <DisconnectButton />
          </div>
        </div>
      ) : null}

      {!status.connected && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-[#49688f]">Chưa kết nối tài khoản TikTok Shop Creator.</p>
          <a
            href="/admin/integrations/tiktok/start"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#b7e961] px-4 text-sm font-bold text-[#173b5e] hover:bg-[#a9e75e]"
          >
            Kết nối TikTok Shop
          </a>
        </div>
      )}
    </div>
  );
}
