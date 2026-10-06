'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';

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
          <BrandLogo light />
        </a>
        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Điều hướng chính">
          {[
            { label: 'Cách hoạt động', id: 'cach-hoat-dong' },
            { label: 'Đối tác', id: 'doi-tac' },
            { label: 'Giải đáp', id: 'giai-dap' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              {label}
            </button>
          ))}
          <Link
            href="/bai-viet"
            className="text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            Tin tức
          </Link>
        </nav>
        {/* Auth + CTA */}
        <div className="flex items-center gap-4">
        <Button
          variant="cta"
          nativeButton={false}
          className="hidden h-auto gap-1.5 rounded-full px-5 py-2.5 hover:scale-[1.03] sm:inline-flex"
          render={<a href="/login" />}
        >
          Đăng nhập <ArrowRight className="h-3.5 w-3.5" />
        </Button>
        </div>
      </div>
    </header>
  );
}
