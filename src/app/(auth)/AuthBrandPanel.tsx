import { Package, Wallet, BadgePercent, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Package,
    title: "Theo dõi đơn hàng dễ dàng",
    desc: "Cập nhật trạng thái đơn hàng theo thời gian thực.",
  },
  {
    icon: Wallet,
    title: "Nhận tiền hoàn về ví",
    desc: "Tiền hoàn tự động về ví, rút tiền về ngân hàng nhanh chóng.",
  },
  {
    icon: BadgePercent,
    title: "Mã giảm giá luôn sẵn sàng",
    desc: "Săn mã giảm giá độc quyền từ Shopee và TikTok Shop.",
  },
];

export function AuthBrandPanel() {
  return (
    <div className="relative">
      <h1 className="max-w-xl text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-[3.6rem]">
        Đăng nhập để
        <br />
        <span className="ww-lime-text-gradient">nhận hoàn tiền dễ hơn</span>
      </h1>
      <p className="mt-5 max-w-md text-base text-white/65 sm:text-lg">
        Dán link sản phẩm, theo dõi đơn hàng và rút tiền hoàn về ví nhanh chóng,
        an toàn.
      </p>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <ul className="space-y-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[#b7e961]">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="font-bold text-white">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-white/55">
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Mascot */}
        <div className="relative hidden justify-center lg:flex">
          <div
            className="absolute inset-0 -z-10 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(88,150,255,0.28), transparent 62%)",
            }}
            aria-hidden="true"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-mascot-v3.png"
            alt="Win-Win Back mascot"
            className="w-[300px] max-w-full drop-shadow-2xl xl:w-[360px]"
          />
        </div>
      </div>

      <div className="mt-10 flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b7e961]" />
        <p className="text-sm text-white/60">
          <span className="font-bold text-white">
            An toàn · Bảo mật · Minh bạch
          </span>
          <br />
          Win-Win Back cam kết bảo vệ thông tin của bạn.
        </p>
      </div>
    </div>
  );
}
