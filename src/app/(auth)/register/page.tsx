import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthShell } from "../AuthShell";
import { RegisterForm } from "../AuthForms";

export const metadata = { title: "Đăng ký — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  return (
    <AuthShell>
      <RegisterForm googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
