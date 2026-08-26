'use client';

import { ArrowRight } from 'lucide-react';

export function NavBar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="hero-nav absolute inset-x-0 top-0 z-30">
      {/* gradient overlay */}
      <div className="ww-nav-gradient absolute inset-0 pointer-events-none" />
      <div className="relative mx-auto max-w-screen-xl px-6 flex items-center justify-between h-[73px]">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2">
          <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
            <defs>
              <linearGradient id="winwin-arrow" x1="4" y1="42" x2="43" y2="5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9AD336"/>
                <stop offset="1" stopColor="#EABF39"/>
              </linearGradient>
            </defs>
            <path d="M6 36.5 17.5 23l7.4 6.7L37.8 11" fill="none" stroke="url(#winwin-arrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
            <path d="M29.2 11h8.6v8.6" fill="none" stroke="#EABF39" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
          </svg>
          <span className="font-bold text-white text-lg">Win-Win Back</span>
        </a>
        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Cách hoạt động', id: 'cach-hoat-dong' },
            { label: 'Đối tác', id: 'doi-tac' },
            { label: 'Giải đáp', id: 'giai-dap' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[11px] font-bold text-white/75 hover:text-white transition-colors tracking-wide"
            >
              {label}
            </button>
          ))}
        </nav>
        {/* Auth + CTA */}
        <div className="flex items-center gap-4">
        <a
          href="/login"
          className="hidden sm:inline text-[11px] font-bold text-white/75 hover:text-white transition-colors tracking-wide"
        >
          Đăng nhập
        </a>
        <a
          href="/dashboard"
          className="nav-cta hidden sm:flex relative items-center gap-1.5 rounded-full px-5 py-2.5 font-semibold text-sm text-[#14334c] transition-all duration-200 hover:scale-[1.03] hover:brightness-105"
          style={{
            background: 'linear-gradient(135deg, #d4f57a 0%, #b7e961 50%, #9fd94e 100%)',
            boxShadow: '0 1px 0 0 rgba(255,255,255,0.55) inset, 0 -2px 0 0 rgba(0,0,0,0.12) inset, 0 4px 12px rgba(183,233,97,0.45), 0 1px 3px rgba(0,0,0,0.15)',
          }}
        >
          {/* glass highlight */}
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)' }}
            aria-hidden="true"
          />
          <span className="relative flex items-center gap-1.5">
            Nhập link ngay <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </a>
        </div>
      </div>
    </header>
  );
}
