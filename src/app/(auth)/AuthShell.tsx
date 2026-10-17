import Link from "next/link";
import { Globe2, HelpCircle, TrendingUp } from "lucide-react";
import { AuthBrandPanel } from "./AuthBrandPanel";

export function AuthShell({
  children,
  mode = "login",
}: {
  children: React.ReactNode;
  mode?: "login" | "register";
}) {
  return (
    <div className="winwin-root auth-page min-h-screen text-[#0d315d]">
      <header className="auth-header relative z-10">
        <div className="marketing-container flex items-center justify-between gap-4 py-4 sm:py-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-black tracking-tight text-[#0d315d] transition-opacity hover:opacity-80">
            <TrendingUp className="h-7 w-7 text-[#8bd52c]" strokeWidth={3.5} />
            <span className="text-lg sm:text-xl">Win-Win Back</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium text-[#173b5e] sm:gap-6">
            <Link href="/lien-he" className="inline-flex items-center gap-2 transition-colors hover:text-[#238e28]">
              <HelpCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Trung tâm hỗ trợ</span>
              <span className="sr-only sm:hidden">Trung tâm hỗ trợ</span>
            </Link>
            <span className="hidden h-5 w-px bg-[#173b5e]/30 sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-2">
              <Globe2 className="h-5 w-5" />
              <span className="hidden sm:inline">Tiếng Việt</span>
              <span className="sr-only sm:hidden">Tiếng Việt</span>
            </span>
          </div>
        </div>
      </header>

      <main className="marketing-container auth-main relative z-10 grid items-center gap-6 pb-10 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,27rem)] lg:gap-10 lg:py-8">
        <AuthBrandPanel mode={mode} />
        <div className="auth-form-wrap flex min-w-0 justify-center lg:justify-end">{children}</div>
      </main>
    </div>
  );
}
