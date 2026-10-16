'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import styles from './NavBar.module.css';

type ActiveNavLink = 'home' | 'news' | 'contact' | null;

export function NavBar({ variant = 'overlay', active = null }: { variant?: 'overlay' | 'news-overlay' | 'solid'; active?: ActiveNavLink }) {
  const onLanding = variant === 'overlay';
  const onNews = variant === 'news-overlay';
  const isOverlay = variant !== 'solid';
  const navLinkClass = (active: boolean) => `${styles.navLink} inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold no-underline hover:backdrop-blur-md focus-visible:backdrop-blur-md ${isOverlay ? 'text-[#133451] hover:text-[#133451]' : 'text-white/80 hover:text-white'} ${active ? `${styles.active} backdrop-blur-md` : ''}`;

  return (
    <header className={isOverlay ? `hero-nav absolute inset-x-0 top-0 z-30 ${onNews ? 'news-nav' : ''}` : 'relative z-30 bg-[#0d315d]'}>
      <div className="marketing-container relative flex h-[73px] items-center justify-between gap-2">
        {/* Logo */}
        <Link href={onLanding ? '#top' : '/'} className="flex items-center gap-2">
          <BrandLogo light={!isOverlay} />
        </Link>
        {/* Nav links */}
        <nav className="hidden items-center gap-3 lg:flex" aria-label="Điều hướng chính">
          <Link href="/" aria-current={active === 'home' ? 'page' : undefined} className={navLinkClass(active === 'home')}>Trang chủ</Link>
          <Link href="/bai-viet" aria-current={active === 'news' ? 'page' : undefined} className={navLinkClass(active === 'news')}>Tin tức</Link>
          <Link href="/lien-he" aria-current={active === 'contact' ? 'page' : undefined} className={navLinkClass(active === 'contact')}>Liên hệ</Link>
        </nav>
        {/* Auth + CTA */}
        <div className="flex items-center gap-4">
        <Button
          variant="cta"
          nativeButton={false}
          className="h-auto min-h-11 gap-1.5 rounded-full px-3 py-2 text-xs hover:scale-[1.03] sm:px-5 sm:py-2.5 sm:text-sm"
          render={<a href="/login" />}
        >
          Đăng nhập <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
        </Button>
        </div>
      </div>
    </header>
  );
}
