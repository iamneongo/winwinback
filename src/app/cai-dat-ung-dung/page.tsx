import Link from "next/link";
import { Smartphone, Share2, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Footer } from "@/components/sections/Footer";
import { InstallActions, ShortcutAddress } from "@/components/pwa/InstallActions";

export const metadata = {
  title: "Chia sẻ link nhanh từ Shopee, TikTok — Win-Win Back",
  description: "Cài Win-Win Back trên Android hoặc thiết lập Phím tắt iPhone để nhận link chia sẻ từ Shopee và TikTok Shop.",
};

const errors: Record<string, string> = {
  missing: "Chưa nhận được link. Hãy chia sẻ từ trang sản phẩm Shopee hoặc TikTok Shop.",
  unsupported: "Chưa tìm thấy link Shopee hoặc TikTok Shop trong nội dung chia sẻ. Hãy chọn Chia sẻ liên kết ở trang sản phẩm.",
  multiple: "Nội dung có nhiều link sản phẩm. Hãy gửi từng link để kiểm tra đúng sản phẩm bạn muốn mua.",
  "too-long": "Nội dung chia sẻ quá dài. Hãy gửi riêng link sản phẩm.",
};

export default async function InstallPage({ searchParams }: { searchParams: Promise<{ shareError?: string }> }) {
  const { shareError } = await searchParams;
  return <>
    <SiteHeader />
    <main className="mx-auto w-full max-w-3xl px-5 py-10 text-[#173861] sm:py-14">
      <Link href="/dashboard" className="text-sm font-semibold underline underline-offset-4">Về trang kiểm tra hoàn tiền</Link>
      <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-4xl">Chia sẻ link. Kiểm tra hoàn tiền.</h1>
      <p className="mt-4 max-w-prose text-base leading-7 text-[#49688f]">Gửi sản phẩm từ Shopee hoặc TikTok Shop sang Win-Win Back ngay trong menu Chia sẻ. Chọn cách thiết lập cho điện thoại của bạn.</p>
      {shareError && <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{errors[shareError] ?? errors.unsupported}</p>}
      <nav aria-label="Chọn điện thoại" className="mt-6 flex flex-wrap gap-3">
        <a href="#android" className="rounded-full bg-[#b7e961] px-5 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">Android</a>
        <a href="#iphone" className="rounded-full border border-[#c7d6e8] px-5 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4">iPhone / iPad</a>
      </nav>

      <section id="android" className="mt-10 scroll-mt-6 rounded-2xl border border-[#dbe6f3] bg-white p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Smartphone className="size-5" />Android: cài ứng dụng</h2>
        <p className="mt-3 leading-7 text-[#49688f]">Cài bằng Chrome để Win-Win Back có thể xuất hiện trong bảng chia sẻ của điện thoại.</p>
        <InstallActions />
        <ol className="mt-5 list-decimal space-y-3 pl-5 leading-7">
          <li>Cài Win-Win Back, mở ứng dụng và đăng nhập tài khoản của bạn.</li>
          <li>Trong trang sản phẩm Shopee hoặc TikTok Shop, bấm <strong>Chia sẻ → Thêm / …</strong> để mở bảng chia sẻ của điện thoại.</li>
          <li>Chọn <strong>Win-Win Back</strong>. Ứng dụng nhận link và kiểm tra hoàn tiền.</li>
          <li>Xem kết quả rồi bấm <strong>Mua trên Shopee / TikTok Shop</strong> để tiếp tục mua qua link hoàn tiền.</li>
        </ol>
        <p className="mt-5 text-sm leading-6 text-[#49688f]">Không thấy Win-Win Back? Kiểm tra đã cài ứng dụng, cập nhật Chrome và mở lại bảng chia sẻ. Một số phiên bản Shopee/TikTok chỉ hiện danh sách riêng; cần mở mục Thêm để xem ứng dụng hệ thống.</p>
      </section>

      <section id="iphone" className="mt-6 scroll-mt-6 rounded-2xl border border-[#dbe6f3] bg-white p-5 sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Share2 className="size-5" />iPhone / iPad: tạo Phím tắt</h2>
        <p className="mt-3 leading-7 text-[#49688f]">Thiết lập một lần trong ứng dụng Phím tắt (Shortcuts). Sau đó chọn phím tắt từ bảng chia sẻ để mở link trên Win-Win Back bằng Safari. Chỉ thêm web vào màn hình chính chưa bật được tính năng nhận chia sẻ trên iPhone.</p>
        <ol className="mt-5 list-decimal space-y-5 pl-5 leading-7">
          <li>Mở <strong>Phím tắt → +</strong>, đặt tên <strong>Hoàn tiền Win-Win Back</strong>. Trong phần Chi tiết, bật <strong>Hiển thị trong bảng chia sẻ</strong>. Chọn loại đầu vào <strong>URL</strong> và <strong>Văn bản</strong>; khi không có đầu vào, chọn <strong>Dừng và phản hồi</strong>.</li>
          <li>Thêm tác vụ <strong>Lấy văn bản từ đầu vào (Get Text from Input)</strong>. Đầu vào là biến <strong>Đầu vào phím tắt (Shortcut Input)</strong>.</li>
          <li>Thêm <strong>Mã hóa URL (URL Encode)</strong>, chọn <strong>Mã hóa</strong> văn bản của bước trên. Bước này giữ nguyên các ký tự đặc biệt trong link sản phẩm.</li>
          <li>Thêm tác vụ <strong>Văn bản (Text)</strong>. Dán địa chỉ dưới đây, sau dấu <code>=</code> chèn biến kết quả <strong>Văn bản đã mã hóa URL</strong> từ bước trước, trên cùng một dòng:
            <ShortcutAddress />
            <p className="text-sm text-[#49688f]">Chèn biến bằng bộ chọn biến của Phím tắt; không gõ tên biến thành chữ thường.</p>
          </li>
          <li>Thêm <strong>Mở URL (Open URLs)</strong>, chọn kết quả của tác vụ Văn bản vừa tạo. Bấm <strong>Xong</strong>.</li>
        </ol>
        <p className="mt-5 rounded-lg bg-[#eff8e7] p-4 leading-7">Để dùng: <strong>Shopee / TikTok → Chia sẻ → Thêm → Hoàn tiền Win-Win Back</strong>. Safari mở trang kiểm tra. Nếu được hỏi quyền mở Win-Win Back, hãy cho phép. Bạn có thể cần đăng nhập lần đầu trong Safari.</p>
        <details className="mt-5 border-t border-[#dbe6f3] pt-4">
          <summary className="cursor-pointer py-2 font-semibold">Thêm Win-Win Back vào màn hình chính iPhone</summary>
          <p className="mt-2 leading-7 text-[#49688f]">Trong Safari, mở winwinback.com → Chia sẻ → Thêm vào màn hình chính. Bạn sẽ có biểu tượng mở nhanh ứng dụng; Shortcut ở trên vẫn mở bằng Safari, không đảm bảo mở trong cửa sổ PWA.</p>
        </details>
      </section>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
        <p className="max-w-prose leading-6 text-[#49688f]">Cần kết nối mạng để tạo link. Nếu hết phiên đăng nhập, sản phẩm vẫn được giữ để tiếp tục sau khi đăng nhập.</p>
        <Link href="/dashboard#tao-link" className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4">Dán link như bình thường <ArrowRight className="size-4" /></Link>
      </div>
    </main>
    <Footer />
  </>;
}
