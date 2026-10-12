import { cashbackRate, prizeFundRate } from '@/lib/config';

const allocations = [
  {
    rate: cashbackRate,
    label: 'Hoàn về ví khách hàng',
    description: 'Được cộng vào ví khi đơn hàng đủ điều kiện hoàn tất.',
  },
  {
    rate: prizeFundRate,
    label: 'Góp quỹ rút thăm',
    description: 'Tích lũy vào quỹ để trao thưởng trong các kỳ quay.',
  },
];

export function CommissionAllocationSection() {
  return (
    <section className="border-b border-[#dce7f3] bg-[#f4f7fb] py-10 sm:py-12">
      <div className="mx-auto grid max-w-screen-xl items-center gap-7 px-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10">
        <div>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#102e47] sm:text-3xl">
            Hoa hồng được phân bổ minh bạch
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#34527d] sm:text-base">
            Các tỷ lệ được tính trên hoa hồng affiliate thực tế sàn ghi nhận, không phải giá trị đơn hàng.
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#d4e0ee] border-t border-[#d4e0ee] md:grid-cols-2 md:divide-x md:divide-y-0 md:border-t-0">
          {allocations.map((allocation) => (
            <article key={allocation.label} className="flex items-start gap-4 py-5 md:px-6 md:py-2 first:md:pl-0 last:md:pr-0">
              <p className="shrink-0 text-4xl font-black leading-none tracking-tight text-[#12335f] sm:text-5xl">
                {Math.round(allocation.rate * 100)}%
              </p>
              <div className="pt-0.5">
                <h3 className="text-sm font-bold leading-5 text-[#102e47] sm:text-base">
                  {allocation.label}
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#58749a] sm:text-sm">
                  {allocation.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
