import { PolicySection } from "@/components/policy/PolicyShell";

const disclaimer = (
  <p className="text-xs text-[#8298b6]">
    Nội dung mang tính tham khảo và cần được rà soát pháp lý trước khi áp dụng
    chính thức.
  </p>
);

/** Privacy policy body — shared by the public and in-dashboard pages. */
export function PrivacyBody() {
  return (
    <>
      <PolicySection heading="1. Dữ liệu chúng tôi thu thập">
        <p>
          Thông tin tài khoản (tên, email), thông tin rút tiền (ngân hàng, chủ
          tài khoản) do bạn cung cấp, cùng dữ liệu hoạt động: link đã tạo, lượt
          bấm, đơn hàng và giao dịch ví.
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
          Bạn có thể cập nhật thông tin cá nhân trong phần Cài đặt, điều chỉnh
          tùy chọn thông báo, hoặc liên hệ hỗ trợ để yêu cầu về dữ liệu của mình.
        </p>
      </PolicySection>
      {disclaimer}
    </>
  );
}

/** Terms of service body — shared by the public and in-dashboard pages. */
export function TermsBody() {
  return (
    <>
      <PolicySection heading="1. Chấp nhận điều khoản">
        <p>
          Khi tạo tài khoản và sử dụng Win-Win Back, bạn đồng ý với các điều
          khoản dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.
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
      {disclaimer}
    </>
  );
}
