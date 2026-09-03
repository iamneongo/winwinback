'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, ArrowRight } from 'lucide-react';
import { TikTokIcon, ShopeeIcon } from './BrandIcons';
import { Button } from '@/components/ui/button';

type Platform = 'tiktok' | 'shopee';

interface PlatformConfig {
  key: Platform;
  label: string;
  icon: (active: boolean) => ReactNode;
  activeBg: string;
}

const platforms: PlatformConfig[] = [
  {
    key: 'tiktok',
    label: 'TikTok Shop',
    icon: (active) => <TikTokIcon className="w-5 h-5 flex-shrink-0" white={active} />,
    activeBg: '#05111e',
  },
  {
    key: 'shopee',
    label: 'Shopee',
    icon: (active) => <ShopeeIcon className="w-5 h-5 flex-shrink-0" white={active} />,
    activeBg: '#ee4d2d',
  },
];

export function ConsoleSection() {
  const router = useRouter();
  const [active, setActive] = useState<Platform>('tiktok');
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = inputValue.trim();
    // Hand off to the dashboard create-link flow (auth guard sends anonymous
    // visitors to /login first, then back here). The url is prefilled.
    router.push(
      url
        ? `/dashboard?url=${encodeURIComponent(url)}#tao-link`
        : '/dashboard#tao-link',
    );
  }

  return (
    <section id="nhap-link" className="reference-console relative bg-[#082b4b] pb-16 z-10">
      <div className="mx-auto max-w-screen-xl px-6">
        <div data-animate="scale" className="rounded-2xl border border-white/10 bg-[#082b4b]/95 backdrop-blur-sm overflow-hidden shadow-2xl">
          {/* White inner card */}
          <div className="bg-white rounded-xl m-3 p-5">
            {/* Platform tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {platforms.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActive(p.key)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active === p.key ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={active === p.key ? { background: p.activeBg } : undefined}
                >
                  {p.icon(active === p.key)}
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input row — button inside input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-[#b7e961] transition-colors">
              <Link2 className="h-4 w-4 text-[#6b8290] flex-shrink-0 ml-1" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Dán link sản phẩm..."
                className="flex-1 sm:hidden text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400 min-w-0 py-1.5"
              />
              <input
                id="product-link"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Dán link sản phẩm vào đây (TikTok Shop hoặc Shopee)"
                className="flex-1 hidden sm:block text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400 min-w-0 py-1.5"
              />
              <Button
                type="submit"
                variant="cta"
                className="h-auto flex-shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 sm:px-4"
              >
                <span className="hidden sm:inline">Kiểm tra hoàn tiền</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
