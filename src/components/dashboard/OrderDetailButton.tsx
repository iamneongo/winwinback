"use client";

import { Dialog } from "@base-ui/react/dialog";

export type OrderDetail = {
  platformLabel: string;
  externalOrderId: string;
  productName: string;
  orderAmount: string;
  commissionAmount: string;
  cashbackAmount: string;
  statusLabel: string;
  statusClass: string;
  orderedAt: string;
};

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2f8] py-2.5 last:border-0">
      <span className="text-xs font-medium text-[#6681a7]">{label}</span>
      <span className={`text-right text-sm font-semibold text-[#173861] ${valueClass ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

export function OrderDetailButton({ order }: { order: OrderDetail }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-lg border border-[#dce6f3] px-3 py-1.5 text-[11px] font-medium text-[#34527d] transition hover:bg-[#f6f9fd]">
        Xem chi tiết
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(9,54,95,0.28)] transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <Dialog.Title className="text-lg font-black tracking-tight text-[#0d315d]">
            Chi tiết đơn hàng
          </Dialog.Title>
          <div className="mt-4">
            <Row label="Sàn" value={order.platformLabel} />
            <Row label="Mã đơn hàng" value={order.externalOrderId} />
            <Row label="Sản phẩm" value={order.productName} />
            <Row label="Giá trị đơn" value={order.orderAmount} />
            <Row label="Hoa hồng" value={order.commissionAmount} />
            <Row
              label="Tiền hoàn"
              value={order.cashbackAmount}
              valueClass="text-[#168146]"
            />
            <Row
              label="Trạng thái"
              value={
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${order.statusClass}`}>
                  {order.statusLabel}
                </span>
              }
            />
            <Row label="Ngày mua" value={order.orderedAt} />
          </div>
          <Dialog.Close className="ww-btn-cta mt-5 h-11 w-full rounded-xl text-sm font-bold">
            Đóng
          </Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
