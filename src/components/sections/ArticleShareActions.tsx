"use client";

import { useState } from "react";
import { Link2, MessageCircle } from "lucide-react";

const shareTargets = [
  { label: "Chia sẻ lên Facebook", name: "f", className: "bg-[#2072e8]", url: (page: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(page)}` },
];

export function ArticleShareActions() {
  const [copied, setCopied] = useState(false);

  const openShare = (makeUrl: (page: string) => string) => {
    window.open(makeUrl(window.location.href), "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const shareFromDevice = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: window.location.href });
        return;
      } catch {
        // A dismissed native share sheet needs no fallback action.
        return;
      }
    }
    await copyLink();
  };

  return (
    <div>
      <p className="text-sm font-bold text-[#12365a]">Chia sẻ bài viết</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {shareTargets.map((target) => (
          <button key={target.label} type="button" onClick={() => openShare(target.url)} aria-label={target.label} className={`grid size-11 place-items-center rounded-full text-sm font-black text-white transition-transform hover:-translate-y-0.5 ${target.className}`}>
            {target.name}
          </button>
        ))}
        <button type="button" onClick={shareFromDevice} aria-label="Chia sẻ qua Zalo hoặc ứng dụng khác" className="grid size-11 place-items-center rounded-full bg-[#1788dc] text-[11px] font-black text-white transition-transform hover:-translate-y-0.5">Zalo</button>
        <button type="button" onClick={copyLink} aria-label={copied ? "Đã sao chép liên kết" : "Sao chép liên kết bài viết"} className="grid size-11 place-items-center rounded-full bg-[#e7eef5] text-[#1d4b6d] transition-transform hover:-translate-y-0.5">
          <Link2 className="size-4" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => openShare((page) => `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(page)}`)} aria-label="Chia sẻ qua LINE" className="grid size-11 place-items-center rounded-full bg-[#0bb83c] text-white transition-transform hover:-translate-y-0.5">
          <MessageCircle className="size-4" aria-hidden="true" />
        </button>
      </div>
      {copied && <span className="mt-2 block text-xs text-[#2b7c3d]" role="status">Đã sao chép liên kết để chia sẻ.</span>}
    </div>
  );
}
