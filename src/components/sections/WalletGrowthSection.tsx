import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cashbackRate } from '@/lib/config';

const cashbackPercent = Math.round(cashbackRate * 100);

export function WalletGrowthSection() {
  return (
    <section className="relative isolate overflow-hidden bg-white" aria-labelledby="wallet-growth-title">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_23%_58%,#e9fbd6_0%,#fff_42%)]" aria-hidden="true" />
      <div className="marketing-container grid items-center gap-4 pt-12 lg:min-h-[320px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.16fr)_minmax(130px,0.45fr)] lg:gap-8 lg:pt-0">
        <div data-animate className="relative order-2 mx-auto h-[255px] w-full max-w-[360px] lg:order-1 lg:h-[320px] lg:max-w-none" aria-hidden="true">
          <Image
            src="/images/landing-wallet-growth-phone-v3.png"
            alt=""
            width={1121}
            height={1403}
            className="absolute left-1/2 top-[-12px] h-[340px] w-auto max-w-none -translate-x-1/2 object-contain lg:left-[-28px] lg:top-[-40px] lg:h-[430px] lg:translate-x-0"
            sizes="(max-width: 1023px) 272px, 345px"
          />
        </div>

        <div className="relative z-10 order-1 max-w-[570px] lg:order-2 lg:py-9">
          <p className="landing-eyebrow inline-flex rounded-full bg-[#ebf8de] px-3 py-1 text-[#287c36]">
            Hoàn tiền qua đơn hợp lệ
          </p>
          <h2 id="wallet-growth-title" className="landing-section-title mt-3 text-[#0b3152]">
            Mua càng nhiều,<br className="hidden sm:block" /> <span className="text-[#278d31]">hoàn càng cao.</span>
          </h2>
          <p className="landing-section-copy mt-3 max-w-[65ch] text-[#4b6988]">
            Với đơn đủ điều kiện, Win-Win Back chia sẻ {cashbackPercent}% hoa hồng affiliate do sàn ghi nhận. Khoản hoàn được cộng vào ví để bạn theo dõi và rút về ngân hàng.
          </p>
          <a
            href="/register"
            className="ww-btn-cta mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold transition-[filter,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287d31]"
          >
            Bắt đầu mua sắm ngay <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        <div className="relative order-3 hidden h-[220px] items-end justify-center pb-7 lg:flex" aria-hidden="true">
          <div className="absolute right-1 top-2 rotate-[-7deg] rounded-xl bg-[#e4f9c8] px-3 py-2 text-center text-xs font-extrabold leading-tight text-[#173b5d]">
            {cashbackPercent}% hoa hồng
          </div>
          <div className="flex h-[115px] items-end gap-2.5">
            {[32, 49, 69, 91, 112].map((height, index) => (
              <span
                key={height}
                className={`w-4 rounded-t-full ${index === 4 ? 'bg-[#58c932]' : 'bg-[#c7efad]'}`}
                style={{ height: `${height}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
