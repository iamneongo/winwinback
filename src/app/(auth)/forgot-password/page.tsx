import { AuthShell } from "../AuthShell";
import { ForgotPasswordForm } from "../AuthForms";

export const metadata = { title: "Quên mật khẩu — Win-Win Back" };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
