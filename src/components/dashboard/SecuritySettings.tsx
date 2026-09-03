"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const inputBase =
  "h-11 w-full rounded-xl border border-[#dbe7f6] bg-[#f9fbff] px-3.5 text-sm text-[#173861] outline-none transition-colors focus:border-[#9ddd5d] focus:ring-2 focus:ring-[#b7e961]/25";
const labelClass = "block text-sm font-semibold text-[#244a7c]";

/** Password field with a show/hide eye toggle. */
function PasswordInput(props: React.ComponentProps<"input">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1.5">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${inputBase} pr-11`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8298b6] transition-colors hover:text-[#35537c]"
      >
        {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
}

/** Real change-password form backed by Better Auth. */
export function SecuritySettings() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setDone(false);
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword"));
    const newPassword = String(form.get("newPassword"));
    const confirm = String(form.get("confirm"));
    if (newPassword !== confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }
    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);
    if (error) {
      setError(
        error.code === "INVALID_PASSWORD"
          ? "Mật khẩu hiện tại không đúng"
          : error.message || "Không đổi được mật khẩu",
      );
      return;
    }
    setDone(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="mt-2 pb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 border-b border-[#e8eef6] py-3 text-left"
      >
        <LockKeyhole className="h-5 w-5 text-[#244a7c]" />
        <span className="flex-1">
          <b className="block text-sm text-[#244a7c]">Đổi mật khẩu</b>
          <small className="text-xs text-[#718bad]">
            Cập nhật mật khẩu để bảo vệ tài khoản
          </small>
        </span>
        <span className="text-xs font-bold text-[#1766e7]">
          {open ? "Đóng" : "Thay đổi"}
        </span>
      </button>

      {open && (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label className={labelClass} htmlFor="currentPassword">
              Mật khẩu hiện tại
            </label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="newPassword">
                Mật khẩu mới
              </label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="confirm">
                Xác nhận mật khẩu mới
              </label>
              <PasswordInput
                id="confirm"
                name="confirm"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>
          {error && (
            <p className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {done && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#3f8a2e]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Đã đổi mật khẩu. Các phiên đăng nhập khác đã bị đăng xuất.
            </p>
          )}
          <Button
            type="submit"
            variant="cta"
            disabled={loading}
            className="h-11 gap-2 rounded-xl font-bold"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
          </Button>
        </form>
      )}
    </div>
  );
}
