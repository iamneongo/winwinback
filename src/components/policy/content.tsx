import { PolicySection } from "@/components/policy/PolicyShell";

export type PublicPolicySection = {
  id: string;
  heading: string;
  body: string;
};

export const privacySections: PublicPolicySection[] = [
  {
    id: "du-lieu-thu-thap",
    heading: "Dữ liệu chúng tôi thu thập",
    body: "Thông tin tài khoản (tên, email), thông tin rút tiền (ngân hàng, chủ tài khoản) do bạn cung cấp, cùng dữ liệu hoạt động: link đã tạo, lượt bấm, đơn hàng và giao dịch ví.",
  },
  {
    id: "muc-dich-su-dung",
    heading: "Mục đích sử dụng",
    body: "Để vận hành dịch vụ hoàn tiền: đối soát đơn, ghi nhận hoa hồng, xử lý rút tiền, chống gian lận và gửi thông báo liên quan tới tài khoản của bạn.",
  },
  {
    id: "chia-se-du-lieu",
    heading: "Chia sẻ dữ liệu",
    body: "Chúng tôi không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ với các nền tảng đối tác (TikTok Shop, Shopee) ở mức cần thiết để đối soát đơn, hoặc khi pháp luật yêu cầu.",
  },
  {
    id: "bao-mat-luu-tru",
    heading: "Bảo mật & lưu trữ",
    body: "Mật khẩu được mã hoá; dữ liệu lưu trên hạ tầng có kiểm soát truy cập. Chúng tôi lưu dữ liệu trong thời gian cần thiết để cung cấp dịch vụ và tuân thủ nghĩa vụ pháp lý.",
  },
  {
    id: "quyen-cua-ban",
    heading: "Quyền của bạn",
    body: "Bạn có thể cập nhật thông tin cá nhân trong phần Cài đặt, điều chỉnh tùy chọn thông báo, hoặc liên hệ hỗ trợ để yêu cầu về dữ liệu của mình.",
  },
];

export const termsSections: PublicPolicySection[] = [
  {
    id: "chap-nhan-dieu-khoan",
    heading: "Chấp nhận điều khoản",
    body: "Khi tạo tài khoản và sử dụng Win-Win Back, bạn đồng ý với các điều khoản dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.",
  },
  {
    id: "dich-vu",
    heading: "Dịch vụ",
    body: "Win-Win Back là dịch vụ hoàn tiền (cashback): bạn dán link sản phẩm từ TikTok Shop / Shopee, hệ thống tạo link tiếp thị liên kết; khi đơn hoàn tất và sàn ghi nhận hoa hồng, một phần hoa hồng được hoàn về ví của bạn.",
  },
  {
    id: "tai-khoan",
    heading: "Tài khoản",
    body: "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động dưới tài khoản của mình. Mỗi người dùng chỉ nên sở hữu một tài khoản.",
  },
  {
    id: "hoan-tien-thanh-toan",
    heading: "Hoàn tiền & thanh toán",
    body: "Tiền hoàn chỉ được ghi nhận cho các đơn hợp lệ, có thật và được sàn xác nhận hoa hồng. Chi tiết tỷ lệ, mốc thời gian và rút tiền xem tại trang Chính sách hoạt động.",
  },
  {
    id: "hanh-vi-bi-cam",
    heading: "Hành vi bị cấm",
    body: "Nghiêm cấm tạo đơn ảo, tài khoản ảo, thao túng để trục lợi phần thưởng. Vi phạm có thể dẫn tới từ chối hoàn tiền và khoá tài khoản.",
  },
  {
    id: "thay-doi-dieu-khoan",
    heading: "Thay đổi điều khoản",
    body: "Win-Win Back có thể cập nhật điều khoản theo thời gian. Phiên bản mới có hiệu lực kể từ khi được đăng tải trên trang này.",
  },
];

function DashboardPolicyBody({ sections }: { sections: PublicPolicySection[] }) {
  return (
    <>
      {sections.map((section, index) => (
        <PolicySection key={section.id} heading={`${index + 1}. ${section.heading}`}>
          <p>{section.body}</p>
        </PolicySection>
      ))}
      <p className="text-xs text-[#8298b6]">
        Nội dung mang tính tham khảo và cần được rà soát pháp lý trước khi áp dụng chính thức.
      </p>
    </>
  );
}

/** Privacy policy body — shared by the public and in-dashboard pages. */
export function PrivacyBody() {
  return <DashboardPolicyBody sections={privacySections} />;
}

/** Terms of service body — shared by the public and in-dashboard pages. */
export function TermsBody() {
  return <DashboardPolicyBody sections={termsSections} />;
}
