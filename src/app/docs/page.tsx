import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  CircleCheck,
  ClipboardPaste,
  Database,
  ExternalLink,
  Link2,
  MousePointerClick,
  PackageCheck,
  ServerCog,
  ShieldCheck,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const steps = [
  {
    icon: ClipboardPaste,
    title: "Dán link sản phẩm",
    text: "Người dùng dán link Shopee hoặc TikTok Shop vào Win-Win Back.",
  },
  {
    icon: Link2,
    title: "Tạo link có tracking",
    text: "Hệ thống tạo link affiliate và gắn định danh để quy đơn về đúng tài khoản.",
  },
  {
    icon: ShoppingBag,
    title: "Mua hàng trên sàn",
    text: "Link mở ứng dụng hoặc website của sàn; người dùng thanh toán như bình thường.",
  },
  {
    icon: PackageCheck,
    title: "Đối soát đơn",
    text: "Báo cáo affiliate được đồng bộ định kỳ để cập nhật trạng thái và hoa hồng.",
  },
  {
    icon: WalletCards,
    title: "Cộng hoàn tiền",
    text: "Khi đơn được sàn chốt hợp lệ, cashback được cộng vào ví của người dùng.",
  },
];

const safeguards = [
  "Link gốc, link affiliate và người sở hữu được lưu cùng nhau.",
  "Mỗi đơn chỉ được cộng tiền một lần nhờ cơ chế idempotent.",
  "Đơn hủy, hoàn trả hoặc chưa được xác nhận sẽ không được chi trả.",
  "SubId1 của Shopee được chuẩn hóa thành chữ và số, rồi khôi phục khi đối soát.",
];

function FlowNode({
  icon: Icon,
  label,
  note,
  tone,
}: {
  icon: typeof ClipboardPaste;
  label: string;
  note: string;
  tone: "navy" | "lime" | "orange" | "blue";
}) {
  const tones = {
    navy: "bg-[#0a345b] text-white",
    lime: "bg-[#b7e961] text-[#173b5e]",
    orange: "bg-[#f45d3e] text-white",
    blue: "bg-[#e8f1ff] text-[#24578e]",
  };

  return (
    <div className="min-w-[10rem] flex-1 rounded-xl border border-[#dce7f4] bg-white p-4">
      <span className={`mb-4 flex size-9 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon className="size-[18px]" strokeWidth={2.25} />
      </span>
      <p className="text-sm font-bold text-[#12355f]">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[#587298]">{note}</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-svh bg-[#f5f8fc] text-[#12355f]">
      <header className="border-b border-[#dfe9f5] bg-white">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Về trang chủ Win-Win Back">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden text-sm font-semibold text-[#47698f] transition-colors hover:text-[#12355f] sm:inline"
            >
              Vào dashboard
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#b7e961] px-3 text-sm font-bold text-[#173b5e] transition-colors hover:bg-[#c7f178] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397b1d]"
            >
              Bắt đầu tạo link <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-[#dfe9f5] bg-[#082f54]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:py-20">
            <div className="max-w-3xl">
              <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-[#cde995] hover:text-white">
                <ChevronLeft className="size-4" /> Trang chủ
              </Link>
              <p className="mt-8 text-sm font-bold text-[#cde995]">Tài liệu hệ thống</p>
              <h1 className="mt-3 text-balance text-4xl font-black tracking-[-0.03em] text-white sm:text-5xl">
                Hoàn tiền minh bạch, từ link đến ví.
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#c8d9eb] sm:text-lg">
                Win-Win Back tạo link mua sắm có tracking, quy đơn hàng về đúng người dùng và chỉ chi trả khi sàn xác nhận hoa hồng.
              </p>
            </div>
            <aside className="rounded-xl bg-[#123f68] p-5 text-sm text-[#d9e6f3]">
              <div className="flex items-center gap-2 font-bold text-white"><BadgeCheck className="size-5 text-[#c8f179]" /> Nguyên tắc chi trả</div>
              <p className="mt-3 leading-6">Không dựa trên click. Cashback chỉ được cộng khi báo cáo affiliate cho thấy đơn hợp lệ đã được sàn chốt.</p>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#12355f]">Luồng hoạt động</h2>
            <p className="mt-3 leading-7 text-[#577292]">Mỗi bước đều để lại dấu vết có thể kiểm tra: link đã tạo, lượt truy cập, đơn hàng và giao dịch ví.</p>
          </div>

          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex min-w-[54rem] items-stretch gap-2">
              <FlowNode icon={ClipboardPaste} label="Người dùng" note="Dán link sản phẩm" tone="navy" />
              <ArrowRight className="my-auto size-5 shrink-0 text-[#8aa4c1]" />
              <FlowNode icon={ServerCog} label="Win-Win Back" note="Tạo link & lưu attribution" tone="lime" />
              <ArrowRight className="my-auto size-5 shrink-0 text-[#8aa4c1]" />
              <FlowNode icon={ShoppingBag} label="Shopee / TikTok" note="Mở app hoặc web để mua" tone="orange" />
              <ArrowRight className="my-auto size-5 shrink-0 text-[#8aa4c1]" />
              <FlowNode icon={Database} label="Affiliate report" note="Trả đơn, trạng thái, hoa hồng" tone="blue" />
              <ArrowRight className="my-auto size-5 shrink-0 text-[#8aa4c1]" />
              <FlowNode icon={WalletCards} label="Ví người dùng" note="Cộng hoàn tiền khi đã chốt" tone="lime" />
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#6681a7]">Sơ đồ tham khảo: việc ghi nhận từ sàn có thể mất thời gian tùy trạng thái giao hàng, hoàn trả và chu kỳ duyệt hoa hồng.</p>
        </section>

        <section className="border-y border-[#dfe9f5] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-18">
            <div className="flex max-w-2xl flex-col gap-3">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#12355f]">Từ sản phẩm đến cashback</h2>
              <p className="leading-7 text-[#577292]">Đây là những gì hệ thống thực hiện sau khi người dùng dán một link hợp lệ.</p>
            </div>
            <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map(({ icon: Icon, title, text }, index) => (
                <li key={title} className="relative">
                  <div className="flex items-center gap-3 lg:block">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#2869aa]">
                      <Icon className="size-5" />
                    </span>
                    <span className="ml-auto text-sm font-black text-[#a2b6ce] lg:absolute lg:right-0 lg:top-3">{index + 1}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#173b5e]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#5c7697]">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:py-18">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.02em] text-[#12355f]">Logic theo từng sàn</h2>
            <div className="mt-7 space-y-5">
              <article className="rounded-xl border border-[#dce7f4] bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0ec] text-[#e3482d]"><ShoppingBag className="size-5" /></span>
                  <div>
                    <h3 className="font-black text-[#173b5e]">Shopee</h3>
                    <p className="mt-2 text-sm leading-6 text-[#587298]">ShopeeAff tạo link qua một phiên Chrome đã đăng nhập. ID người dùng được đưa vào <code className="rounded bg-[#eef4fb] px-1.5 py-0.5 text-[12px] font-semibold text-[#355b85]">SubId1</code> bằng chuỗi chữ–số để Shopee chấp nhận. Khi cron đọc report, hệ thống đổi SubId đó về UUID để quy đơn.</p>
                  </div>
                </div>
              </article>
              <article className="rounded-xl border border-[#dce7f4] bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef0ff] text-[#111827]"><MousePointerClick className="size-5" /></span>
                  <div>
                    <h3 className="font-black text-[#173b5e]">TikTok Shop</h3>
                    <p className="mt-2 text-sm leading-6 text-[#587298]">Hệ thống dùng token Affiliate Creator để tạo sharing link / deeplink. Conversion được đồng bộ từ báo cáo affiliate và ghép với link đã lưu trong hệ thống.</p>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <aside className="rounded-xl bg-[#eaf7e3] p-6">
            <div className="flex items-center gap-2 text-[#2e701a]"><ShieldCheck className="size-5" /><h2 className="font-black">Lớp kiểm soát</h2></div>
            <ul className="mt-5 space-y-4">
              {safeguards.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-[#355b3e]">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-[#4e9b27]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="border-t border-[#dfe9f5] bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <h2 className="font-black text-[#173b5e]">Sẵn sàng tạo link hoàn tiền?</h2>
              <p className="mt-1 text-sm text-[#6681a7]">Dán link sản phẩm và để hệ thống xử lý phần tracking.</p>
            </div>
            <Link href="/dashboard" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0a345b] px-4 text-sm font-bold text-white transition-colors hover:bg-[#124a78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397b1d]">
              Mở dashboard <ExternalLink className="size-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
