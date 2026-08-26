'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Tôi có mất thêm phí khi sử dụng không?',
    a: 'Không. Bạn thanh toán đúng giá trên sàn. Win-Win Back không thu thêm bất kỳ khoản nào.',
  },
  {
    q: 'Bao lâu thì tiền hoàn được cộng vào ví?',
    a: 'Mỗi sàn và loại sản phẩm có thời gian xác nhận khác nhau. Sau khi đơn hoàn tất và qua giai đoạn xác nhận của sàn, tiền hoàn vào ví bạn.',
  },
  {
    q: 'Tôi vẫn dùng được voucher và mã giảm giá của sàn chứ?',
    a: 'Được. Mã giảm giá, voucher và khuyến mãi của sàn dùng bình thường trước khi thanh toán.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/15 py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="font-semibold text-white text-base leading-snug">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-white/60 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="mt-3 text-sm text-white/60 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="giai-dap" className="reference-faq bg-[#082b4b] py-16 sm:py-20 text-white">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <h2
              data-animate
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-4"
            >
              3 câu hỏi thường gặp<br />trước khi bắt đầu.
            </h2>
            <p
              data-animate
              className="text-base text-white/60 mb-8 max-w-xs leading-relaxed"
              style={{ '--animate-delay': '100ms' } as React.CSSProperties}
            >
              Xem nhanh để yên tâm hơn khi nhận tiền hoàn lần đầu.
            </p>

          </div>

          {/* Right: accordion */}
          <div className="border-t border-white/15">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
