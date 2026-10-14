import { Coins, Gift, ShieldCheck, Store } from 'lucide-react';
import { cashbackRate, prizeFundRate } from '@/lib/config';

const facts = [
  {
    icon: Store,
    value: '2 sàn',
    label: 'Shopee & TikTok Shop',
    detail: 'mua sắm qua link',
    tone: 'bg-[#ecf9db] text-[#2a9c2f]',
  },
  {
    icon: Coins,
    value: `${Math.round(cashbackRate * 100)}%`,
    label: 'hoa hồng affiliate',
    detail: 'hoàn về ví khách hàng',
    tone: 'bg-[#fff7d9] text-[#dfa600]',
  },
  {
    icon: ShieldCheck,
    value: '0 ₫',
    label: 'phí tham gia',
    detail: 'không thu thêm phí',
    tone: 'bg-[#e9f8e7] text-[#28a145]',
  },
  {
    icon: Gift,
    value: `${Math.round(prizeFundRate * 100)}%`,
    label: 'hoa hồng affiliate',
    detail: 'góp quỹ rút thăm',
    tone: 'bg-[#fff5d8] text-[#e6a900]',
  },
];

export function CommissionAllocationSection() {
  return (
    <section className="bg-[#f9fdf7] px-4 pb-8 pt-5 sm:px-6 sm:pb-10" aria-labelledby="commission-allocation-title">
      <h2 id="commission-allocation-title" className="sr-only">Quyền lợi và cách phân bổ hoa hồng</h2>
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 overflow-hidden rounded-2xl bg-white shadow-[0_6px_18px_rgba(20,67,58,0.08)] lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.value} className="flex min-w-0 items-center gap-3 border-b border-[#edf1eb] px-4 py-5 last:border-b-0 even:border-l even:border-[#edf1eb] lg:border-b-0 lg:border-l lg:first:border-l-0 sm:gap-4 sm:px-6">
            <span className={`grid size-10 shrink-0 place-items-center rounded-full sm:size-12 ${fact.tone}`}>
              <fact.icon className="size-5 sm:size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-black leading-none text-[#0b3152] sm:text-2xl">{fact.value}</p>
              <p className="mt-1 text-xs font-bold leading-4 text-[#24466b]">{fact.label}</p>
              <p className="text-[11px] leading-4 text-[#537093]">{fact.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-3 max-w-[1200px] text-center text-xs leading-5 text-[#466881]">
        Tỷ lệ 40% và 10% được tính trên hoa hồng affiliate thực tế sàn ghi nhận, không phải giá trị đơn hàng.
      </p>
    </section>
  );
}
