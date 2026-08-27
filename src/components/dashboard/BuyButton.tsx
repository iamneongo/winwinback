import { ShoppingBag } from "lucide-react";

/**
 * Primary call-to-action for the self-cashback flow: opens the tracked short
 * link (`/go/<code>`), which 302s to the affiliate deeplink and launches the
 * TikTok / Shopee app so the buyer completes the purchase there.
 */
export function BuyButton({
  href,
  platformName,
}: {
  href: string;
  platformName: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#b7e961] px-4 py-2 text-sm font-bold text-[#082b4b] transition hover:bg-[#c8f27a]"
    >
      <ShoppingBag className="h-4 w-4" />
      Mua trên {platformName}
    </a>
  );
}
