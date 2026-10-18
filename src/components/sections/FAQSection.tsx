'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Tôi có mất thêm phí khi sử dụng không?',
    answer: 'Không. Bạn thanh toán trên sàn như bình thường và Win-Win Back không thu phí tham gia.',
  },
  {
    question: 'Bao lâu thì tiền hoàn được cộng vào ví?',
    answer: 'Thời gian xác nhận phụ thuộc vào từng sàn và từng đơn. Khi sàn xác nhận đơn đủ điều kiện, tiền hoàn được cộng vào ví Win-Win Back của bạn.',
  },
  {
    question: 'Tôi vẫn dùng được voucher và mã giảm giá chứ?',
    answer: 'Được. Bạn vẫn có thể dùng voucher, mã giảm giá và ưu đãi có sẵn của sàn khi thanh toán.',
  },
  {
    question: 'Những sản phẩm nào được tính hoàn tiền?',
    answer: 'Các đơn hàng mua qua link Win-Win Back trên Shopee và TikTok Shop có thể được ghi nhận khi đáp ứng điều kiện của sàn.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="giai-dap" className="bg-[#f3f9ef] py-12 sm:py-16">
      <div className="marketing-container grid items-center gap-6 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[225px_400px_minmax(0,1fr)] lg:gap-6">
        <Image
          data-animate
          src="/images/landing-faq-illustration-v2.webp"
          width={640}
          height={427}
          alt="Minh họa bong bóng trò chuyện và dấu hỏi"
          className="hidden h-auto w-full max-w-[245px] justify-self-center md:block"
          sizes="(max-width: 1023px) 190px, 245px"
        />
        <div className="md:col-start-2 lg:col-start-auto">
          <p className="landing-eyebrow mb-3 text-[#54718d]">Giải đáp thắc mắc</p>
          <h2 className="landing-section-title landing-section-title--compact text-[#0b3152]">
            Bạn có câu hỏi?<br /><span className="text-[#278d31]">Chúng tôi có câu trả lời.</span>
          </h2>
          <p className="landing-section-copy mt-3 max-w-[65ch] text-[#4b6988]">
            Tổng hợp những câu hỏi thường gặp giúp bạn hiểu rõ hơn về cách hoạt động của Win-Win Back.
          </p>
        </div>
        <div className="space-y-2.5 md:col-span-2 lg:col-span-1">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            const panelId = `landing-faq-answer-${index}`;
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl border border-[#e8efe4] bg-white shadow-[0_3px_10px_rgba(25,70,65,0.05)]">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left text-base font-bold text-[#0b3152] sm:px-5"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <div id={panelId} hidden={!open} className="landing-section-copy px-5 pb-4 text-[#4b6988]">
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
