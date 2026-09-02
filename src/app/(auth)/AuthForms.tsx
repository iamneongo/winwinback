"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      setError(
        error.code === "EMAIL_NOT_VERIFIED"
          ? "Email chưa được xác thực. Vui lòng kiểm tra hộp thư để xác thực."
          : error.message || "Email hoặc mật khẩu không đúng",
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={cardClass}>
      <h1 className="text-xl font-black tracking-tight text-[#0d315d]">
        Đăng nhập
      </h1>
      <p className="mt-1 text-sm text-[#6681a7]">
        Chào mừng trở lại Win-Win Back.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="ban@email.com"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
            placeholder="••••••••"
          />
        </div>
        {error && <FieldError message={error} />}
        <Button
          type="submit"
          variant="cta"
          disabled={loading}
          className="h-11 w-full gap-2 rounded-xl font-bold"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[#6681a7]">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-[#1766e7] hover:underline">
          Đăng ký ngay
        </Link>
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
        <h1 className="mt-4 text-center text-xl font-black tracking-tight text-[#0d315d]">
          Kiểm tra email của bạn
        </h1>
        <p className="mt-2 text-center text-sm text-[#6681a7]">
          Chúng tôi đã gửi liên kết xác thực tới email bạn vừa đăng ký. Nhấn vào
          liên kết đó để kích hoạt tài khoản, sau đó đăng nhập.
        </p>
        <Link
          href="/login"
          className="mt-5 block text-center text-sm font-bold text-[#1766e7] hover:underline"
        >
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <h1 className="text-xl font-black tracking-tight text-[#0d315d]">
        Tạo tài khoản
      </h1>
      <p className="mt-1 text-sm text-[#6681a7]">
        Đăng ký để bắt đầu nhận hoàn tiền.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className={labelClass} htmlFor="name">
            Tên hiển thị
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputClass}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
            placeholder="ban@email.com"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>
        {error && <FieldError message={error} />}
        <Button
          type="submit"
          variant="cta"
          disabled={loading}
          className="h-11 w-full gap-2 rounded-xl font-bold"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Đang tạo…" : "Đăng ký"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-[#6681a7]">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-[#1766e7] hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
