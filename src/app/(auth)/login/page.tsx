import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardReturnPath } from "@/lib/auth/return-path";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "../AuthForms";

export const metadata = { title: "Đăng nhập — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const returnTo = dashboardReturnPath((await searchParams).next);
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : returnTo);

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  return (
    <AuthShell>
      <LoginForm googleEnabled={googleEnabled} returnTo={returnTo} />
    </AuthShell>
  );
}
