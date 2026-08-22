import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="reference-final-cta relative overflow-hidden py-20 sm:py-28">
      <Image
        src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/cta-bg-v2.png"
        alt=""
        fill
        quality={100}
        className="object-cover object-center"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-screen-xl px-6">
        <div className="flex flex-col items-start gap-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#2d6a4f] uppercase mb-5">
              BẮT ĐẦU NHẬN TIỀN HOÀN
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#082b4b] leading-tight tracking-tight">
              Bạn cứ mua sắm như bình thường.<br />
              <span className="ww-lime-text-gradient">Win-Win Back</span> sẽ lo phần hoàn tiền.
            </h2>
          </div>
          <a
            href="#nhap-link"
            className="relative inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-full text-[#14334c] whitespace-nowrap transition-all duration-200 hover:scale-[1.03] hover:brightness-105"
            style={{
              background: 'linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)',
              boxShadow: '0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 4px 12px rgba(183,233,97,0.45), 0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }}
              aria-hidden="true"
            />
            <span className="relative flex items-center gap-2">
              Nhập link sản phẩm <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
