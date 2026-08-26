"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type AuthState } from "./actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#b7e961]/60";

function ErrorNote({ state }: { state: AuthState }) {
  if (!state?.error) return null;
  return (
    <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">
      {state.error}
    </p>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    loginAction,
    undefined,
  );
  return (
    <form action={action} className="space-y-4">
      <ErrorNote state={state} />
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className={inputClass}
      />
      <input
        name="password"
        type="password"
        placeholder="Mật khẩu"
        autoComplete="current-password"
        required
        className={inputClass}
      />
      <SubmitButton className="w-full">Đăng nhập</SubmitButton>
      <p className="text-center text-sm text-white/60">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-[#b7e961] hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<AuthState, FormData>(
    registerAction,
    undefined,
  );
  return (
    <form action={action} className="space-y-4">
      <ErrorNote state={state} />
      <input
        name="name"
        type="text"
        placeholder="Họ và tên"
        autoComplete="name"
        required
        className={inputClass}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        className={inputClass}
      />
      <input
        name="password"
        type="password"
        placeholder="Mật khẩu (tối thiểu 6 ký tự)"
        autoComplete="new-password"
        required
        className={inputClass}
      />
      <SubmitButton className="w-full">Tạo tài khoản</SubmitButton>
      <p className="text-center text-sm text-white/60">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-[#b7e961] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
