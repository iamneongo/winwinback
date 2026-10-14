import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Lấy link sản phẩm',
    description: 'Tìm sản phẩm trên Shopee hoặc TikTok Shop rồi sao chép link.',
    image: '/images/landing-step-link-v1.webp',
    imageAlt: 'Linh vật Win-Win Back giới thiệu link sản phẩm',
  },
  {
    number: '2',
    title: 'Mua sắm như bình thường',
    description: 'Dán link vào Win-Win Back và tiếp tục mua hàng trên sàn.',
    image: '/images/landing-step-shop-v1.webp',
    imageAlt: 'Linh vật Win-Win Back đẩy xe hàng',
  },
  {
    number: '3',
    title: 'Nhận hoàn tiền',
    description: 'Khi đơn được xác nhận đủ điều kiện, tiền hoàn sẽ về ví của bạn.',
    image: '/images/landing-step-wallet-v1.webp',
    imageAlt: 'Linh vật Win-Win Back bên ví hoàn tiền',
  },
];

export function HowItWorksSection() {
  return (
    <section id="cach-hoat-dong" className="bg-[#fbfdf9] py-16 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-5 sm:px-7">
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a6683]">Cách hoạt động</p>
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight text-[#0b3152] sm:text-4xl lg:text-5xl">
            Chỉ 3 bước đơn giản,<br />
            <span className="text-[#21a528]">hoàn tiền về ví của bạn</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[590px] text-sm leading-6 text-[#4b6988] sm:text-base">
            Mua sắm như bình thường, Win-Win Back ghi nhận đơn qua link của bạn và chuyển tiền hoàn khi sàn xác nhận.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1120px] gap-5 lg:grid-cols-3 lg:gap-7">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white px-5 pb-0 pt-5 shadow-[0_5px_14px_rgba(39,90,59,0.07)] sm:px-6">
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#b6ee58] to-[#2db826] text-base font-black text-[#0b3152]">{step.number}</span>
                  <div>
                    <h3 className="text-base font-bold leading-6 text-[#0b3152] sm:text-lg">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-5 text-[#54718d]">{step.description}</p>
                  </div>
                </div>
                <Image
                  src={step.image}
                  width={1536}
                  height={1024}
                  alt={step.imageAlt}
                  className="mx-auto mt-auto h-[220px] w-full object-contain object-bottom sm:h-[240px]"
                  sizes="(max-width: 1023px) 85vw, 28vw"
                />
              </article>
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute -right-6 top-1/2 z-10 hidden size-7 -translate-y-1/2 text-[#8dd855] lg:block" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a href="/dashboard#tao-link" className="inline-flex items-center gap-2 text-sm font-bold text-[#12653a] underline-offset-4 hover:underline">
            Thử ngay với link của bạn <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
