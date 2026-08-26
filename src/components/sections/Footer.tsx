export function Footer() {
  return (
    <footer className="bg-[#082b4b] py-10">
      <div className="mx-auto max-w-screen-xl px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Left: logo + desc */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
                <defs>
                  <linearGradient id="winwin-arrow-footer" x1="4" y1="42" x2="43" y2="5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9AD336"/>
                    <stop offset="1" stopColor="#EABF39"/>
                  </linearGradient>
                </defs>
                <path d="M6 36.5 17.5 23l7.4 6.7L37.8 11" fill="none" stroke="url(#winwin-arrow-footer)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
                <path d="M29.2 11h8.6v8.6" fill="none" stroke="#EABF39" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
              </svg>
              <span className="font-bold text-white text-lg">Win-Win Back</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Nền tảng hỗ trợ hành trình mua sắm có hoàn tiền, minh bạch và nhanh chóng.
            </p>
          </div>
          {/* Right: nav */}
          <nav className="flex items-center gap-6">
            {[
              { label: 'Cách hoạt động', href: '#cach-hoat-dong' },
              { label: 'Đối tác', href: '#doi-tac' },
              { label: 'Giải đáp', href: '#giai-dap' },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="text-sm text-white/60 hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
