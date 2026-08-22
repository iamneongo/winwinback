const communities = [
  {
    key: 'fb-group',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#1877F2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
      </svg>
    ),
    platform: 'Facebook Group',
    name: 'Nhóm Win-Win Back',
    desc: 'Chia sẻ deal hot, hỏi đáp về hoàn tiền cùng hàng nghìn thành viên.',
    cta: 'Tham gia nhóm',
    href: 'https://www.facebook.com/groups/vinhlongnhom/',
    bg: '#e7f0fd',
    ctaBg: '#1877F2',
  },
  {
    key: 'zalo',
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <rect width="48" height="48" rx="12" fill="#0068FF"/>
        <text x="7" y="34" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" fill="white" letterSpacing="-1">Zalo</text>
      </svg>
    ),
    platform: 'Zalo',
    name: 'Nhóm Zalo cộng đồng',
    desc: 'Nhận thông báo deal mới và hỗ trợ trực tiếp qua Zalo.',
    cta: 'Vào nhóm Zalo',
    href: 'https://zalo.me/g/slradppiin66t4sbfzwg',
    bg: '#e6f0ff',
    ctaBg: '#0068FF',
  },
  {
    key: 'fb-page',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#1877F2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z"/>
      </svg>
    ),
    platform: 'Facebook Page',
    name: 'Trang Win-Win Back',
    desc: 'Theo dõi cập nhật mới nhất về tính năng và khuyến mãi từ Win-Win Back.',
    cta: 'Theo dõi trang',
    href: 'https://www.facebook.com/winwinbackvn/',
    bg: '#e7f0fd',
    ctaBg: '#1877F2',
  },
];

export function CommunitySection() {
  return (
    <section className="bg-white py-16 sm:py-20 border-t border-gray-100">
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
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: c.bg,
                '--animate-delay': `${200 + i * 100}ms`,
              } as React.CSSProperties}
            >
              <div className="flex items-center gap-3">
                {c.icon}
                <span className="text-xs font-bold text-[#102e47]/50 tracking-wide uppercase">{c.platform}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#102e47] text-lg leading-tight mb-1.5">{c.name}</p>
                <p className="text-sm text-[#102e47]/60 leading-relaxed">{c.desc}</p>
              </div>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: c.ctaBg }}
              >
                {c.cta}
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
