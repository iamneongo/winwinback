import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { articleOutros } from "@/db/schema";

type Outro = typeof articleOutros.$inferSelect;

export function ArticleOutroPreview({ outro, manual = true }: { outro: Outro; manual?: boolean }) {
  return (
    <section className="article-outro-preview news-article-cta relative isolate min-w-0 overflow-hidden rounded-xl text-[#12365a]" aria-label={`Xem trước mẫu ${outro.name}`}>
      <div className="news-article-cta-art pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-44" aria-hidden="true">
        <Image
          src={outro.imageUrl || "/images/news-cta-shopping-banner-v2.webp"}
          unoptimized
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 640px"
          className="object-cover object-[70%_center]"
        />
      </div>
      <div className="news-cta-wash absolute inset-0 -z-10" aria-hidden="true" />
      <div className="relative z-10 px-4 pb-36 pt-5">
        <h3 className="line-clamp-3 text-balance text-lg font-black leading-snug tracking-[-0.02em]">
          {outro.title || "Mua sắm cùng Win-Win Back và kiểm tra tiền hoàn trước khi đặt hàng"}
        </h3>
        {outro.body && <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#315570]">{outro.body}</p>}
        <p className="mt-2 text-xs leading-5 text-[#315570]">
          {manual
            ? "Khám phá thêm nội dung và ưu đãi mua sắm trên Win-Win Back."
            : "Giá, thông tin sản phẩm và mức hoàn tiền sẽ lấy từ bài viết thực tế."}
        </p>
        <span className="ww-btn-cta mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-extrabold">
          {manual ? outro.buttonLabel || "Bắt đầu mua sắm ngay" : "Xem sản phẩm trên sàn"}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
        {outro.links.length > 0 && <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#245b7c]">
          {outro.links.map((link, index) => <li key={`${link.url}-${index}`} className="underline underline-offset-2">{link.label || "Liên kết"}</li>)}
        </ul>}
      </div>
    </section>
  );
}
