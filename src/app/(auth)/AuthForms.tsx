"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { signIn, signUp, authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const cardClass =
  "w-full max-w-[26rem] rounded-2xl bg-white p-7 shadow-[0_24px_60px_rgba(4,20,40,0.45)]";
const labelClass = "block text-sm font-semibold text-[#0d315d]";
const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#dbe7f6] bg-[#f9fbff] px-3.5 text-sm text-[#173861] outline-none transition-colors focus:border-[#9ddd5d] focus:ring-2 focus:ring-[#b7e961]/25";

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </p>
  );
}

export function LoginForm() {
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
    const { error } = await signIn.email({
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
    router.push("/dashboard");
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
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="ban@email.com" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="password">Mật khẩu</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-[#1766e7] hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} placeholder="••••••••" />
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
      <p className="mt-5 text-center text-sm text-[#6681a7]">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-[#1766e7] hover:underline">Đăng ký ngay</Link>
      </p>
    </div>
  );
}

export function RegisterForm() {
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
          <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} placeholder="Tối thiểu 6 ký tự" />
        </div>
        {error && <FieldError message={error} />}
        <Button type="submit" variant="cta" disabled={loading} className="h-11 w-full gap-2 rounded-xl font-bold">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang tạo…" : "Đăng ký"}
        </Button>
      </form>
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
          <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} placeholder="Tối thiểu 6 ký tự" />
        </div>
        <div>
          <label className={labelClass} htmlFor="confirm">Xác nhận mật khẩu</label>
          <input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" className={inputClass} placeholder="Nhập lại mật khẩu" />
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
