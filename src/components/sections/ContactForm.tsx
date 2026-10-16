'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';

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
        <select id="contact-topic" name="topic" required defaultValue="" className={fieldClassName}>
          <option value="" disabled>Chọn chủ đề liên hệ</option>
          <option value="Hoàn tiền và đơn hàng">Hoàn tiền và đơn hàng</option>
          <option value="Tài khoản và đăng nhập">Tài khoản và đăng nhập</option>
          <option value="Đối tác và hợp tác">Đối tác và hợp tác</option>
          <option value="Vấn đề khác">Vấn đề khác</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-semibold text-[#12365a]">Nội dung <span className="text-[#b72a2a]">*</span></label>
        <textarea id="contact-message" name="message" required minLength={10} maxLength={4000} rows={4} placeholder="Mô tả vấn đề bạn cần hỗ trợ..." className={`${fieldClassName} resize-y`} />
      </div>
      <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b7ed62] px-5 text-sm font-bold text-[#0b3153] transition-colors hover:bg-[#a4e544] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#288c34]">
        Gửi yêu cầu hỗ trợ <ArrowRight className="size-4" aria-hidden="true" />
      </button>
      <p className="text-xs leading-5 text-[#526f8e]" role={emailOpened ? 'status' : undefined}>
        {emailOpened ? 'Ứng dụng email đã được mở với nội dung điền sẵn. Vui lòng bấm Gửi trong ứng dụng email để hoàn tất.' : 'Biểu mẫu sẽ mở ứng dụng email của bạn với nội dung được điền sẵn; chưa gửi tự động.'}
      </p>
    </form>
  );
}
