import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "../AuthForms";

export const metadata = { title: "Đăng nhập — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
