import Image from "next/image";

export function AuthBrandPanel({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";

  return (
    <div className="auth-brand relative min-w-0 self-stretch">
      <div className="relative z-10">
        <span className="inline-flex rounded-full bg-[#e5f8d4] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#238d29]">
          Hoàn tiền dễ dàng
        </span>
        <h1 className="auth-brand-title mt-4 font-black text-[#0d315d]">
          {isRegister ? "Bắt đầu cùng" : "Đăng nhập vào"}
          <br />
          <span className="text-[#279d31]">Win-Win Back</span>
        </h1>
        <p className="mt-4 max-w-[27rem] text-sm leading-relaxed text-[#4d6d93] sm:text-base">
          {isRegister
            ? "Tạo tài khoản để theo dõi hoàn tiền, khám phá ưu đãi và mua sắm thông minh mỗi ngày."
            : "Theo dõi hoàn tiền, khám phá ưu đãi và tối ưu mua sắm mỗi ngày."}
        </p>
      </div>
      <Image
        src="/images/landing-hero-mascot-v3.webp"
        alt="Linh vật Win-Win Back cầm điện thoại báo hoàn tiền thành công"
        width={768}
        height={512}
        priority
        className="auth-mascot pointer-events-none relative z-0 mt-2 h-auto w-full max-w-[29rem] select-none"
      />
    </div>
  );
}
