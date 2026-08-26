export const orderStatusLabel: Record<string, string> = {
  pending: "Chờ duyệt",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};

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
};

export const platformLabel: Record<string, string> = {
  shopee: "Shopee",
  tiktok: "TikTok Shop",
};
