import { Suspense } from "react";
import { AuthShell } from "../AuthShell";
import { ResetPasswordForm } from "../AuthForms";

export const metadata = { title: "Đặt lại mật khẩu — Win-Win Back" };
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
