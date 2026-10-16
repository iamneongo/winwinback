import { PublicPolicyShell } from "@/components/policy/PublicPolicyShell";
import { privacySections } from "@/components/policy/content";

export const metadata = { title: "Chính sách bảo mật — Win-Win Back" };

export default function PublicPrivacyPage() {
  return (
    <PublicPolicyShell
      title="Chính sách bảo mật"
      subtitle="Cách Win-Win Back thu thập, sử dụng và bảo vệ dữ liệu của bạn."
      kind="privacy"
      sections={privacySections}
      faqs={[
        { question: "Win-Win Back thu thập những thông tin nào?", answer: privacySections[0].body },
        { question: "Thông tin của tôi có được bán cho bên thứ ba không?", answer: privacySections[2].body },
        { question: "Tôi có thể cập nhật thông tin cá nhân không?", answer: privacySections[4].body },
      ]}
    />
  );
}
