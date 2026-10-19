import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const footerLinks = [
  { label: 'Cách hoạt động', href: '/#cach-hoat-dong' },
  { label: 'Giải đáp', href: '/#giai-dap' },
  { label: 'Liên hệ', href: '/lien-he' },
  { label: 'Điều khoản', href: '/dieu-khoan' },
  { label: 'Bảo mật', href: '/chinh-sach-bao-mat' },
];

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#062b49] text-white">
      <div className="marketing-container py-6 sm:py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="shrink-0">
            <BrandLogo light />
            <p className="mt-1.5 text-sm text-[#c5d6e3]">Mua sắm thông minh, nhận hoàn tiền dễ dàng.</p>
          </div>

          <nav aria-label="Liên kết footer" className="hidden lg:block">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#d2e0ea] lg:justify-end">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="rounded-sm transition-colors hover:text-[#c9f477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9f477]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-4 text-xs text-[#aec5d6]">
          <p>© {new Date().getFullYear()} Win-Win Back</p>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/winwinbackvn/" target="_blank" rel="noopener noreferrer" aria-label="Trang Facebook Win-Win Back" className="rounded-sm transition-colors hover:text-[#c9f477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9f477]">
              <FacebookMark />
            </a>
            <a href="https://zalo.me/g/slradppiin66t4sbfzwg" target="_blank" rel="noopener noreferrer" aria-label="Nhóm Zalo Win-Win Back" className="rounded-sm transition-colors hover:text-[#c9f477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9f477]">
              <MessageCircle className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
