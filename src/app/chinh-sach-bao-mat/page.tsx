import { PolicyShell, PolicySection } from "@/components/policy/PolicyShell";

export const metadata = { title: "Chính sách bảo mật — Win-Win Back" };

export default function PrivacyPage() {
  return (
    <PolicyShell
      title="Chính sách bảo mật"
      subtitle="Cách Win-Win Back thu thập, sử dụng và bảo vệ dữ liệu của bạn."
    >
      <PolicySection heading="1. Dữ liệu chúng tôi thu thập">
        <p>
          Thông tin tài khoản (tên, email), thông tin rút tiền (ngân hàng, chủ tài
          khoản) do bạn cung cấp, cùng dữ liệu hoạt động: link đã tạo, lượt bấm,
          đơn hàng và giao dịch ví.
        </p>
      </PolicySection>
      <PolicySection heading="2. Mục đích sử dụng">
        <p>
          Để vận hành dịch vụ hoàn tiền: đối soát đơn, ghi nhận hoa hồng, xử lý
          rút tiền, chống gian lận và gửi thông báo liên quan tới tài khoản của
          bạn.
        </p>
      </PolicySection>
      <PolicySection heading="3. Chia sẻ dữ liệu">
        <p>
          Chúng tôi không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ với các
          nền tảng đối tác (TikTok Shop, Shopee) ở mức cần thiết để đối soát đơn,
          hoặc khi pháp luật yêu cầu.
        </p>
      </PolicySection>
      <PolicySection heading="4. Bảo mật & lưu trữ">
        <p>
          Mật khẩu được mã hoá; dữ liệu lưu trên hạ tầng có kiểm soát truy cập.
          Chúng tôi lưu dữ liệu trong thời gian cần thiết để cung cấp dịch vụ và
          tuân thủ nghĩa vụ pháp lý.
        </p>
      </PolicySection>
      <PolicySection heading="5. Quyền của bạn">
        <p>
          Bạn có thể cập nhật thông tin cá nhân trong phần Cài đặt, điều chỉnh tùy
          chọn thông báo, hoặc liên hệ hỗ trợ để yêu cầu về dữ liệu của mình.
        </p>
      </PolicySection>
      <p className="text-xs text-[#8298b6]">
        Nội dung mang tính tham khảo và cần được rà soát pháp lý trước khi áp dụng
        chính thức.
      </p>
    </PolicyShell>
  );
}
