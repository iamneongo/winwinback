import { Footer } from "@/components/sections/Footer";
import { ArticleNavBar } from "./ArticleNavBar";

/**
 * Public articles share the landing navigation and footer. The listing header
 * overlays its banner; detail pages retain a solid header above light content.
 */
export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="winwin-root relative flex min-h-screen flex-col">
      <ArticleNavBar />
      <div className="flex-1 bg-[#f4f7fc]">{children}</div>
      <Footer />
    </div>
  );
}
