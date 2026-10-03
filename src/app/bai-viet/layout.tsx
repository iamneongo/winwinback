import { NavBar } from "@/components/sections/NavBar";
import { Footer } from "@/components/sections/Footer";

/**
 * Public article pages share the landing header/footer (the root layout only
 * provides <html>/<body>; each page composes NavBar/Footer itself).
 */
export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="winwin-root">
      <NavBar />
      {children}
      <Footer />
    </div>
  );
}
