/**
 * Mission catalog — the fixed set of "nhiệm vụ nhận quà" offered to customers.
 *
 * Rewards are credited to the wallet in VND. Missions come in three kinds:
 *  - "auto":     the system can verify completion itself (e.g. created a link).
 *  - "referral": completion depends on how many friends the user invited.
 *  - "manual":   social actions we cannot verify automatically; the user
 *                submits a proof (link/screenshot) and an admin approves.
 *
 * To add or retune a mission, edit this file — no DB migration needed.
 */

export type MissionKind = "auto" | "referral" | "manual";

/** What an "auto" mission checks against the user's activity. */
export type AutoCheck = "hasLink" | "hasOrder";

export type Mission = {
  key: string;
  title: string;
  description: string;
  /** Lucide icon name resolved on the client. */
  icon: string;
  /** Reward credited to the wallet in VND on completion. */
  reward: number;
  kind: MissionKind;
  /** For kind "auto": which activity signal marks it complete. */
  check?: AutoCheck;
  /** For kind "referral": number of invited (verified) friends required. */
  target?: number;
  /** For kind "manual": hint shown in the proof dialog. */
  proofHint?: string;
};

export const MISSIONS: Mission[] = [
  {
    key: "first_link",
    title: "Tạo link hoàn tiền đầu tiên",
    description: "Dán link sản phẩm Shopee/TikTok và tạo link hoàn tiền đầu tiên của bạn.",
    icon: "Link2",
    reward: 5000,
    kind: "auto",
    check: "hasLink",
  },
  {
    key: "first_order",
    title: "Đơn hàng đầu tiên",
    description: "Có đơn hàng đầu tiên được ghi nhận qua link của bạn.",
    icon: "ShoppingBag",
    reward: 10000,
    kind: "auto",
    check: "hasOrder",
  },
  {
    key: "share_social",
    title: "Chia sẻ Win-Win Back lên mạng xã hội",
    description: "Đăng bài giới thiệu Win-Win Back lên Facebook/Zalo/TikTok và gửi link bài viết.",
    icon: "Share2",
    reward: 5000,
    kind: "manual",
    proofHint: "Dán link bài đăng công khai của bạn.",
  },
  {
    key: "join_group",
    title: "Tham gia & đăng bài trong nhóm",
    description: "Vào nhóm cộng đồng Win-Win Back và đăng một bài chia sẻ.",
    icon: "Users",
    reward: 5000,
    kind: "manual",
    proofHint: "Dán link bài đăng trong nhóm (để công khai).",
  },
  {
    key: "review_5star",
    title: "Đánh giá 5 sao",
    description: "Đánh giá 5 sao cho Win-Win Back và gửi ảnh chụp màn hình.",
    icon: "Star",
    reward: 10000,
    kind: "manual",
    proofHint: "Dán link/ảnh chụp màn hình đánh giá của bạn.",
  },
  {
    key: "invite_5",
    title: "Mời 5 người bạn",
    description: "Mời 5 bạn đăng ký Win-Win Back qua link giới thiệu của bạn.",
    icon: "UserPlus",
    reward: 20000,
    kind: "referral",
    target: 5,
  },
  {
    key: "invite_10",
    title: "Mời 10 người bạn",
    description: "Mời 10 bạn đăng ký Win-Win Back qua link giới thiệu của bạn.",
    icon: "UsersRound",
    reward: 50000,
    kind: "referral",
    target: 10,
  },
];

export const missionByKey: Record<string, Mission> = Object.fromEntries(
  MISSIONS.map((m) => [m.key, m]),
);
