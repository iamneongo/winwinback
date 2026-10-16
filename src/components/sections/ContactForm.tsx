'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const supportEmail = 'support@winwinback.com';
const fieldClassName = 'mt-1.5 w-full min-h-11 rounded-xl border border-[#d7e3e9] bg-white px-3.5 py-2.5 text-sm text-[#12365a] outline-none transition-colors placeholder:text-[#607991] focus:border-[#48a842] focus:ring-2 focus:ring-[#a5e68c]/40';

export function ContactForm() {
  const [emailOpened, setEmailOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const name = String(values.get('name') ?? '').trim();
    const email = String(values.get('email') ?? '').trim();
    const topic = String(values.get('topic') ?? '').trim();
    const message = String(values.get('message') ?? '').trim();
    if (!name || !email || !topic || !message) return;

    const subject = `[Hỗ trợ Win-Win Back] ${topic}`;
    const body = `Họ và tên: ${name}\nEmail: ${email}\nChủ đề: ${topic}\n\nNội dung:\n${message}`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setEmailOpened(true);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="contact-name" className="text-sm font-semibold text-[#12365a]">Họ và tên <span className="text-[#b72a2a]">*</span></label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100} placeholder="Nhập họ và tên của bạn" className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="contact-email" className="text-sm font-semibold text-[#12365a]">Email <span className="text-[#b72a2a]">*</span></label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="Nhập địa chỉ email" className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="contact-topic" className="text-sm font-semibold text-[#12365a]">Chủ đề <span className="text-[#b72a2a]">*</span></label>
        <Select<string> name="topic" required>
          <SelectTrigger id="contact-topic" className={`${fieldClassName} h-11 text-left data-[placeholder]:text-[#607991]`}>
            <SelectValue placeholder="Chọn chủ đề liên hệ" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-[#d7e3e9] bg-white p-1.5 text-[#12365a] shadow-none ring-0">
            {['Hoàn tiền và đơn hàng', 'Tài khoản và đăng nhập', 'Đối tác và hợp tác', 'Vấn đề khác'].map((topic) => (
              <SelectItem key={topic} value={topic} className="min-h-11 rounded-lg px-3 py-2.5 font-medium data-highlighted:bg-[#edf8e9] data-highlighted:text-[#176b34] data-selected:bg-[#e5f5db]">
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold text-[#12365a]">Nội dung <span className="text-[#b72a2a]">*</span></label>
        <textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={4} placeholder="Mô tả vấn đề bạn cần hỗ trợ..." className={`${fieldClassName} resize-y`} />
      </div>
      <Button type="submit" variant="cta" className="h-auto min-h-12 w-full gap-2 rounded-xl px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#288c34]">
        Gửi yêu cầu hỗ trợ <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
      <p className="text-xs leading-5 text-[#526f8e]" role={emailOpened ? 'status' : undefined}>
        {emailOpened ? 'Ứng dụng email đã được mở với nội dung điền sẵn. Vui lòng bấm Gửi trong ứng dụng email để hoàn tất.' : 'Biểu mẫu sẽ mở ứng dụng email của bạn với nội dung được điền sẵn; chưa gửi tự động.'}
      </p>
    </form>
  );
}
