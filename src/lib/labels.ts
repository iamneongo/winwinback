export const orderStatusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};

/** Localized label for raw order states returned by TikTok's creator API. */
export function tiktokAffiliateStatusLabel(raw?: string | null): string {
  if (!raw || raw === "—") return "Chưa có";
  const status = raw.trim().toUpperCase();
  if (status === "PENDING" || /(AWAIT|REVIEW)/.test(status)) return "Chờ duyệt";
  if (/(UNPAID|TO_PAY|PAYMENT)/.test(status)) return "Chờ thanh toán";
  if (/(SETTLE|COMPLETE|FINISH|PAID|SUCCESS)/.test(status)) return "Hoàn tất";
  if (/(CANCEL|REFUND|RETURN|INVALID|CLOSED)/.test(status)) return "Đã hủy";
  if (/(DELIVER|SHIP|COLLECT|CONFIRM|PROCESS)/.test(status)) return "Đã xác nhận";
  if (/(CREATE|WAIT)/.test(status)) return "Đang chờ xử lý";
  return "Trạng thái khác";
}

export const orderStatusClass: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-200",
  confirmed: "bg-sky-400/15 text-sky-200",
  completed: "bg-[#b7e961]/20 text-[#b7e961]",
  cancelled: "bg-red-400/15 text-red-200",
};

export const withdrawalStatusLabel: Record<string, string> = {
  pending: "Chờ xử lý",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  paid: "Đã chi",
};

export const withdrawalStatusClass: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-200",
  approved: "bg-sky-400/15 text-sky-200",
  rejected: "bg-red-400/15 text-red-200",
  paid: "bg-[#b7e961]/20 text-[#b7e961]",
};

export const txTypeLabel: Record<string, string> = {
  cashback: "Hoàn tiền",
  withdrawal: "Rút tiền",
  refund: "Hoàn lại",
  adjustment: "Điều chỉnh",
  reward: "Thưởng nhiệm vụ",
  prize: "Trúng thưởng rút thăm",
};

export const platformLabel: Record<string, string> = {
  shopee: "Shopee",
  tiktok: "TikTok Shop",
};
