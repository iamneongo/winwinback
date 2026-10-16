import { MarketingLayout } from "@/components/sections/MarketingLayout";

/**
 * Public articles use the same marketing shell as the landing page.
 * Both the news index and image-led article details share the sky-overlay header.
 */
export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingLayout className="flex min-h-screen flex-col">
      <div className="flex-1 bg-[#f4f7fc]">{children}</div>
    </MarketingLayout>
  );
}
