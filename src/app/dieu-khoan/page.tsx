import { PublicPolicyShell } from "@/components/policy/PublicPolicyShell";
import { termsSections } from "@/components/policy/content";

export const metadata = { title: "Điều khoản sử dụng — Win-Win Back" };

export default function PublicTermsPage() {
  return (
    <PublicPolicyShell
      title="Điều khoản sử dụng"
      subtitle="Vui lòng đọc kỹ trước khi sử dụng dịch vụ Win-Win Back."
      kind="terms"
      sections={termsSections}
      faqs={[
        { question: "Khi nào tôi nhận được tiền hoàn?", answer: termsSections[3].body },
        { question: "Tôi cần làm gì để bảo vệ tài khoản?", answer: termsSections[2].body },
        { question: "Điều khoản có thể thay đổi không?", answer: termsSections[5].body },
      ]}
    />
  );
}
