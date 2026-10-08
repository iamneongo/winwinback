import { PolicyShell, PolicySection } from "@/components/policy/PolicyShell";
import { cashbackRate, minWithdrawal, formatVnd } from "@/lib/config";
import { listMissions } from "@/lib/missions/definitions";

export const metadata = { title: "Chính sách hoạt động — Win-Win Back" };
// Render at runtime so CASHBACK_RATE / MIN_WITHDRAWAL reflect production env
// (Docker build stage has no env → static prerender would bake the defaults).
export const dynamic = "force-dynamic";

export default async function ActivityPolicyPage() {
  const ratePct = Math.round(cashbackRate * 100);
  const missions = await listMissions();
  const firstOrder = missions.find((mission) => mission.key === "first_order");
  const invite = missions.find((mission) => mission.kind === "referral");

  return (
    <PolicyShell
      title="Chính sách hoạt động"
      subtitle="Cách Win-Win Back tính tiền hoàn, mốc thời gian, rút tiền và phần thưởng giới thiệu."
    >
      <PolicySection heading="Tỷ lệ hoàn tiền">
        <p>
          Bạn mua sắm như bình thường trên TikTok Shop / Shopee qua link của
          Win-Win Back. Khi đơn hoàn tất và sàn ghi nhận hoa hồng, chúng tôi hoàn{" "}
          <b>{ratePct}%</b> phần hoa hồng đó về ví của bạn. Bạn không mất thêm bất
          kỳ khoản phí nào — vẫn thanh toán đúng giá trên sàn và dùng được
          voucher/mã giảm giá của sàn.
        </p>
      </PolicySection>

      <PolicySection heading="Mốc thời gian ghi nhận (T+)">
        <p>
          Tiền hoàn đi qua các trạng thái: <b>Chờ duyệt</b> → <b>Đã xác nhận</b> →{" "}
          <b>Hoàn tất</b>. Tiền chỉ được cộng vào ví khi đơn <b>Hoàn tất</b> và
          sàn đã đối soát hoa hồng cho đơn đó (thường sau khi hết thời gian
          đổi/trả hàng của sàn). Mỗi sàn và loại sản phẩm có thời gian đối soát
          khác nhau, nên mốc T+ có thể chênh lệch giữa các đơn.
        </p>
      </PolicySection>

      <PolicySection heading="Rút tiền">
        <p>
          Số dư khả dụng trong ví có thể rút về tài khoản ngân hàng của bạn. Số
          tiền rút tối thiểu mỗi lần là <b>{formatVnd(minWithdrawal)}</b>. Sau khi
          gửi yêu cầu, khoản tiền được giữ lại và chờ quản trị viên duyệt &amp;
          chuyển khoản; nếu bị từ chối, tiền được hoàn lại vào ví.
        </p>
      </PolicySection>

      <PolicySection heading="Giới thiệu bạn bè (referral) & nhiệm vụ">
        {invite ? <p>
          Chia sẻ link giới thiệu của bạn trong mục <b>Nhiệm vụ nhận quà</b>.
          Nếu người được mời phát sinh đơn hợp lệ trong 60 ngày sau khi tham gia,
          phần thưởng được cộng vào ví của cả hai người:
        </p> : <p>Chương trình mời bạn nhận thưởng hiện chưa mở. Các nhiệm vụ đang hoạt động được hiển thị trong mục <b>Nhiệm vụ nhận quà</b>.</p>}
        <ul className="ml-5 list-disc space-y-1">
          {invite && <li>Mỗi bạn đủ điều kiện: <b>+{formatVnd(invite.reward)}</b> cho mỗi bên, không giới hạn số bạn.</li>}
          {firstOrder && <li>Đơn đầu tiên hoàn tất và qua T+3: <b>+{formatVnd(firstOrder.reward)}</b>.</li>}
        </ul>
        <p className="text-xs text-[#8298b6]">
          Các nhiệm vụ cần bằng chứng (như bài đăng nhóm và video) chỉ được cộng
          thưởng sau khi quản trị viên kiểm tra và duyệt.
        </p>
      </PolicySection>

      <PolicySection heading="Chống gian lận">
        <p>
          Win-Win Back chỉ chi hoàn tiền cho các đơn có thật và đã phát sinh hoa
          hồng được sàn xác nhận. Các hành vi tạo đơn ảo, tài khoản ảo để trục lợi
          phần thưởng có thể bị từ chối duyệt và khoá tài khoản.
        </p>
      </PolicySection>
    </PolicyShell>
  );
}
