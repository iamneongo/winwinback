import Link from "next/link";
import { Wallet, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { formatVnd } from "@/lib/config";
import { Dock } from "@/components/dashboard/Dock";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="winwin-root relative min-h-screen bg-[#082b4b] pb-32 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#082b4b]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-4">
          <Link
            href="/dashboard"
            className="text-lg font-black tracking-tight"
          >
            Win-Win <span className="text-[#b7e961]">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-full border border-[#b7e961]/25 bg-[#b7e961]/10 px-3 py-1.5 text-sm">
              <Wallet className="h-4 w-4 text-[#b7e961]" />
              <span className="font-bold text-[#b7e961]">
                {formatVnd(user.balance)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#b7e961] text-xs font-black text-[#0a2438]">
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-[9rem] truncate font-medium text-white/85 sm:inline">
                {user.name}
              </span>
              {user.role === "admin" && (
                <span className="flex items-center gap-1 rounded-full bg-[#eabf39]/15 px-2 py-0.5 text-[10px] font-bold text-[#eabf39]">
                  <ShieldCheck className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {children}

      <Dock role={user.role} />
    </div>
  );
}
