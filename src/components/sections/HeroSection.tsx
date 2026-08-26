import Image from 'next/image';
import { CircleCheck, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="reference-hero relative isolate overflow-hidden ww-hero-bg pb-4 pt-[110px]">
      <div className="reference-hero-surface absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 76% 27%, rgba(163, 225, 78, 0.26), transparent 19%), radial-gradient(circle at 68% 71%, rgba(234, 191, 57, 0.12), transparent 22%)'
      }} />

      <div className="relative mx-auto max-w-screen-xl px-6 flex flex-col lg:flex-row items-start justify-between gap-8">
        {/* Left content */}
        <div className="flex-1 max-w-[628px] pt-4">
          <div
            className="ww-hero-enter"
            style={{ '--delay': '0ms' } as React.CSSProperties}
          >
            <span className="text-[9.28px] font-extrabold tracking-[1.392px] text-[#c5ed78]">
              TIKTOK SHOP · SHOPEE
            </span>
          </div>

          <h1
            className="ww-hero-enter mt-4 font-bold leading-[0.89] tracking-[-0.07em] text-white"
            style={{ fontSize: 'clamp(32px, 7vw, 60px)', '--delay': '80ms' } as React.CSSProperties}
          >
            Dán link sản phẩm,<br />
            <span className="ww-lime-text-gradient">nhận tiền hoàn về ví.</span>
          </h1>

          <p
            className="ww-hero-enter mt-5 text-base text-white/70 max-w-[490px] leading-6"
            style={{ '--delay': '180ms' } as React.CSSProperties}
          >
            Dán link sản phẩm vào Win-Win Back trước khi mua trên TikTok Shop hoặc Shopee. Tiền hoàn về ví khi đơn hoàn tất.
          </p>

          <div
            className="ww-hero-enter mt-8 flex flex-wrap items-center gap-5"
            style={{ '--delay': '280ms' } as React.CSSProperties}
          >
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CircleCheck className="h-4 w-4 text-[#b7e961] flex-shrink-0" />
              Không mất phí
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <ShieldCheck className="h-4 w-4 text-[#b7e961] flex-shrink-0" />
              Điều kiện công khai
            </div>
          </div>
        </div>

        {/* Right: Hero image */}
        <div
          className="ww-hero-enter-img relative block flex-shrink-0 w-full max-w-[420px] mx-auto lg:w-[480px] xl:w-[600px] lg:max-w-none lg:mx-0 lg:ml-auto mt-4 lg:mt-0 self-center"
          style={{ '--delay': '200ms' } as React.CSSProperties}
        >
          <Image
            src="/images/hero-mascot-v3.png"
            width={1000}
            height={1000}
            alt="Linh vật Win-Win Back cầm điện thoại với TikTok, Shopee"
            className="w-full h-auto drop-shadow-2xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
