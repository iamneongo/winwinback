import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#092d4b]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_82%,rgba(115,220,60,0.24),transparent_36%)]" aria-hidden="true" />
      <div className="mx-auto grid max-w-screen-xl items-center gap-4 px-5 pb-0 pt-12 sm:px-7 lg:min-h-[330px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-0">
        <div className="relative z-10 pb-5">
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
            Bạn cứ mua sắm như bình thường.<br />
            <span className="text-[#b9ed56]">Win-Win Back</span> sẽ lo phần hoàn tiền.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
            Dán link Shopee hoặc TikTok Shop để kiểm tra hoàn tiền trước khi mua.
          </p>
          <Button
            variant="cta"
            nativeButton={false}
            className="mt-6 h-auto gap-2 rounded-full px-6 py-3.5"
            render={<a href="/register" />}
          >
            Nhận hoàn tiền ngay <ArrowRight className="size-4" />
          </Button>
        </div>
        <Image
          src="/images/landing-hero-mascot-v1.webp"
          width={1536}
          height={1024}
          alt="Linh vật Win-Win Back cùng những đồng tiền hoàn"
          className="mx-auto h-auto w-full max-w-[500px] self-end lg:translate-y-10"
          sizes="(max-width: 1023px) 85vw, 40vw"
        />
      </div>
    </section>
  );
}
