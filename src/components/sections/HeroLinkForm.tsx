'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link2, ArrowRight, LoaderCircle, ClipboardPaste } from 'lucide-react';
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
    key: 'shopee',
    label: 'Shopee',
    icon: (active) => <ShopeeIcon className="w-5 h-5 flex-shrink-0" white={active} />,
    activeBg: '#ee4d2d',
  },
  {
    key: 'tiktok',
    label: 'TikTok Shop',
    icon: () => <TikTokIcon className="w-5 h-5 flex-shrink-0" />,
    activeBg: '#05111e',
  },
];

/**
 * Hero paste-link form. Hands off to the dashboard create-link flow (the auth
 * guard sends anonymous visitors to /login first, then back with the url
 * prefilled). Platform tabs are visual affordances — the real platform is
 * detected from the pasted URL server-side.
 */
export function HeroLinkForm() {
  const [active, setActive] = useState<Platform>('shopee');
  const [inputValue, setInputValue] = useState('');
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePaste() {
    try {
      const pasted = await navigator.clipboard.readText();
      if (!pasted.trim()) {
        setError('Clipboard đang trống. Hãy sao chép link sản phẩm trước nhé.');
        return;
      }
      setInputValue(pasted.trim());
      setNavigating(false);
      setError(null);
    } catch {
      setError('Không thể đọc clipboard. Hãy dán link vào ô nhập.');
    }
  }

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
    <div className="bg-transparent p-0 shadow-none">
      {/* Platform tabs */}
      <div className="mb-3 flex flex-wrap gap-2">
        {platforms.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActive(p.key)}
            aria-pressed={active === p.key}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              active === p.key || p.key === 'tiktok' ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={active === p.key || p.key === 'tiktok' ? { background: p.activeBg } : undefined}
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
        className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-2xl border border-[#e0e9ee] bg-[#fbfdff] px-3 py-2 transition-colors focus-within:border-[#9bdc55]"
      >
        <Link2 className="ml-1 h-4 w-4 flex-shrink-0 text-[#6b8290]" />
        <input
          name="url"
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setNavigating(false); setError(null); }}
          placeholder="Dán link sản phẩm TikTok Shop hoặc Shopee..."
          className="min-w-0 flex-1 truncate bg-transparent py-1.5 text-base text-gray-700 outline-none placeholder:text-gray-500"
        />
        {inputValue.trim() ? (
          <Button
            type="submit"
            variant="cta"
            disabled={navigating}
            className="h-auto min-h-11 flex-shrink-0 gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 sm:px-4"
          >
            <span className="hidden sm:inline">{navigating ? 'Đang chuyển…' : 'Kiểm tra hoàn tiền'}</span>
            {navigating ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        ) : (
          <Button
            type="button"
            variant="cta"
            onClick={handlePaste}
            className="h-auto min-h-11 flex-shrink-0 gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 sm:px-4"
          >
            <ClipboardPaste className="h-4 w-4" />
            <span>Dán nhanh</span>
          </Button>
        )}
      </form>
      {error ? <p role="alert" className="mt-2 px-1 text-sm font-medium text-red-700">{error}</p> : null}
      <p aria-live="polite" className="sr-only">{navigating ? 'Đang mở trang kiểm tra link' : ''}</p>
    </div>
  );
}
