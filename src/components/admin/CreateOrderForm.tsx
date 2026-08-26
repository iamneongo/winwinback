"use client";

import { useActionState, useEffect, useRef } from "react";
import { createOrderAction, type ActionState } from "@/app/admin/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-[#b7e961]/60";

export function CreateOrderForm() {
  const [state, action] = useActionState<ActionState, FormData>(
    createOrderAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="userEmail"
          type="email"
          required
          placeholder="Email khách hàng"
          className={inputClass}
        />
        <input
          name="externalOrderId"
          type="text"
          required
          placeholder="Mã đơn (external order id)"
          className={inputClass}
        />
        <input
          name="productName"
          type="text"
          required
          placeholder="Tên sản phẩm"
          className={inputClass}
        />
        <select name="platform" required className={inputClass} defaultValue="shopee">
          <option value="shopee">Shopee</option>
          <option value="tiktok">TikTok Shop</option>
        </select>
        <input
          name="orderAmount"
          type="number"
          min={0}
          required
          placeholder="Giá trị đơn (VND)"
          className={inputClass}
        />
        <input
          name="commissionAmount"
          type="number"
          min={0}
          required
          placeholder="Hoa hồng nhận từ sàn (VND)"
          className={inputClass}
        />
        <input
          name="cashbackAmount"
          type="number"
          min={0}
          placeholder="Hoàn tiền cho khách (bỏ trống = tự tính)"
          className={inputClass}
        />
        <select name="status" required className={inputClass} defaultValue="pending">
          <option value="pending">Chờ duyệt</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="completed">Hoàn tất (cộng ví)</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <SubmitButton>Thêm đơn</SubmitButton>
        {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-[#b7e961]">{state.success}</p>
        )}
      </div>
    </form>
  );
}
