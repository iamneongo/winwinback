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

/**
 * Hero paste-link form. Hands off to the dashboard create-link flow (the auth
 * guard sends anonymous visitors to /login first, then back with the url
 * prefilled). Platform tabs are visual affordances — the real platform is
 * detected from the pasted URL server-side.
 */
export function HeroLinkForm() {
  const router = useRouter();
  const [active, setActive] = useState<Platform>('tiktok');
  const [inputValue, setInputValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = inputValue.trim();
    router.push(
      url
        ? `/dashboard?url=${encodeURIComponent(url)}#tao-link`
        : '/dashboard#tao-link',
    );
  }

  return (
    <div className="rounded-2xl bg-white p-3 shadow-[0_18px_40px_rgba(6,26,48,0.35)]">
      {/* Platform tabs */}
      <div className="mb-3 flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p.key}
            type="button"
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
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors focus-within:border-[#b7e961]"
      >
        <Link2 className="ml-1 h-4 w-4 flex-shrink-0 text-[#6b8290]" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Dán link sản phẩm..."
          className="min-w-0 flex-1 truncate bg-transparent py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
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
  );
}
