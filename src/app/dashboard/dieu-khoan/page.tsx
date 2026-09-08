import { PolicyShell, PolicySection } from "@/components/policy/PolicyShell";

export const metadata = { title: "Điều khoản sử dụng — Win-Win Back" };

export default function TermsPage() {
  return (
    <PolicyShell
      title="Điều khoản sử dụng"
      subtitle="Vui lòng đọc kỹ trước khi sử dụng dịch vụ Win-Win Back."
    >
      <PolicySection heading="1. Chấp nhận điều khoản">
        <p>
          Khi tạo tài khoản và sử dụng Win-Win Back, bạn đồng ý với các điều khoản
          dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.
        </p>
      </PolicySection>
      <PolicySection heading="2. Dịch vụ">
        <p>
          Win-Win Back là dịch vụ hoàn tiền (cashback): bạn dán link sản phẩm từ
          TikTok Shop / Shopee, hệ thống tạo link tiếp thị liên kết; khi đơn hoàn
          tất và sàn ghi nhận hoa hồng, một phần hoa hồng được hoàn về ví của bạn.
        </p>
      </PolicySection>
      <PolicySection heading="3. Tài khoản">
        <p>
          Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động dưới
          tài khoản của mình. Mỗi người dùng chỉ nên sở hữu một tài khoản.
        </p>
      </PolicySection>
      <PolicySection heading="4. Hoàn tiền & thanh toán">
        <p>
          Tiền hoàn chỉ được ghi nhận cho các đơn hợp lệ, có thật và được sàn xác
          nhận hoa hồng. Chi tiết tỷ lệ, mốc thời gian và rút tiền xem tại trang
          Chính sách hoạt động.
        </p>
      </PolicySection>
      <PolicySection heading="5. Hành vi bị cấm">
        <p>
          Nghiêm cấm tạo đơn ảo, tài khoản ảo, thao túng để trục lợi phần thưởng.
          Vi phạm có thể dẫn tới từ chối hoàn tiền và khoá tài khoản.
        </p>
      </PolicySection>
      <PolicySection heading="6. Thay đổi điều khoản">
        <p>
          Win-Win Back có thể cập nhật điều khoản theo thời gian. Phiên bản mới có
          hiệu lực kể từ khi được đăng tải trên trang này.
        </p>
      </PolicySection>
      <p className="text-xs text-[#8298b6]">
        Nội dung mang tính tham khảo và cần được rà soát pháp lý trước khi áp dụng
        chính thức.
      </p>
    </PolicyShell>
  );
}
