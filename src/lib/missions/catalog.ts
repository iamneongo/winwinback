/** Fixed customer missions from the NHVU worksheet. Changes require a code
 * release; stable keys preserve existing claims and wallet history. */

export type MissionKind = "auto" | "manual" | "referral";
export type AutoCheck = "firstOrderT3" | "hasLink";

export type Mission = {
  key: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  kind: MissionKind;
  check?: AutoCheck;
  proofHint?: string;
  sortOrder: number;
  active: boolean;
};

export const DEFAULT_MISSIONS: Mission[] = [
  {
    key: "first_order",
    title: "Mua đơn hàng đầu tiên",
    description: "Nhận thưởng khi đơn đầu tiên hoàn tất, được đối soát và qua mốc T+3.",
    icon: "ShoppingBag",
    reward: 5_000,
    kind: "auto",
    check: "firstOrderT3",
    sortOrder: 10,
    active: true,
  },
  {
    key: "join_group",
    title: "Tham gia nhóm Facebook",
    description: "Tham gia nhóm cộng đồng và đăng một bài trong nhóm để nhận thưởng.",
    icon: "Users",
    reward: 5_000,
    kind: "manual",
    proofHint: "Gửi link bài đăng trong nhóm hoặc ảnh chụp bài đăng để quản trị viên duyệt.",
    sortOrder: 20,
    active: true,
  },
  {
    key: "video_1000",
    title: "Video trải nghiệm đạt 1.000 lượt xem",
    description: "Chia sẻ video trải nghiệm Win-Win Back và đạt ít nhất 1.000 lượt xem.",
    icon: "Video",
    reward: 10_000,
    kind: "manual",
    proofHint: "Gửi link video công khai và ảnh chụp số lượt xem.",
    sortOrder: 30,
    active: true,
  },
  {
    key: "video_5000",
    title: "Video đạt 5.000 lượt xem",
    description: "Thưởng thêm khi video trải nghiệm đạt ít nhất 5.000 lượt xem.",
    icon: "Video",
    reward: 10_000,
    kind: "manual",
    proofHint: "Gửi link video và ảnh chụp từ 5.000 lượt xem.",
    sortOrder: 40,
    active: true,
  },
  {
    key: "video_10000",
    title: "Video đạt 10.000 lượt xem",
    description: "Thưởng thêm khi video trải nghiệm đạt ít nhất 10.000 lượt xem.",
    icon: "Video",
    reward: 30_000,
    kind: "manual",
    proofHint: "Gửi link video và ảnh chụp từ 10.000 lượt xem.",
    sortOrder: 50,
    active: true,
  },
  {
    key: "video_50000",
    title: "Video đạt 50.000 lượt xem",
    description: "Thưởng thêm khi video trải nghiệm đạt ít nhất 50.000 lượt xem.",
    icon: "Video",
    reward: 50_000,
    kind: "manual",
    proofHint: "Gửi link video và ảnh chụp từ 50.000 lượt xem.",
    sortOrder: 60,
    active: true,
  },
  {
    key: "video_200000",
    title: "Video đạt 200.000 lượt xem",
    description: "Thưởng thêm khi video trải nghiệm đạt ít nhất 200.000 lượt xem.",
    icon: "Video",
    reward: 100_000,
    kind: "manual",
    proofHint: "Gửi link video và ảnh chụp từ 200.000 lượt xem.",
    sortOrder: 70,
    active: true,
  },
  {
    key: "invite_qualified",
    title: "Mời bạn (không giới hạn)",
    description: "Mỗi bạn được mời có đơn hợp lệ trong 60 ngày: bạn và người được mời đều nhận mức thưởng hiển thị.",
    icon: "UserPlus",
    reward: 20_000,
    kind: "referral",
    sortOrder: 80,
    active: true,
  },
];
