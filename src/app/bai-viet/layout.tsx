import { NavBar } from "@/components/sections/NavBar";
import { Footer } from "@/components/sections/Footer";

/**
 * Public articles share the landing navigation and footer. The solid variant
 * keeps the same links and sizing legible above article content.
 */
export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="winwin-root flex min-h-screen flex-col">
      <NavBar variant="solid" />
      <div className="flex-1 bg-[#f4f7fc]">{children}</div>
      <Footer />
    </div>
  );
}
