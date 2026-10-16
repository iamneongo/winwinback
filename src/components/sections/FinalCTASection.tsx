import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="relative z-10 bg-[#f3f9ef] pb-8 sm:pb-10">
      <div className="marketing-container relative overflow-visible">
        <div className="relative isolate min-h-[220px] overflow-hidden rounded-[24px] bg-[#082e4d] px-6 py-7 sm:px-9 lg:min-h-[218px] lg:px-12 lg:py-0">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_76%_75%,rgba(34,135,83,0.48),transparent_36%),radial-gradient(ellipse_at_25%_10%,rgba(18,97,151,0.46),transparent_42%),linear-gradient(105deg,#082d4c_0%,#062846_55%,#073553_100%)]" aria-hidden="true" />
          <div className="relative z-20 max-w-[640px] lg:pt-[30px]">
            <p className="landing-eyebrow mb-2 text-white/75">Bắt đầu nhận tiền hoàn</p>
            <h2 className="landing-section-title landing-section-title--compact max-w-[600px] text-white">
              Bạn cứ mua sắm như bình thường.<br className="hidden sm:block" />
              {' '}<span className="text-[#d4fb59]">Win-Win Back sẽ lo phần hoàn tiền.</span>
            </h2>
            <Button
              variant="cta"
              nativeButton={false}
              className="mt-4 h-auto gap-2 rounded-full px-5 py-3 text-sm"
              render={<a href="/register" />}
            >
              Nhận hoàn tiền ngay <ArrowRight className="size-4" />
            </Button>
          </div>
          <ArrowUpRight className="absolute -bottom-5 right-3 z-0 hidden size-32 text-[#a4e842]/70 sm:block" strokeWidth={4} aria-hidden="true" />
          <div className="absolute right-6 top-6 z-20 hidden max-w-[145px] rotate-2 items-center gap-1.5 rounded-2xl bg-[#fbffd9] px-3 py-2.5 text-[11px] font-extrabold leading-tight text-[#163653] shadow-[0_5px_12px_rgba(0,0,0,0.16)] sm:flex">
            <Crown className="size-4 shrink-0 text-[#f3be28]" aria-hidden="true" />
            <span>Mua sắm thông minh. Hoàn tiền thật!</span>
          </div>
          <Image
            src="/images/landing-final-cta-mascot-v1.png"
            width={1847}
            height={852}
            alt="Linh vật Win-Win Back vui mừng bên túi mua sắm, hộp quà và những đồng tiền hoàn"
            className="pointer-events-none absolute -bottom-8 right-[10%] z-10 hidden h-auto w-[460px] max-w-none object-contain sm:block lg:right-[12%] lg:w-[520px]"
            sizes="(max-width: 1023px) 460px, 520px"
          />
          <Image
            src="/images/landing-final-cta-mascot-v1.png"
            width={1847}
            height={852}
            alt=""
            aria-hidden="true"
            className="pointer-events-none mx-auto -mb-8 -mt-3 h-auto w-full max-w-[300px] object-contain sm:hidden"
            sizes="90vw"
          />
        </div>
      </div>
    </section>
  );
}
