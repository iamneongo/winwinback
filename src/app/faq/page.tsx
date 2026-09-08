import { PolicyShell, PolicySection } from "@/components/policy/PolicyShell";

export const metadata = { title: "Câu hỏi thường gặp — Win-Win Back" };

const faqs = [
  {
    q: "Tôi có mất thêm phí khi sử dụng không?",
    a: "Không. Bạn thanh toán đúng giá trên sàn. Win-Win Back không thu thêm bất kỳ khoản nào.",
  },
  {
    q: "Bao lâu thì tiền hoàn được cộng vào ví?",
    a: "Sau khi đơn hoàn tất và qua giai đoạn đối soát của sàn, tiền hoàn được cộng vào ví. Mỗi sàn và loại sản phẩm có thời gian xác nhận khác nhau.",
  },
  {
    q: "Tôi vẫn dùng được voucher và mã giảm giá của sàn chứ?",
    a: "Được. Mã giảm giá, voucher và khuyến mãi của sàn dùng bình thường trước khi thanh toán.",
  },
  {
    q: "Làm sao để rút tiền hoàn?",
    a: "Vào mục Ví hoàn tiền, gửi yêu cầu rút về tài khoản ngân hàng của bạn (đạt mức rút tối thiểu). Quản trị viên duyệt và chuyển khoản.",
  },
  {
    q: "Mời bạn được thưởng như thế nào?",
    a: "Chia sẻ link giới thiệu trong mục Nhiệm vụ nhận quà. Khi bạn được mời đăng ký và xác minh email, bạn đạt các mốc thưởng và nhận tiền vào ví.",
  },
];

export default function FaqPage() {
  return (
    <PolicyShell
      title="Câu hỏi thường gặp"
      subtitle="Những thắc mắc phổ biến khi dùng Win-Win Back."
    >
      {faqs.map((f) => (
        <PolicySection key={f.q} heading={f.q}>
          <p>{f.a}</p>
        </PolicySection>
      ))}
    </PolicyShell>
  );
}
