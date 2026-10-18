import Image from 'next/image';
import { Headset, Mail, MessageCircle, MessagesSquare } from 'lucide-react';
import { ContactForm } from '@/components/sections/ContactForm';
import { MarketingLayout } from '@/components/sections/MarketingLayout';

export const metadata = {
  title: 'Liên hệ hỗ trợ — Win-Win Back',
  description: 'Liên hệ đội ngũ Win-Win Back qua email, Zalo hoặc Facebook để được hỗ trợ về tài khoản, đơn hàng và hoàn tiền.',
};

const email = 'support@winwinback.com';
const zalo = 'https://zalo.me/g/slradppiin66t4sbfzwg';
const facebook = 'https://www.facebook.com/winwinbackvn/';

export default function ContactPage() {
  return (
    <MarketingLayout className="flex min-h-screen flex-col">
      <main className="flex-1 bg-[#f5faf3] text-[#12365a]">
        <section className="contact-hero relative isolate overflow-hidden" aria-labelledby="contact-title">
          <Image src="/images/landing-sky-v2.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-bottom" aria-hidden="true" />
          <div className="contact-hero-wash pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <div className="marketing-container relative grid min-h-[570px] items-start pt-28 sm:min-h-[460px] sm:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] sm:items-center sm:pb-12 sm:pt-20">
            <div className="relative z-10 max-w-[570px]">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#257339] ring-1 ring-white/70">
                <Headset className="size-3.5" aria-hidden="true" /> Chúng tôi luôn sẵn sàng hỗ trợ
              </p>
              <h1 id="contact-title" className="marketing-page-title mt-2.5 text-[#0b3153]">Liên hệ <span className="text-[#21923b]">hỗ trợ</span></h1>
              <p className="mt-2 max-w-[47ch] text-pretty text-[15px] leading-6 text-[#315674] sm:text-base sm:leading-7">Đội ngũ Win-Win Back luôn sẵn sàng lắng nghe, giải đáp thắc mắc và hỗ trợ bạn trong quá trình sử dụng dịch vụ.</p>
            </div>
            <div className="pointer-events-none absolute bottom-3 right-0 z-0 w-[78%] max-w-[350px] sm:bottom-0 sm:right-[1%] sm:w-[44%] sm:max-w-[460px] lg:right-[5%] lg:max-w-[480px]" aria-hidden="true">
              <Image src="/images/contact-support-mascot-v4.webp" alt="" width={1100} height={917} sizes="(max-width: 639px) 78vw, (max-width: 1023px) 44vw, 480px" className="h-auto w-full drop-shadow-[0_12px_12px_rgba(27,93,55,0.13)]" />
            </div>
          </div>
        </section>

        <section className="marketing-container relative z-10 grid gap-5 pb-16 pt-7 md:grid-cols-2 md:gap-6 md:pt-9" aria-label="Kênh liên hệ và biểu mẫu">
          <div className="py-6 sm:py-8 md:pr-8">
            <p className="inline-flex rounded-full bg-[#e3f4d9] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#28783d]">Kênh hỗ trợ</p>
            <h2 className="mt-3 text-balance text-2xl font-black tracking-[-0.025em] text-[#0b3153] sm:text-3xl">Thông tin liên hệ</h2>
            <p className="mt-2 text-sm leading-6 text-[#526f8e]">Bạn có thể liên hệ qua các kênh chính thức bên dưới. Hãy chọn cách thuận tiện nhất cho mình.</p>
            <div className="mt-6 divide-y divide-[#dbe9df] border-y border-[#dbe9df]">
              <a href={`mailto:${email}`} className="flex items-start gap-4 py-5 no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278a34]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf8e9] text-[#158c2a]"><Mail className="size-6" aria-hidden="true" /></span>
                <span><strong className="block text-sm text-[#12365a]">Email hỗ trợ</strong><span className="mt-1 block font-bold text-[#168b2b]">{email}</span><span className="mt-1 block text-sm text-[#526f8e]">Phù hợp với yêu cầu cần cung cấp thông tin chi tiết.</span></span>
              </a>
              <a href={zalo} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 py-5 no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278a34]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e7f2ff] text-[#1687ec]"><MessageCircle className="size-6" aria-hidden="true" /></span>
                <span><strong className="block text-sm text-[#12365a]">Zalo cộng đồng</strong><span className="mt-1 block font-bold text-[#168b2b]">Tham gia nhóm Zalo</span><span className="mt-1 block text-sm text-[#526f8e]">Trao đổi về mua sắm và hoàn tiền cùng cộng đồng.</span></span>
              </a>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 py-5 no-underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#278a34]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf2ff] text-[#2276e7]"><MessagesSquare className="size-6" aria-hidden="true" /></span>
                <span><strong className="block text-sm text-[#12365a]">Facebook Page</strong><span className="mt-1 block font-bold text-[#168b2b]">Nhắn tin cho Win-Win Back</span><span className="mt-1 block text-sm text-[#526f8e]">Theo dõi cập nhật và gửi tin nhắn trực tiếp.</span></span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-[0_6px_20px_rgba(18,54,90,0.06)] sm:p-8">
            <p className="inline-flex rounded-full bg-[#e3f4d9] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#28783d]">Gửi yêu cầu hỗ trợ</p>
            <h2 className="mt-3 text-balance text-2xl font-black tracking-[-0.025em] text-[#0b3153] sm:text-3xl">Biểu mẫu liên hệ</h2>
            <p className="mt-2 text-sm leading-6 text-[#526f8e]">Điền thông tin bên dưới để gửi yêu cầu trực tiếp tới đội ngũ hỗ trợ.</p>
            <ContactForm />
          </div>
        </section>

      </main>
    </MarketingLayout>
  );
}
