import Image from 'next/image';
import { ArrowRight, CircleCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="reference-hero relative isolate overflow-hidden ww-hero-bg pb-16 pt-[110px]">
      <div className="reference-hero-surface absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 76% 27%, rgba(163, 225, 78, 0.26), transparent 19%), radial-gradient(circle at 68% 71%, rgba(234, 191, 57, 0.12), transparent 22%)'
      }} />

      <div className="relative mx-auto max-w-screen-xl px-6 flex flex-col lg:flex-row items-start justify-between gap-8">
        {/* Left content */}
        <div className="flex-1 max-w-[628px] pt-4">
          <h1
            className="ww-hero-enter font-bold leading-[1.0] tracking-[-0.05em] text-white"
            style={{ fontSize: 'clamp(30px, 5.6vw, 54px)', '--delay': '80ms' } as React.CSSProperties}
          >
            Hoàn tiền mua sắm Shopee, TikTok Shop,<br />
            <span className="ww-lime-text-gradient">cashback về ví mỗi đơn.</span>
          </h1>

          <p
            className="ww-hero-enter mt-5 text-base text-white/70 max-w-[520px] leading-6"
            style={{ '--delay': '180ms' } as React.CSSProperties}
          >
            Mua sắm như bình thường trên TikTok Shop hoặc Shopee qua Win-Win Back để nhận cashback. Tiền hoàn về ví khi đơn hoàn tất, kèm voucher và mã giảm giá mỗi ngày.
          </p>

          <div
            className="ww-hero-enter mt-8 flex flex-wrap items-center gap-4"
            style={{ '--delay': '260ms' } as React.CSSProperties}
          >
            <Button
              variant="cta"
              nativeButton={false}
              className="h-auto gap-2 whitespace-nowrap rounded-full px-6 py-3.5 text-[15px] hover:scale-[1.03]"
              render={<a href="/register" />}
            >
              Nhận hoàn tiền ngay <ArrowRight className="h-4 w-4" />
            </Button>
            <a
              href="#cach-hoat-dong"
              className="text-sm font-semibold text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Xem cách hoạt động
            </a>
          </div>

          <div
            className="ww-hero-enter mt-7 flex flex-wrap items-center gap-5"
            style={{ '--delay': '340ms' } as React.CSSProperties}
          >
            <div className="flex items-center gap-2 text-sm text-white/80">
              <CircleCheck className="h-4 w-4 flex-shrink-0 text-[#b7e961]" />
              Không mất phí
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#b7e961]" />
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
