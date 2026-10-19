"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const pixelScript = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1090504986953204');
fbq('track', 'PageView');
`;

export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = `${pathname}?${searchParams.toString()}`;
  const lastPage = useRef(page);

  useEffect(() => {
    if (page === lastPage.current) return;
    const fbq = (window as Window & { fbq?: (...args: string[]) => void }).fbq;
    if (!fbq) return;
    fbq("track", "PageView");
    lastPage.current = page;
  }, [page]);

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      onReady={() => {
        // The inline bootstrap already tracks the current URL once.
        lastPage.current = `${window.location.pathname}?${window.location.search.slice(1)}`;
      }}
    >
      {pixelScript}
    </Script>
  );
}
