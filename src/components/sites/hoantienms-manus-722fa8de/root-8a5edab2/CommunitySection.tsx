import { ArrowRight } from 'lucide-react';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
    </svg>
  );
}

function ZaloIcon() {
  return (
    <svg fill="#0068FF" viewBox="0 0 24 24" className="w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z"/>
    </svg>
  );
}

const communities = [
  {
    key: 'fb-group',
    icon: <FacebookIcon />,
    platform: 'Facebook Group',
    name: 'Nhóm Win-Win Back',
    desc: 'Chia sẻ deal hot, hỏi đáp về hoàn tiền cùng hàng nghìn thành viên.',
    cta: 'Tham gia nhóm',
    href: 'https://www.facebook.com/groups/vinhlongnhom/',
  },
  {
    key: 'zalo',
    icon: <ZaloIcon />,
    platform: 'Zalo',
    name: 'Nhóm Zalo cộng đồng',
    desc: 'Nhận thông báo deal mới và hỗ trợ trực tiếp qua Zalo.',
    cta: 'Vào nhóm Zalo',
    href: 'https://zalo.me/g/slradppiin66t4sbfzwg',
  },
  {
    key: 'fb-page',
    icon: <FacebookIcon />,
    platform: 'Facebook Page',
    name: 'Trang Win-Win Back',
    desc: 'Theo dõi cập nhật mới nhất về tính năng và khuyến mãi từ Win-Win Back.',
    cta: 'Theo dõi trang',
    href: 'https://www.facebook.com/winwinbackvn/',
  },
];

export function CommunitySection() {
  return (
    <section className="bg-[#fcfcf7] py-16 sm:py-20 border-t border-[#102e47]/6">
      <div className="mx-auto max-w-screen-xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            data-animate
            className="text-[10px] font-bold tracking-[0.15em] text-[#102e47]/50 uppercase mb-3"
          >
            CỘNG ĐỒNG
          </p>
          <h2
            data-animate
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#102e47] leading-tight tracking-tight mb-4"
            style={{ '--animate-delay': '80ms' } as React.CSSProperties}
          >
            Mua sắm cùng cộng đồng,<br className="hidden sm:block" />
            nhận deal tốt hơn mỗi ngày.
          </h2>
          <p
            data-animate
            className="text-base text-[#102e47]/60 max-w-md mx-auto leading-relaxed"
            style={{ '--animate-delay': '140ms' } as React.CSSProperties}
          >
            Tham gia nhóm để chia sẻ link sản phẩm tốt, hỏi đáp và nhận thông báo hoàn tiền sớm nhất.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {communities.map((c, i) => (
            <div
              key={c.key}
              data-animate
              className="bg-white rounded-2xl p-6 flex flex-col gap-5 shadow-sm border border-[#102e47]/6"
              style={{ '--animate-delay': `${200 + i * 100}ms` } as React.CSSProperties}
            >
              {/* Icon + platform label */}
              <div className="flex items-center gap-2.5">
                {c.icon}
                <span className="text-[10px] font-bold tracking-[0.12em] text-[#102e47]/50 uppercase">{c.platform}</span>
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="font-bold text-[#102e47] text-lg leading-tight mb-1.5">{c.name}</p>
                <p className="text-sm text-[#102e47]/60 leading-relaxed">{c.desc}</p>
              </div>

              {/* Lime glass CTA button */}
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#14334c] transition-all duration-200 hover:brightness-105"
                style={{
                  background: 'linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)',
                  boxShadow: '0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 4px 8px rgba(183,233,97,0.35), 0 1px 2px rgba(0,0,0,0.12)',
                }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }}
                  aria-hidden="true"
                />
                <span className="relative flex items-center gap-1.5">
                  {c.cta} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
