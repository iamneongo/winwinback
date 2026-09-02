import { Skeleton } from "@/components/ui/skeleton";
import { cardClass } from "@/components/dashboard/ui";

const sk = "bg-[#e7eef7]";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">
          Kết nối sàn affiliate
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Kết nối tài khoản Affiliate Creator để tạo link và đồng bộ đơn hàng
        </p>
      </header>
      <div className={`${cardClass} space-y-3`}>
        <Skeleton className={`h-5 w-56 ${sk}`} />
        <Skeleton className={`h-24 w-full ${sk}`} />
        <Skeleton className={`h-11 w-48 ${sk}`} />
      </div>
    </main>
  );
}
