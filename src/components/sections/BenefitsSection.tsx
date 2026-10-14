import { BadgeCheck, CreditCard, TicketPercent } from 'lucide-react';

const benefits = [
  {
    icon: BadgeCheck,
    title: 'Biết trước mức hoàn tiền',
    description: 'Xem tỷ lệ và điều kiện áp dụng trước khi quyết định mua.',
  },
  {
    icon: TicketPercent,
    title: 'Vẫn dùng ưu đãi của sàn',
    description: 'Áp mã giảm giá, voucher và flash sale như bình thường.',
  },
  {
    icon: CreditCard,
    title: 'Không cần thông tin thẻ',
    description: 'Bạn chỉ cần dán link. Việc thanh toán vẫn thực hiện trên sàn.',
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-[#f2fbf1] py-16 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-5 sm:px-7">
        <div className="mx-auto mb-9 max-w-[710px] text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.13em] text-[#4a6683]">Mua sắm an tâm</p>
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight text-[#0b3152] sm:text-4xl">
            Mua như bình thường,<br />nhận thêm lợi ích cùng <span className="text-[#20a527]">Win-Win Back</span>
          </h2>
        </div>
        <div className="mx-auto grid max-w-[1120px] gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-2xl bg-white p-6 shadow-[0_5px_14px_rgba(39,90,59,0.07)]">
              <span className="grid size-11 place-items-center rounded-full bg-[#edfae5] text-[#25a82c]">
                <benefit.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-[#0b3152]">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#4b6988]">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
