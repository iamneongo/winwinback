'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from './NavBar';

export function MarketingNavBar() {
  const pathname = usePathname();
  const variant = pathname === '/'
    ? 'overlay'
    : pathname === '/bai-viet' || pathname.startsWith('/bai-viet/') || pathname === '/lien-he' || pathname === '/dieu-khoan' || pathname === '/chinh-sach-bao-mat'
      ? 'news-overlay'
      : 'solid';

  const active = pathname === '/'
    ? 'home'
    : pathname === '/bai-viet' || pathname.startsWith('/bai-viet/')
      ? 'news'
      : pathname === '/lien-he' ? 'contact' : null;

  return <NavBar variant={variant} active={active} />;
}
