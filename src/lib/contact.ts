export const CONTACT_TOPICS = [
  "Hoàn tiền và đơn hàng",
  "Tài khoản và đăng nhập",
  "Đối tác và hợp tác",
  "Vấn đề khác",
] as const;

export type ContactMessageStatus = "new" | "read" | "resolved";

export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  new: "Mới",
  read: "Đã xem",
  resolved: "Đã xử lý",
};
