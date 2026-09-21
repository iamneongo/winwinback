import { PublicPolicyShell } from "@/components/policy/PublicPolicyShell";
import { PrivacyBody } from "@/components/policy/content";

export const metadata = { title: "Chính sách bảo mật — Win-Win Back" };

export default function PublicPrivacyPage() {
  return (
    <PublicPolicyShell
      title="Chính sách bảo mật"
      subtitle="Cách Win-Win Back thu thập, sử dụng và bảo vệ dữ liệu của bạn."
    >
      <PrivacyBody />
    </PublicPolicyShell>
  );
}
