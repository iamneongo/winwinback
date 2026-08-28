"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Apple,
  type LucideIcon,
} from "lucide-react";
import { loginAction, registerAction, type AuthState } from "./actions";

/* ── shared field primitives ─────────────────────────────────────────── */

const fieldWrap =
  "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition focus-within:border-[#9fd94e] focus-within:ring-2 focus-within:ring-[#b7e961]/30";
const fieldInput =
  "min-w-0 flex-1 bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400";

function IconField({
  icon: Icon,
  ...props
}: {
  icon: LucideIcon;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={fieldWrap}>
      <Icon className="h-[18px] w-[18px] shrink-0 text-slate-400" />
      <input className={fieldInput} {...props} />
    </div>
  );
}

function PasswordField({
  placeholder,
  autoComplete,
}: {
  placeholder: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={fieldWrap}>
      <Lock className="h-[18px] w-[18px] shrink-0 text-slate-400" />
      <input
        name="password"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className={fieldInput}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="shrink-0 text-slate-400 transition-colors hover:text-slate-600"
      >
        {show ? (
          <EyeOff className="h-[18px] w-[18px]" />
        ) : (
          <Eye className="h-[18px] w-[18px]" />
        )}
      </button>
    </div>
  );
}

function SubmitBtn({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-[#14334c] transition-all duration-200 hover:brightness-105 disabled:opacity-70"
      style={{
        background:
          "linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)",
        boxShadow:
          "0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 6px 16px rgba(159,217,78,0.4)",
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
        }}
        aria-hidden="true"
      />
      <span className="relative flex items-center gap-2">
        {pending ? "Đang xử lý…" : children}
        {!pending && <ArrowRight className="h-[18px] w-[18px]" />}
      </span>
    </button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function SocialButtons({ onUnavailable }: { onUnavailable: () => void }) {
  const cls =
    "flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
  return (
    <div className="space-y-3">
      <button type="button" onClick={onUnavailable} className={cls}>
        <GoogleIcon className="h-[18px] w-[18px]" />
        Tiếp tục với Google
      </button>
      <button type="button" onClick={onUnavailable} className={cls}>
        <Apple className="h-[18px] w-[18px] fill-slate-900 text-slate-900" />
        Tiếp tục với Apple
      </button>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs font-medium text-slate-400">hoặc</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function ErrorNote({ state }: { state: AuthState }) {
  if (!state?.error) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {state.error}
    </p>
  );
}

const cardClass =
  "w-full max-w-md rounded-[28px] border border-white/10 bg-white p-7 text-slate-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)] sm:p-8";
const SOON = "Tính năng này đang được phát triển.";

/* ── Login ───────────────────────────────────────────────────────────── */

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  );
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className={cardClass}>
      <h2 className="text-2xl font-black tracking-tight">Đăng nhập</h2>
      <p className="mt-1 text-sm text-slate-500">Chào mừng bạn quay lại</p>

      <form action={action} className="mt-6 space-y-4">
        <ErrorNote state={state} />
        <IconField
          icon={User}
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
        <PasswordField placeholder="Mật khẩu" autoComplete="current-password" />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300 accent-[#9fd94e]"
            />
            Ghi nhớ đăng nhập
          </label>
          <button
            type="button"
            onClick={() => setNotice(SOON)}
            className="text-sm font-medium text-[#2f6fd6] hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        <SubmitBtn>Đăng nhập</SubmitBtn>
      </form>

      <Divider />
      <SocialButtons onUnavailable={() => setNotice(SOON)} />
      {notice && (
        <p className="mt-3 text-center text-xs text-slate-500">{notice}</p>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#2f6fd6] hover:underline"
        >
          Tạo tài khoản
        </Link>
      </p>
    </div>
  );
}

/* ── Register ─────────────────────────────────────────────────────────── */

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    registerAction,
    undefined,
  );
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className={cardClass}>
      <h2 className="text-2xl font-black tracking-tight">Tạo tài khoản</h2>
      <p className="mt-1 text-sm text-slate-500">
        Bắt đầu nhận hoàn tiền chỉ trong vài bước.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <ErrorNote state={state} />
        <IconField
          icon={User}
          name="name"
          type="text"
          placeholder="Họ và tên"
          autoComplete="name"
          required
        />
        <IconField
          icon={Mail}
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
        <PasswordField
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          autoComplete="new-password"
        />
        <SubmitBtn>Tạo tài khoản</SubmitBtn>
      </form>

      <Divider />
      <SocialButtons onUnavailable={() => setNotice(SOON)} />
      {notice && (
        <p className="mt-3 text-center text-xs text-slate-500">{notice}</p>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#2f6fd6] hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
