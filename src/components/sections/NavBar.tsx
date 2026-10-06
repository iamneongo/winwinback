'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';

export function NavBar({ variant = 'overlay' }: { variant?: 'overlay' | 'news-overlay' | 'solid' }) {
  const onLanding = variant === 'overlay';
  const isOverlay = variant !== 'solid';
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={isOverlay ? 'hero-nav absolute inset-x-0 top-0 z-30' : 'relative z-30 bg-[#0d315d]'}>
      {/* gradient overlay */}
      {isOverlay ? <div className="ww-nav-gradient absolute inset-0 pointer-events-none" /> : null}
      <div className="relative mx-auto max-w-screen-xl px-6 flex items-center justify-between h-[73px]">
        {/* Logo */}
        <Link href={onLanding ? '#top' : '/'} className="flex items-center gap-2">
          <BrandLogo light />
        </Link>
        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Điều hướng chính">
          {[
            { label: 'Cách hoạt động', id: 'cach-hoat-dong' },
            { label: 'Đối tác', id: 'doi-tac' },
            { label: 'Giải đáp', id: 'giai-dap' },
          ].map(({ label, id }) => (
            onLanding ? (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-semibold text-white/80 transition-colors hover:text-white">{label}</button>
            ) : (
              <Link key={id} href={`/#${id}`} className="text-sm font-semibold text-white/80 transition-colors hover:text-white">{label}</Link>
            )
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
