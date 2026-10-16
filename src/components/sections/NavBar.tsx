'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import styles from './NavBar.module.css';

type ActiveNavLink = 'home' | 'news' | 'contact' | null;

export function NavBar({ variant = 'overlay', active = null }: { variant?: 'overlay' | 'news-overlay' | 'solid'; active?: ActiveNavLink }) {
  const mobileMenuRef = useRef<HTMLDialogElement>(null);
  const onLanding = variant === 'overlay';
  const onNews = variant === 'news-overlay';
  const isOverlay = variant !== 'solid';
  const navLinkClass = (active: boolean) => `${styles.navLink} inline-flex h-9 items-center rounded-full px-4 py-0 text-sm font-semibold no-underline hover:backdrop-blur-md focus-visible:backdrop-blur-md ${isOverlay ? 'text-[#133451] hover:text-[#133451]' : 'text-white/80 hover:text-white'} ${active ? `${styles.active} backdrop-blur-md` : ''}`;
  const mobileLinkClass = (item: Exclude<ActiveNavLink, null>) => `${styles.mobileLink} flex min-h-12 items-center justify-between rounded-xl px-4 text-base font-bold text-[#12365a] ${active === item ? styles.mobileLinkActive : ''}`;
  const closeMobileMenu = () => mobileMenuRef.current?.close();

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
        <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="cta"
          nativeButton={false}
          className="h-auto min-h-11 gap-1.5 rounded-full px-3 py-2 text-xs hover:scale-[1.03] max-[359px]:hidden sm:px-5 sm:py-2.5 sm:text-sm"
          render={<a href="/login" />}
        >
          Đăng nhập <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
        </Button>
        <button
          type="button"
          aria-label="Mở menu điều hướng"
          aria-haspopup="dialog"
          onClick={() => mobileMenuRef.current?.showModal()}
          className={`grid size-10 shrink-0 place-items-center rounded-full lg:hidden ${isOverlay ? 'bg-white/65 text-[#12365a] ring-1 ring-white/80' : 'bg-white/10 text-white ring-1 ring-white/20'}`}
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        </div>
      </div>
      <dialog
        ref={mobileMenuRef}
        aria-label="Menu điều hướng"
        className={styles.mobileMenu}
        onClick={(event) => {
          if (event.clientX < event.currentTarget.getBoundingClientRect().left) closeMobileMenu();
        }}
      >
        <div className="flex min-h-full flex-col px-5 pb-8 pt-5">
          <div className="flex items-center justify-between gap-3 border-b border-[#dcebdc] pb-5">
            <Link href="/" onClick={closeMobileMenu} aria-label="Win-Win Back - Trang chủ"><BrandLogo /></Link>
            <button type="button" onClick={closeMobileMenu} aria-label="Đóng menu" className="grid size-11 place-items-center rounded-full bg-white text-[#12365a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278a34]"><X className="size-5" aria-hidden="true" /></button>
          </div>
          <nav className="mt-7 space-y-2" aria-label="Điều hướng mobile">
            <Link href="/" onClick={closeMobileMenu} aria-current={active === 'home' ? 'page' : undefined} className={mobileLinkClass('home')}>Trang chủ <ChevronRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/bai-viet" onClick={closeMobileMenu} aria-current={active === 'news' ? 'page' : undefined} className={mobileLinkClass('news')}>Tin tức <ChevronRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/lien-he" onClick={closeMobileMenu} aria-current={active === 'contact' ? 'page' : undefined} className={mobileLinkClass('contact')}>Liên hệ <ChevronRight className="size-4" aria-hidden="true" /></Link>
          </nav>
          <Link href="/login" onClick={closeMobileMenu} className="mt-auto flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#b7ed62] px-4 text-sm font-bold text-[#0b3153] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#278a34]">Đăng nhập <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
      </dialog>
    </header>
  );
}
