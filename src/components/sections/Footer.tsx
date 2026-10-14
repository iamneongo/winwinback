import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export function Footer() {
  return (
    <footer className="bg-white py-9">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-7 px-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[270px]">
          <BrandLogo />
          <p className="mt-2 text-xs leading-5 text-[#5a7693]">
            Nền tảng hỗ trợ hoàn tiền mua sắm an toàn, minh bạch và nhanh chóng.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#345779]" aria-label="Liên kết cuối trang">
          <Link href="/#cach-hoat-dong" className="hover:text-[#239a2b]">Cách hoạt động</Link>
          <Link href="/#doi-tac" className="hover:text-[#239a2b]">Đối tác</Link>
          <Link href="/#cong-dong" className="hover:text-[#239a2b]">Cộng đồng</Link>
          <Link href="/bai-viet" className="hover:text-[#239a2b]">Tin tức</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a href="https://www.facebook.com/groups/vinhlongnhom/" target="_blank" rel="noopener noreferrer" aria-label="Nhóm Facebook Win-Win Back" className="grid size-9 place-items-center rounded-full bg-[#eaf4ff] text-[#1877f2] hover:bg-[#daecff]">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.024 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796v8.437C19.612 23.097 24 18.1 24 12.073z" /></svg>
          </a>
          <a href="https://zalo.me/g/slradppiin66t4sbfzwg" target="_blank" rel="noopener noreferrer" aria-label="Nhóm Zalo Win-Win Back" className="grid size-9 place-items-center rounded-full bg-[#e8f5ff] text-[#0068ff] hover:bg-[#d8ecff]">
            <MessageCircle className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
