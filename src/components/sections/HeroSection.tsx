import Image from 'next/image';
import { BadgeCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { HeroLinkForm } from './HeroLinkForm';
import { ShopeeIcon, TikTokIcon } from './BrandIcons';

export function HeroSection() {
  return (
    <section className="ww-landing-hero relative isolate overflow-hidden pb-12 pt-28 sm:pb-16 lg:min-h-[690px] lg:pb-28 lg:pt-32">
      <div className="ww-landing-sky absolute inset-0 -z-10" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-screen-xl items-center gap-7 px-5 sm:px-7 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-2">
        <div className="relative z-10 max-w-[660px]">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#174369] ring-1 ring-white/70">
            <Sparkles className="size-3.5 text-[#27a732]" /> Mua sắm thông minh · Hoàn tiền thật
          </p>
          <h1 className="text-balance text-[clamp(2.35rem,4.9vw,4.5rem)] font-black leading-[1.06] tracking-[-0.035em] text-[#0a3151]">
            Mua sắm Shopee,<br />TikTok Shop,
            <span className="mt-1 block text-[#20a527]">nhận cashback<br className="hidden sm:block" /> về ví mỗi đơn!</span>
          </h1>
          <p className="mt-5 max-w-[550px] text-sm leading-6 text-[#365e7d] sm:text-base sm:leading-7">
            Mua sắm như bình thường trên Shopee hoặc TikTok Shop qua link của Win-Win Back. Khi đơn đủ điều kiện, tiền hoàn được cộng vào ví của bạn.
          </p>
          <div id="doi-tac" className="mt-6 max-w-[640px] scroll-mt-20">
            <HeroLinkForm />
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#194564] sm:text-sm">
            <li className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-[#1da834]" /> Miễn phí tham gia</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-[#1da834]" /> Theo dõi hoàn tiền</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#1da834]" /> An toàn & minh bạch</li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[670px] self-end lg:translate-x-5 lg:translate-y-8" aria-hidden="true">
          <Image
            src="/images/landing-hero-mascot-v1.webp"
            width={1536}
            height={1024}
            alt=""
            className="h-auto w-full drop-shadow-[0_24px_18px_rgba(27,93,55,0.17)]"
            sizes="(max-width: 1023px) 100vw, 52vw"
            priority
          />
          <span className="absolute left-[7%] top-[23%] grid size-12 place-items-center rounded-2xl bg-[#ff663a] shadow-lg sm:size-16">
            <ShopeeIcon className="size-8 sm:size-10" white />
          </span>
          <span className="absolute right-[7%] top-[28%] grid size-12 place-items-center rounded-2xl bg-[#07182d] shadow-lg sm:size-16">
            <TikTokIcon className="size-8 sm:size-10" white />
          </span>
        </div>
      </div>
    </section>
  );
}
