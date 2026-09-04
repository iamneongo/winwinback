import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="reference-final-cta relative overflow-hidden py-20 sm:py-28">
      <Image
        src="/images/cta-bg-v2.png"
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
          <Button
            variant="cta"
            nativeButton={false}
            className="h-auto gap-2 whitespace-nowrap rounded-full px-6 py-3.5 hover:scale-[1.03]"
            render={<a href="/dashboard#tao-link" />}
          >
            Nhập link sản phẩm <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
