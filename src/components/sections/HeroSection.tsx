import Image from 'next/image';
import { BadgeCheck, ShieldCheck, ShoppingCart } from 'lucide-react';
import { HeroLinkForm } from './HeroLinkForm';
import { ShopeeIcon, TikTokIcon } from './BrandIcons';

export function HeroSection() {
  return (
    <section className="ww-landing-hero relative isolate overflow-hidden pb-10 pt-24 sm:pb-12 lg:min-h-[680px] lg:pb-16 lg:pt-28">
      <Image
        src="/images/landing-sky-v2.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 -z-10 object-cover object-bottom"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 bg-gradient-to-b from-transparent to-[#f3f9ef] sm:h-36 lg:h-40" aria-hidden="true" />
      <div className="marketing-container relative z-10 grid items-center gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:gap-2">
        <div className="relative z-10 min-w-0 max-w-[660px]">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#174369] ring-1 ring-white/70">
            <ShoppingCart className="size-3.5 text-[#27a732]" aria-hidden="true" /> Mua sắm thông minh
          </p>
          <h1 className="marketing-page-title text-[#0a3151]">
            Mua sắm Shopee & TikTok,
            <span className="mt-1 block text-[#168b2b]">nhận cashback<br className="hidden sm:block" /> về ví mỗi đơn!</span>
          </h1>
          <div id="doi-tac" className="mt-6 w-full min-w-0 max-w-[590px] scroll-mt-20">
            <HeroLinkForm />
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#194564]">
            <li className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-[#1da834]" /> Miễn phí tham gia</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="size-4 text-[#1da834]" /> Theo dõi hoàn tiền</li>
            <li className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-[#1da834]" /> An toàn & minh bạch</li>
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[670px] self-end lg:translate-x-5 lg:translate-y-8" aria-hidden="true">
          <Image
            src="/images/landing-hero-mascot-v3.webp"
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
