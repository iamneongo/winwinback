import { SiteHeader } from "@/components/sections/SiteHeader";
import { Footer } from "@/components/sections/Footer";

/**
 * Public article pages get a solid site header + the landing footer. (The root
 * layout only provides <html>/<body>; the landing NavBar is a hero-only overlay,
 * so content pages use SiteHeader instead.)
 */
export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="winwin-root flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1 bg-[#f4f7fc]">{children}</div>
      <Footer />
    </div>
  );
}
