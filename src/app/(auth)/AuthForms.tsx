"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, MailCheck } from "lucide-react";
import { signIn, signUp, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const cardClass =
  "w-full max-w-[26rem] rounded-2xl bg-white p-7 shadow-[0_24px_60px_rgba(4,20,40,0.45)]";
const labelClass = "block text-sm font-semibold text-[#0d315d]";
const inputBase =
  "h-11 w-full rounded-xl border border-[#dbe7f6] bg-[#f9fbff] px-3.5 text-sm text-[#173861] outline-none transition-colors focus:border-[#9ddd5d] focus:ring-2 focus:ring-[#b7e961]/25";
const inputClass = `mt-1.5 ${inputBase}`;

const leftIconClass =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8298b6]";

/** Email input with a leading mail icon. */
function EmailInput(props: React.ComponentProps<"input">) {
  return (
    <div className="relative mt-1.5">
      <Mail className={`${leftIconClass} h-[18px] w-[18px]`} />
      <input {...props} className={`${inputBase} pl-11`} />
    </div>
  );
}

/** Password field with a leading lock icon and a show/hide eye toggle. */
function PasswordInput({ withIcon = true, ...props }: React.ComponentProps<"input"> & { withIcon?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1.5">
      {withIcon && <Lock className={`${leftIconClass} h-[18px] w-[18px]`} />}
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${inputBase} pr-11 ${withIcon ? "pl-11" : ""}`}
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

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

/** "Đăng nhập với Google" — starts the Better Auth Google OAuth flow. */
function GoogleButton({ label = "Đăng nhập với Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    // On success the browser navigates to Google; control usually leaves the
    // page. Reset loading if the call returns without redirecting (e.g. error).
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
    setLoading(false);
  }
  return (
    <button
      type="button"
      onClick={go}
      disabled={loading}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#dbe7f6] bg-white text-sm font-bold text-[#0d315d] transition-colors hover:bg-[#f7faff] disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
      {label}
    </button>
  );
}

/** A labelled "hoặc" divider. */
function OrDivider() {
  return (
    <div className="mt-5 flex items-center gap-3 text-xs font-medium text-[#9db0c8]">
      <span className="h-px flex-1 bg-[#e4ecf6]" />
      hoặc
      <span className="h-px flex-1 bg-[#e4ecf6]" />
    </div>
  );
}

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  // Email awaiting verification — enables the "resend verification" action.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>();
  const [resent, setResent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    setUnverifiedEmail(undefined);
    setResent(false);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    setLoading(true);
    const { data, error } = await signIn.email({
      email,
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      if (error.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
        setError("Email chưa được xác thực. Kiểm tra hộp thư hoặc gửi lại bên dưới.");
      } else {
        setError(error.message || "Email hoặc mật khẩu không đúng");
      }
      return;
    }
    // Admins land on the admin panel; everyone else on the customer dashboard.
    const role = (data?.user as { role?: string } | undefined)?.role;
    router.push(role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  async function resendVerification() {
    if (!unverifiedEmail) return;
    await authClient.sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: "/dashboard",
    });
    setResent(true);
  }

  return (
    <div className={cardClass}>
      <h1 className="text-xl font-black tracking-tight text-[#0d315d]">Đăng nhập</h1>
      <p className="mt-1 text-sm text-[#6681a7]">Chào mừng trở lại Win-Win Back.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <EmailInput id="email" name="email" type="email" required autoComplete="email" placeholder="ban@email.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="password">Mật khẩu</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-[#1766e7] hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput id="password" name="password" required autoComplete="current-password" placeholder="••••••••" />
        </div>
        {error && <FieldError message={error} />}
        {unverifiedEmail &&
          (resent ? (
            <p className="flex items-center gap-1.5 text-sm font-medium text-[#3f8a2e]">
              <MailCheck className="h-4 w-4 shrink-0" />
              Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư.
            </p>
          ) : (
            <button
              type="button"
              onClick={resendVerification}
              className="text-sm font-bold text-[#1766e7] hover:underline"
            >
              Gửi lại email xác thực
            </button>
          ))}
        <Button type="submit" variant="cta" disabled={loading} className="h-11 w-full gap-2 rounded-xl font-bold">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
      {googleEnabled && (
        <>
          <OrDivider />
          <div className="mt-4">
            <GoogleButton />
          </div>
        </>
      )}
      <p className="mt-5 text-center text-sm text-[#6681a7]">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-[#1766e7] hover:underline">Đăng ký ngay</Link>
      </p>
    </div>
  );
}

export function RegisterForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Không tạo được tài khoản, thử lại sau");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className={cardClass}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eafbe0] text-[#3f8a2e]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-xl font-black tracking-tight text-[#0d315d]">Kiểm tra email của bạn</h1>
        <p className="mt-2 text-center text-sm text-[#6681a7]">
          Chúng tôi đã gửi liên kết xác thực tới email bạn vừa đăng ký. Nhấn vào liên kết đó để kích hoạt tài khoản, sau đó đăng nhập.
        </p>
        <Link href="/login" className="mt-5 block text-center text-sm font-bold text-[#1766e7] hover:underline">
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h1 className="text-xl font-black tracking-tight text-[#0d315d]">Tạo tài khoản</h1>
      <p className="mt-1 text-sm text-[#6681a7]">Đăng ký để bắt đầu nhận hoàn tiền.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">Tên hiển thị</label>
          <input id="name" name="name" type="text" required autoComplete="name" className={inputClass} placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="ban@email.com" />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">Mật khẩu</label>
          <PasswordInput id="password" name="password" required minLength={6} autoComplete="new-password" placeholder="Tối thiểu 6 ký tự" />
        </div>
        {error && <FieldError message={error} />}
        <Button type="submit" variant="cta" disabled={loading} className="h-11 w-full gap-2 rounded-xl font-bold">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang tạo…" : "Đăng ký"}
        </Button>
      </form>
      {googleEnabled && (
        <>
          <OrDivider />
          <div className="mt-4">
            <GoogleButton label="Đăng ký với Google" />
          </div>
        </>
      )}
      <p className="mt-5 text-center text-sm text-[#6681a7]">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-[#1766e7] hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const email = String(new FormData(e.currentTarget).get("email"));
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message || "Không gửi được email, thử lại sau");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className={cardClass}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eafbe0] text-[#3f8a2e]">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-center text-xl font-black tracking-tight text-[#0d315d]">Đã gửi email</h1>
        <p className="mt-2 text-center text-sm text-[#6681a7]">
          Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu. Kiểm tra hộp thư (và mục spam).
        </p>
        <Link href="/login" className="mt-5 block text-center text-sm font-bold text-[#1766e7] hover:underline">
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h1 className="text-xl font-black tracking-tight text-[#0d315d]">Quên mật khẩu</h1>
      <p className="mt-1 text-sm text-[#6681a7]">Nhập email để nhận liên kết đặt lại mật khẩu.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="ban@email.com" />
        </div>
        {error && <FieldError message={error} />}
        <Button type="submit" variant="cta" disabled={loading} className="h-11 w-full gap-2 rounded-xl font-bold">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang gửi…" : "Gửi liên kết đặt lại"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[#6681a7]">
        <Link href="/login" className="font-bold text-[#1766e7] hover:underline">Quay lại đăng nhập</Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const paramError = params.get("error");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword !== String(form.get("confirm"))) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword, token });
    setLoading(false);
    if (error) {
      setError(error.message || "Liên kết không hợp lệ hoặc đã hết hạn");
      return;
    }
    router.push("/login");
  }

  if (!token || paramError) {
    return (
      <div className={cardClass}>
        <h1 className="text-xl font-black tracking-tight text-[#0d315d]">Liên kết không hợp lệ</h1>
        <p className="mt-2 text-sm text-[#6681a7]">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.
        </p>
        <Link href="/forgot-password" className="mt-5 block text-center text-sm font-bold text-[#1766e7] hover:underline">
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h1 className="text-xl font-black tracking-tight text-[#0d315d]">Đặt mật khẩu mới</h1>
      <p className="mt-1 text-sm text-[#6681a7]">Nhập mật khẩu mới cho tài khoản của bạn.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="password">Mật khẩu mới</label>
          <PasswordInput id="password" name="password" required minLength={6} autoComplete="new-password" placeholder="Tối thiểu 6 ký tự" />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm">Xác nhận mật khẩu</label>
          <PasswordInput id="confirm" name="confirm" required minLength={6} autoComplete="new-password" placeholder="Nhập lại mật khẩu" />
        </div>
        {error && <FieldError message={error} />}
        <Button type="submit" variant="cta" disabled={loading} className="h-11 w-full gap-2 rounded-xl font-bold">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang cập nhật…" : "Đặt lại mật khẩu"}
        </Button>
      </form>
    </div>
  );
}
