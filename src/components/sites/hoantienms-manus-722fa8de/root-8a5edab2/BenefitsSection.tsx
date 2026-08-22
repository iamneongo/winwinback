import Image from 'next/image';
import { Check } from 'lucide-react';

const benefits = [
  {
    title: 'Biết trước mức hoàn tiền',
    desc: 'Tỷ lệ hoàn tiền và điều kiện áp dụng được hiển thị rõ trước khi bạn mua.',
  },
  {
    title: 'Vẫn dùng ưu đãi của sàn',
    desc: 'Mã giảm giá, voucher và flash sale vẫn sử dụng như bình thường.',
  },
  {
    title: 'Không cần nhập thông tin thanh toán',
    desc: 'Bạn chỉ cần dán link sản phẩm. Win-Win Back không yêu cầu thông tin thẻ hay tài khoản ngân hàng khi mua hàng.',
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-[#fcfcf7] py-16 sm:py-24">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image with overlay */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <Image
                src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/route-illustration.jpg"
                width={960}
                height={640}
                alt="Đường dẫn lên biểu trưng cho hành trình hoàn tiền"
                className="w-full object-cover"
              />
            </div>
          </div>

          {/* Right: text + list */}
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-[#102e47]/50 uppercase mb-4">
              RÕ RÀNG NGAY TỪ ĐẦU
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102e47] leading-tight tracking-tight mb-8">
              Mua như bình thường,<br />
              <span className="ww-lime-text-gradient">nhận thêm tiền hoàn.</span>
            </h2>
            <ul className="space-y-6">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4f57a 0%, #b7e961 100%)' }}>
                    <Check className="h-3 w-3 text-[#14334c]" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="font-semibold text-[#102e47]">{b.title}</p>
                    <p className="text-sm text-[#102e47]/60 mt-1 leading-relaxed">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
