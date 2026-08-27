"use client";

import { useActionState } from "react";
import {
  connectTikTokAction,
  refreshTikTokAction,
  disconnectTikTokAction,
  fetchTikTokOrdersAction,
  type ActionState,
  type OrdersState,
} from "@/app/admin/integrations/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#b7e961]/60";

export interface TikTokStatus {
  configured: boolean;
  connected: boolean;
  sellerName: string | null;
  openId: string | null;
  userType: number | null;
  grantedScopes: string[];
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

function ManualConnectForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    connectTikTokAction,
    undefined,
  );
  return (
    <form action={action} className="space-y-3">
      <input
        name="authCode"
        type="text"
        required
        placeholder="Dán auth code (tham số ?code=... trên URL callback)"
        className={inputClass}
      />
      <div className="flex items-center gap-4">
        <SubmitButton>Kết nối bằng auth code</SubmitButton>
        {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-[#b7e961]">{state.success}</p>
        )}
      </div>
    </form>
  );
}

function RefreshButton() {
  const [state, action] = useActionState<ActionState, FormData>(
    () => refreshTikTokAction(),
    undefined,
  );
  return (
    <form action={action} className="inline-flex items-center gap-3">
      <SubmitButton variant="ghost">Làm mới token</SubmitButton>
      {state?.error && <span className="text-sm text-red-300">{state.error}</span>}
      {state?.success && (
        <span className="text-sm text-[#b7e961]">{state.success}</span>
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
      <SubmitButton variant="danger">Ngắt kết nối</SubmitButton>
    </form>
  );
}

function OrdersPanel() {
  const [state, action] = useActionState<OrdersState, FormData>(
    () => fetchTikTokOrdersAction(),
    undefined,
  );
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            Dữ liệu đơn hàng từ TikTok Shop
          </p>
          <p className="text-xs text-white/50">
            Đồng bộ trực tiếp qua Affiliate Creator API (order id + product id
            thật).
          </p>
        </div>
        <form action={action}>
          <SubmitButton variant="ghost">Đồng bộ đơn hàng</SubmitButton>
        </form>
      </div>

      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}

      {state?.rows && (
        <>
          <p className="text-xs text-white/50">
            Đã đồng bộ {state.rows.length} dòng lúc {state.fetchedAt}.
          </p>
          {state.rows.length === 0 ? (
            <p className="text-sm text-white/60">
              Chưa có đơn hàng affiliate nào cho creator này.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="text-white/40">
                  <tr>
                    <th className="py-2 pr-3">Order ID</th>
                    <th className="py-2 pr-3">Product ID</th>
                    <th className="py-2 pr-3">Sản phẩm</th>
                    <th className="py-2 pr-3">Giá</th>
                    <th className="py-2 pr-3">Trạng thái</th>
                    <th className="py-2">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {state.rows.map((row, i) => (
                    <tr key={`${row.orderId}-${i}`} className="border-t border-white/10">
                      <td className="py-2 pr-3 font-mono">{row.orderId}</td>
                      <td className="py-2 pr-3 font-mono">{row.productId}</td>
                      <td className="py-2 pr-3">{row.productName}</td>
                      <td className="py-2 pr-3">{row.price}</td>
                      <td className="py-2 pr-3">{row.status}</td>
                      <td className="py-2">{row.createdAt ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function TikTokIntegration({ status }: { status: TikTokStatus }) {
  if (!status.configured) {
    return (
      <p className="text-sm text-amber-200">
        Chưa cấu hình <code>TIKTOK_APP_KEY</code> / <code>TIKTOK_APP_SECRET</code>{" "}
        trong biến môi trường. Thêm vào <code>.env.local</code> rồi khởi động lại.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {status.connected ? (
        <div className="space-y-3 rounded-2xl border border-[#b7e961]/30 bg-[#b7e961]/10 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#b7e961] px-3 py-0.5 text-xs font-bold text-[#14334c]">
              Đã kết nối
            </span>
            {status.sellerName && (
              <span className="text-sm text-white">{status.sellerName}</span>
            )}
            {status.userType !== null && (
              <span className="text-xs text-white/60">
                user_type: {status.userType}
                {status.userType === 1 ? " (creator)" : " (không phải creator!)"}
              </span>
            )}
          </div>
          <dl className="grid gap-1 text-xs text-white/60">
            {status.openId && (
              <div>
                <span className="text-white/40">open_id:</span> {status.openId}
              </div>
            )}
            <div>
              <span className="text-white/40">Access token hết hạn:</span>{" "}
              {status.accessTokenExpiresAt ?? "—"}
            </div>
            <div>
              <span className="text-white/40">Refresh token hết hạn:</span>{" "}
              {status.refreshTokenExpiresAt ?? "—"}
            </div>
            {status.grantedScopes.length > 0 && (
              <div>
                <span className="text-white/40">Scopes:</span>{" "}
                {status.grantedScopes.join(", ")}
              </div>
            )}
          </dl>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <RefreshButton />
            <DisconnectButton />
          </div>
        </div>
      ) : null}

      {status.connected && <OrdersPanel />}

      {!status.connected && (
        <p className="text-sm text-white/60">
          Chưa kết nối tài khoản Affiliate Creator.
        </p>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-white">Cách kết nối</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-white/70">
          <li>
            Bấm{" "}
            <a
              href="/admin/integrations/tiktok/start"
              className="font-semibold text-[#b7e961] underline"
            >
              Bắt đầu uỷ quyền
            </a>{" "}
            và đăng nhập bằng tài khoản <b>TikTok Shop Creator</b> của bạn.
          </li>
          <li>
            Sau khi đồng ý, TikTok chuyển hướng về Redirect URL kèm{" "}
            <code>?code=...</code>. Nếu callback tự động chưa bật, copy giá trị{" "}
            <code>code</code> đó và dán vào ô dưới đây.
          </li>
        </ol>
        <ManualConnectForm />
      </div>
    </div>
  );
}
