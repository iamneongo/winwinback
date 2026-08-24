import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Dán link sản phẩm',
    desc: 'Sao chép link bất kỳ sản phẩm nào trên TikTok Shop hoặc Shopee, rồi dán vào ô kiểm tra.',
  },
  {
    num: '02',
    title: 'Mua trên sàn như bình thường',
    desc: 'Thanh toán trên sàn như thường. Mã giảm giá và flash sale vẫn dùng được.',
  },
  {
    num: '03',
    title: 'Nhận tiền về ví',
    desc: 'Win-Win Back ghi nhận đơn hàng và chuyển tiền hoàn về ví khi đơn hoàn tất.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="cach-hoat-dong" className="relative overflow-hidden bg-[#e9f5ef] py-16 sm:py-24">
      <div className="relative mx-auto max-w-screen-xl px-6">

        {/* Row 1: Heading (left) + Image (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">
          <div>
            <p
              data-animate
              className="text-[10px] font-bold tracking-[0.15em] text-[#102e47]/50 uppercase mb-4"
            >
              3 BƯỚC ĐƠN GIẢN ĐỂ NHẬN TIỀN HOÀN
            </p>
            <h2
              data-animate
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102e47] leading-tight tracking-tight mb-4"
              style={{ '--animate-delay': '80ms' } as React.CSSProperties}
            >
              Mua sắm như bình thường,<br />
              <span className="text-[#2d6a4f]">nhận thêm tiền hoàn.</span>
            </h2>
            <p
              data-animate
              className="text-base text-[#102e47]/70 leading-relaxed max-w-sm"
              style={{ '--animate-delay': '140ms' } as React.CSSProperties}
            >
              Chỉ cần dán link sản phẩm, tiếp tục mua hàng trên sàn như mọi khi. Win-Win Back sẽ ghi nhận đơn và hoàn tiền về ví khi đơn hàng đủ điều kiện.
            </p>
          </div>

          <div
            data-animate="fade-right"
            className="flex items-center justify-center"
          >
            <Image
              src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/how-it-works-phone.png"
              width={1000}
              height={1000}
              alt="Điện thoại 3D minh họa quy trình hoàn tiền"
              className="w-full max-w-[400px] h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Row 2: Steps (horizontal) + CTA right */}
        <div
          data-animate
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8"
          style={{ '--animate-delay': '100ms' } as React.CSSProperties}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              data-animate
              className="reference-flow-item bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-[#102e47]/6"
              style={{ '--animate-delay': `${180 + i * 100}ms` } as React.CSSProperties}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base text-[#102e47]"
                style={{ background: 'linear-gradient(135deg, #d4f57a 0%, #b7e961 100%)' }}
              >
                {step.num}
              </div>
              <div>
                <p className="font-bold text-lg text-[#102e47] leading-tight">{step.title}</p>
                <p className="text-sm text-[#102e47]/60 leading-relaxed mt-1.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA — right-aligned */}
        <div
          data-animate
          className="mt-8 flex justify-end"
          style={{ '--animate-delay': '480ms' } as React.CSSProperties}
        >
          <a
            href="#nhap-link"
            className="inline-flex items-center gap-1.5 text-[#102e47] font-semibold text-sm hover:underline"
          >
            Thử ngay với link của bạn <ArrowRight className="h-4 w-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
