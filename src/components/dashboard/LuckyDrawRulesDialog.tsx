"use client";

import { CircleHelp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type LuckyDrawRulesDialogProps = {
  fundRatePercent: number;
};

const steps = [
  {
    title: "Nhận phiếu",
    detail: "Mỗi đơn hàng hợp lệ hoàn tất qua Win-Win Back nhận một phiếu. Số phiếu lấy từ 4 chữ số cuối mã đơn.",
  },
  {
    title: "Chờ kỳ quay",
    detail: "Phiếu chưa quay được tính vào kỳ mở tiếp theo nếu được cấp trước giờ đóng kỳ.",
  },
  {
    title: "Xem kết quả",
    detail: "Sau khi kỳ đóng, admin công bố số trúng 4 chữ số. Kết quả và tiền thưởng được cập nhật trên trang này.",
  },
];

export function LuckyDrawRulesDialog({ fundRatePercent }: LuckyDrawRulesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-[#174369] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168b2b]">
        <CircleHelp className="size-3.5 text-[#168b2b]" aria-hidden="true" />
        Cách chơi & quy tắc
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cách chơi & quy tắc</DialogTitle>
          <DialogDescription className="mt-1">
            Nhận phiếu từ đơn hàng hợp lệ, theo dõi kỳ quay và xem tiền thưởng về ví.
          </DialogDescription>
        </DialogHeader>

        <ol className="mt-5 space-y-3">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e5f6dc] text-xs font-bold text-[#247833]">{index + 1}</span>
              <div>
                <h3 className="text-sm font-bold">{step.title}</h3>
                <p className="mt-0.5 text-sm leading-5 text-[#42617b]">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 border-t border-[#e1edf0] pt-4">
          <h3 className="text-sm font-bold">Cách tính giải thưởng</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-5 text-[#42617b]">
            <li>Quỹ gồm {fundRatePercent}% hoa hồng và ngân sách admin tài trợ tùy cấu hình kỳ quay.</li>
            <li>Trùng đủ 4 số: các phiếu trùng chia đều toàn bộ quỹ.</li>
            <li>Không trùng: phiếu có số gần nhất chia đều 20% quỹ; phần còn lại cộng dồn.</li>
            <li>Không có phiếu hợp lệ: toàn bộ quỹ cộng dồn sang kỳ sau.</li>
          </ul>
          <p className="mt-3 text-xs leading-5 text-[#58738a]">Tiền thưởng được ghi vào ví khi công bố kết quả. Đơn bị hủy hoặc hoàn trả trước lúc quay sẽ mất phiếu tương ứng. Quỹ hiển thị trước giờ quay là tạm tính.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
