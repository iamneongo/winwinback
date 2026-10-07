'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link2, ArrowRight, LoaderCircle } from 'lucide-react';
import { TikTokIcon, ShopeeIcon } from './BrandIcons';
import { Button } from '@/components/ui/button';
import { detectPlatform } from '@/lib/affiliate/platform';

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
  const [active, setActive] = useState<Platform>('tiktok');
  const [inputValue, setInputValue] = useState('');
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resetAfterBack = () => setNavigating(false);
    window.addEventListener('pageshow', resetAfterBack);
    return () => window.removeEventListener('pageshow', resetAfterBack);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    const url = inputValue.trim();
    if (!url) {
      e.preventDefault();
      setError('Vui lòng dán link sản phẩm trước khi kiểm tra.');
      return;
    }
    if (!detectPlatform(url)) {
      e.preventDefault();
      setError('Chỉ hỗ trợ link Shopee hoặc TikTok Shop hợp lệ.');
      return;
    }
    setError(null);
    setNavigating(true);
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
        action="/start"
        method="GET"
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors focus-within:border-[#b7e961]"
      >
        <Link2 className="ml-1 h-4 w-4 flex-shrink-0 text-[#6b8290]" />
        <input
          name="url"
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setNavigating(false); setError(null); }}
          placeholder="Dán link sản phẩm..."
          className="min-w-0 flex-1 truncate bg-transparent py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
        <Button
          type="submit"
          variant="cta"
          disabled={navigating}
          className="h-auto flex-shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 py-2.5 sm:px-4"
        >
          <span className="hidden sm:inline">{navigating ? 'Đang chuyển…' : 'Kiểm tra hoàn tiền'}</span>
          {navigating ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
      {error ? <p role="alert" className="mt-2 px-1 text-sm font-medium text-red-700">{error}</p> : null}
      <p aria-live="polite" className="sr-only">{navigating ? 'Đang mở trang kiểm tra link' : ''}</p>
    </div>
  );
}
