'use client';

import { useActionState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitContactMessage, type ContactActionState } from '@/app/lien-he/actions';
import { CONTACT_TOPICS } from '@/lib/contact';

const fieldClassName = 'mt-1.5 w-full min-h-11 rounded-xl border border-[#d7e3e9] bg-white px-3.5 py-2.5 text-sm text-[#12365a] outline-none transition-colors placeholder:text-[#607991] focus:border-[#48a842] focus:ring-2 focus:ring-[#a5e68c]/40';
const initialState: ContactActionState = { status: 'idle', message: '' };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactMessage, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
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
            {CONTACT_TOPICS.map((topic) => (
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
      <Button type="submit" variant="cta" disabled={pending} className="h-auto min-h-12 w-full gap-2 rounded-xl px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#288c34]">
        {pending ? 'Đang gửi…' : 'Gửi yêu cầu hỗ trợ'} {!pending && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
      <p className={`text-xs leading-5 ${state.status === 'error' ? 'text-[#aa3030]' : state.status === 'success' ? 'text-[#176b34]' : 'text-[#526f8e]'}`} role="status" aria-live="polite">
        {state.message || 'Yêu cầu sẽ được gửi trực tiếp tới đội ngũ hỗ trợ và hiển thị trong trang quản trị.'}
      </p>
    </form>
  );
}
