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
    question: 'Những sàn nào đang được hỗ trợ?',
    answer: 'Hiện Win-Win Back hỗ trợ link sản phẩm từ Shopee và TikTok Shop.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="giai-dap" className="bg-[#fcfefb] py-16 sm:py-20">
      <div className="mx-auto grid max-w-screen-xl items-center gap-8 px-5 sm:px-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16">
        <div className="relative">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a6683]">Câu hỏi thường gặp</p>
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight text-[#0b3152] sm:text-4xl">
            Bạn có thắc mắc?<br />Chúng tôi có câu trả lời!
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[#4b6988]">
            Một số câu hỏi phổ biến về cách hoạt động, hoàn tiền và các sàn được hỗ trợ.
          </p>
          <Image
            src="/images/landing-hero-mascot-v1.webp"
            width={1536}
            height={1024}
            alt="Linh vật Win-Win Back vui vẻ giải đáp thắc mắc"
            className="mt-3 hidden h-auto w-full max-w-[340px] lg:block"
            sizes="340px"
          />
        </div>
        <div className="space-y-2.5">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            const panelId = `landing-faq-answer-${index}`;
            return (
              <div key={faq.question} className="overflow-hidden rounded-xl bg-white shadow-[0_3px_10px_rgba(25,70,65,0.07)]">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-3 text-left text-sm font-bold text-[#0b3152] sm:text-base"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <div id={panelId} hidden={!open} className="px-5 pb-4 text-sm leading-6 text-[#4b6988]">
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
