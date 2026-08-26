import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "../AuthForms";

export const metadata = { title: "Đăng nhập — Win-Win Back" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <main className="min-h-screen bg-[#082b4b] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-2xl font-black text-white"
        >
          Win-Win <span className="text-[#b7e961]">Back</span>
        </Link>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <h1 className="mb-6 text-xl font-bold text-white">Đăng nhập</h1>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
