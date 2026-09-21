import { PublicPolicyShell } from "@/components/policy/PublicPolicyShell";
import { TermsBody } from "@/components/policy/content";

export const metadata = { title: "Điều khoản sử dụng — Win-Win Back" };

export default function PublicTermsPage() {
  return (
    <PublicPolicyShell
      title="Điều khoản sử dụng"
      subtitle="Vui lòng đọc kỹ trước khi sử dụng dịch vụ Win-Win Back."
    >
      <TermsBody />
    </PublicPolicyShell>
  );
}
