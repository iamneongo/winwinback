import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

export function AppHeader({
  name,
  role,
}: {
  name: string;
  role: "user" | "admin";
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#082b4b]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-black text-white">
          Win-Win <span className="text-[#b7e961]">Back</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-white/80 hover:text-white">
            Bảng điều khiển
          </Link>
          {role === "admin" && (
            <Link href="/admin" className="text-white/80 hover:text-white">
              Quản trị
            </Link>
          )}
          <span className="hidden text-white/50 sm:inline">|</span>
          <span className="hidden text-white/70 sm:inline">{name}</span>
          <SignOutButton className="rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/10">
            Đăng xuất
          </SignOutButton>
        </nav>
      </div>
    </header>
  );
}
