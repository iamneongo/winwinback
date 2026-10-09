import type { Metadata, Viewport } from "next";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import "./globals.css";
import { ScrollReveal } from "@/components/ScrollReveal";

const seoTitle =
  "Win-Win Back | Hoàn Tiền Mua Sắm - cashback | Shopee back | Tiktok back";
const seoDescription =
  "Win-Win Back | ứng dụng cashback hoàn tiền khi mua Shopee, TikTok Shop. Voucher, sale, mã giảm giá mỗi ngày | Shopee back | Tiktok back";

export const metadata: Metadata = {
  verification: {
    google: "7Giw3RHbXlo2wZlRBZN79Fk0WywQwMPpX6jur2pXyr0",
  },
  appleWebApp: { capable: true, title: "Win-Win Back", statusBarStyle: "default" },
  icons: { apple: "/icons/pwa-180.png" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com"),
  title: seoTitle,
  description: seoDescription,
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: "/images/og-image.png",
        width: 1512,
        height: 756,
        alt: seoTitle,
      },
    ],
    type: "website",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: ["/images/og-image.png"],
  },
};

export const viewport: Viewport = { themeColor: "#082b4b" };

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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ScrollReveal />
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
