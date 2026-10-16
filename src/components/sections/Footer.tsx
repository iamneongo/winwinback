import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const quickLinks = [
  { label: 'Cách hoạt động', href: '/#cach-hoat-dong' },
  { label: 'Đối tác', href: '/#doi-tac' },
  { label: 'Giải đáp', href: '/#giai-dap' },
  { label: 'Tin tức', href: '/bai-viet' },
  { label: 'Liên hệ', href: '/lien-he' },
];

const policyLinks = [
  { label: 'Điều khoản sử dụng', href: '/dieu-khoan' },
  { label: 'Chính sách bảo mật', href: '/chinh-sach-bao-mat' },
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
      <div className="marketing-container pb-5 pt-9 sm:pt-11">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_minmax(150px,0.9fr)] lg:gap-12">
          <div className="max-w-[330px]">
            <BrandLogo light />
            <p className="mt-3 max-w-[300px] text-sm leading-6 text-[#b5c8d8]">
              Nền tảng hỗ trợ hoàn tiền mua sắm an toàn, minh bạch và nhanh chóng.
            </p>
            <div className="mt-4 flex items-center gap-2.5">
              <a
                href="https://www.facebook.com/winwinbackvn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Trang Facebook Win-Win Back"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <FacebookMark />
              </a>
              <a
                href="https://zalo.me/g/slradppiin66t4sbfzwg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nhóm Zalo Win-Win Back"
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Liên kết nhanh">
            <h2 className="mb-3 text-sm font-bold text-white">Liên kết nhanh</h2>
            <ul className="space-y-2.5 text-sm text-[#b5c8d8]">
              {quickLinks.map((link) => (
                <li key={link.href}><Link href={link.href} className="transition-colors hover:text-[#c9f477]">{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-3 text-sm font-bold text-white">Đối tác</h2>
            <ul className="space-y-2.5 text-sm text-[#b5c8d8]">
              <li>Shopee</li>
              <li>TikTok Shop</li>
            </ul>
          </div>

          <nav aria-label="Hỗ trợ">
            <h2 className="mb-3 text-sm font-bold text-white">Hỗ trợ</h2>
            <ul className="space-y-2.5 text-sm text-[#b5c8d8]">
              {policyLinks.map((link) => (
                <li key={link.href}><Link href={link.href} className="transition-colors hover:text-[#c9f477]">{link.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 text-[11px] text-[#9fb6c9] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Win-Win Back. Tất cả quyền được bảo lưu.</p>
          <p className="flex min-w-0 items-center gap-2 text-[#c5d4e0]">
            <span className="shrink-0 text-base font-black text-[#b7e961]" aria-hidden="true">↗</span>
            <span className="leading-5">Mua sắm thông minh · Cộng đồng vững mạnh · Giá trị bền vững</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
