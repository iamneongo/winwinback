import { ShieldCheck, Tag, TrendingUp } from "lucide-react";

const CHIPS = [
  { icon: TrendingUp, label: "Hoàn tiền dễ dàng" },
  { icon: Tag, label: "Ưu đãi mỗi ngày" },
  { icon: ShieldCheck, label: "Minh bạch & an toàn" },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative max-w-xl">
      <h1 className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
        Đăng nhập vào
        <br />
        <span className="text-[#b7e961]">Win-Win Back</span>
      </h1>
      <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
        Theo dõi hoàn tiền, khám phá ưu đãi và tối ưu mua sắm mỗi ngày.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        {CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/90"
          >
            <Icon className="h-[18px] w-[18px] text-[#b7e961]" strokeWidth={2.2} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
