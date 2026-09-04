"use client";

import { useActionState, useState } from "react";
import {
  reviewOrderAction,
  verifyOrderAction,
  type ActionState,
} from "@/app/admin/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/SubmitButton";

const options = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "confirmed", label: "Duyệt" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Từ chối" },
];

const verifiedBadge: Record<string, { label: string; cls: string }> = {
  settled: { label: "Settled ✓", cls: "bg-[#e8f8eb] text-[#168146]" },
  pending: { label: "Chờ settle", cls: "bg-[#fff3dc] text-[#b7791f]" },
  cancelled: { label: "Huỷ/hoàn", cls: "bg-red-50 text-red-600" },
  not_found: { label: "Không tìm thấy", cls: "bg-red-50 text-red-600" },
};

const marketName: Record<string, string> = {
  tiktok: "TikTok",
  shopee: "Shopee",
};

/** Verify-with-marketplace control + verdict badge (TikTok/Shopee orders). */
function MarketVerify({
  orderId,
  platform,
  verifiedStatus,
}: {
  orderId: string;
  platform: string;
  verifiedStatus: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    verifyOrderAction,
    undefined,
  );
  const badge = verifiedStatus ? verifiedBadge[verifiedStatus] : undefined;
  const market = marketName[platform] ?? platform;
  return (
    <div className="space-y-2 rounded-lg border border-[#e2ebf6] bg-[#f9fbff] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#526b90]">
          Xác minh hoàn tiền
        </span>
        {badge ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
            {badge.label}
          </span>
        ) : (
          <span className="rounded-full bg-[#eef2f8] px-2 py-0.5 text-[10px] font-bold text-[#6b83a6]">
            Chưa kiểm tra
          </span>
        )}
      </div>
      <form action={action} className="flex items-center gap-3">
        <input type="hidden" name="orderId" value={orderId} />
        <SubmitButton variant="ghost">Kiểm tra với {market}</SubmitButton>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
        {state?.success && (
          <span className="text-xs font-medium text-[#2f7a1c]">{state.success}</span>
        )}
      </form>
      <p className="text-[10px] leading-4 text-[#8298b6]">
        Chỉ duyệt “Hoàn tất” được khi TikTok xác nhận <b>Settled</b> (creator đã
        có hoa hồng). Tránh chi tiền cho đơn không có thật/không hoa hồng.
      </p>
    </div>
  );
}

export function OrderReviewForm({
  orderId,
  status,
  adminNote,
  platform,
  verifiedStatus,
}: {
  orderId: string;
  status: string;
  adminNote: string | null;
  platform?: string;
  verifiedStatus?: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    reviewOrderAction,
    undefined,
  );
  const [value, setValue] = useState(status);

  return (
    <div className="space-y-3">
      {(platform === "tiktok" || platform === "shopee") && (
        <MarketVerify
          orderId={orderId}
          platform={platform}
          verifiedStatus={verifiedStatus ?? null}
        />
      )}
      <form action={action} className="space-y-3">
        <input type="hidden" name="orderId" value={orderId} />
      <label className="block text-xs font-semibold text-[#526b90]">
        Kết quả kiểm duyệt
        <div className="mt-1.5">
          <Select
            name="status"
            value={value}
            onValueChange={(v) => setValue(v ?? status)}
          >
            <SelectTrigger className="h-9 w-full text-xs text-[#3a557c]">
              <SelectValue placeholder="Chọn kết quả" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </label>

      <label className="block text-xs font-semibold text-[#526b90]">
        Ghi chú / phản hồi
        <Textarea
          name="adminNote"
          defaultValue={adminNote ?? ""}
          className="mt-1.5 h-20 text-xs"
          placeholder="Nhập ghi chú nội bộ hoặc phản hồi cho người dùng..."
        />
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton>Lưu kết quả</SubmitButton>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        {state?.success && (
          <p className="text-xs font-medium text-[#2f7a1c]">{state.success}</p>
        )}
        </div>
      </form>
    </div>
  );
}
