import Image from 'next/image';

const cards = [
  {
    key: 'tiktok',
    name: 'TikTok Shop',
    tagline: 'Hoàn tiền mỗi đơn deal bạn săn được',
    logo: '/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/logo-tiktok.png',
    logoW: 48,
    logoH: 48,
    bg: '#f4f4f4',
  },
  {
    key: 'shopee',
    name: 'Shopee',
    tagline: 'Dùng mã giảm, vẫn nhận hoàn tiền',
    logo: '/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/logo-shopee.png',
    logoW: 48,
    logoH: 48,
    bg: '#fff3f0',
  },
];

export function PartnersSection() {
  return (
    <section id="doi-tac" className="bg-[#fcfcf7] py-14 sm:py-20">
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
          <div className="flex-1">
            <p
              data-animate
              className="text-[10px] font-bold tracking-[0.15em] text-[#102e47]/50 uppercase mb-3"
            >
              2 SÀN ĐƯỢC HỖ TRỢ
            </p>
            <h2
              data-animate
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102e47] leading-tight tracking-tight"
              style={{ '--animate-delay': '80ms' } as React.CSSProperties}
            >
              Mua sắm trên 2 sàn,<br />
              hoàn tiền theo cùng một cách.
            </h2>
          </div>
          <div
            data-animate
            className="max-w-sm lg:pt-10 flex-shrink-0"
            style={{ '--animate-delay': '160ms' } as React.CSSProperties}
          >
            <p className="text-base text-[#102e47]/70 leading-relaxed">
              Mua trên TikTok Shop hoặc Shopee như bình thường. Đi qua Win-Win Back trước khi thanh toán, tiền hoàn về ví sau khi đơn xong.
            </p>
          </div>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <div
              key={card.key}
              data-animate
              className="reference-store-card rounded-2xl p-6 flex flex-col gap-5"
              style={{
                background: card.bg,
                '--animate-delay': `${200 + i * 100}ms`,
              } as React.CSSProperties}
            >
              <div className="h-12 flex items-center">
                <Image
                  src={card.logo}
                  width={card.logoW}
                  height={card.logoH}
                  alt={card.name}
                  className="object-contain"
                  style={{ width: card.logoW, height: card.logoH }}
                />
              </div>
              <div>
                <p className="font-bold text-[#102e47] text-lg leading-tight">{card.name}</p>
                <p className="text-sm text-[#102e47]/50 mt-1">{card.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
