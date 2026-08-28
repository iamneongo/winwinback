import Link from "next/link";
import { HelpCircle, Globe, TrendingUp } from "lucide-react";
import { AuthBrandPanel } from "./AuthBrandPanel";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="winwin-root relative min-h-screen overflow-hidden bg-[#06192e] text-white">
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(183,233,97,0.10), transparent 34%), radial-gradient(circle at 62% 68%, rgba(70,120,220,0.14), transparent 40%)",
        }}
        aria-hidden="true"
      />

      <header className="relative">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b7e961]/15 text-[#b7e961]">
              <TrendingUp className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="text-lg font-black tracking-tight">
              Win-Win Back
            </span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-white/65">
            <Link
              href="/"
              className="hidden items-center gap-1.5 transition-colors hover:text-white sm:flex"
            >
              <HelpCircle className="h-4 w-4" /> Trung tâm hỗ trợ
            </Link>
            <span className="hidden h-4 w-px bg-white/15 sm:block" />
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4" /> Tiếng Việt
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-screen-xl items-center gap-x-10 gap-y-12 px-6 pb-20 pt-6 lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:pt-4">
        <div className="hidden lg:block">
          <AuthBrandPanel />
        </div>
        <div className="flex w-full justify-center lg:justify-end">
          {children}
        </div>
      </div>
    </div>
  );
}
