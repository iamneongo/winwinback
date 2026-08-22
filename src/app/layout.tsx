import type { Metadata } from "next";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Win-Win Back — Mua sắm có hoàn tiền",
  description: "Dán link sản phẩm từ TikTok Shop, Shopee hoặc Lazada. Tiền hoàn về ví khi đơn hoàn tất. Không mất phí.",
  openGraph: {
    title: "Win-Win Back — Dán link sản phẩm, nhận tiền hoàn về ví",
    description: "Dán link sản phẩm từ TikTok Shop, Shopee hoặc Lazada. Tiền hoàn về ví khi đơn hoàn tất. Không mất phí.",
    images: [
      {
        url: "/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/og-image.png",
        width: 1512,
        height: 756,
        alt: "Win-Win Back — Dán link sản phẩm, nhận tiền hoàn về ví",
      },
    ],
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Win-Win Back — Dán link sản phẩm, nhận tiền hoàn về ví",
    description: "Dán link sản phẩm từ TikTok Shop, Shopee hoặc Lazada. Tiền hoàn về ví khi đơn hoàn tất.",
    images: ["/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/sites/hoantienms-manus-722fa8de/root-8a5edab2/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/sites/hoantienms-manus-722fa8de/root-8a5edab2/favicon.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SmoothScroll>
          <ScrollReveal />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
