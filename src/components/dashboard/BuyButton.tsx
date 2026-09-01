import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <Button
      variant="cta"
      nativeButton={false}
      className="h-auto min-h-9 shrink-0 gap-1.5 rounded-lg px-3 py-2 text-xs font-bold"
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
    >
      <ShoppingBag className="h-4 w-4" />
      Mua trên {platformName}
    </Button>
  );
}
