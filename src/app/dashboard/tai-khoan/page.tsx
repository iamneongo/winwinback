import Link from "next/link";
import { User, Mail, CalendarDays, ShieldCheck, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { logoutAction } from "@/app/(auth)/actions";
import { PageHeader, cardClass } from "@/components/dashboard/ui";

export const metadata = { title: "Tài khoản — Win-Win Back" };
export const dynamic = "force-dynamic";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60">
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-white/45">{label}</p>
        <p className="truncate text-sm font-medium text-white/90">{value}</p>
      </div>
    </div>
  );
}

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <PageHeader
        icon={User}
        title="Quản lý tài khoản"
        hint="Thông tin tài khoản Win-Win Back của bạn."
      />

      <div className={cardClass}>
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b7e961] text-xl font-black text-[#0a2438]">
            {user.name.trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-bold text-white">{user.name}</p>
            <span
              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                user.role === "admin"
                  ? "bg-[#eabf39]/15 text-[#eabf39]"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {user.role === "admin" ? (
                <>
                  <ShieldCheck className="h-3 w-3" /> Quản trị viên
                </>
              ) : (
                "Người dùng"
              )}
            </span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <Row icon={Mail} label="Email" value={user.email} />
          <Row
            icon={CalendarDays}
            label="Tham gia từ"
            value={user.createdAt.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
            >
              <ShieldCheck className="h-4 w-4" /> Trang quản trị
            </Link>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
