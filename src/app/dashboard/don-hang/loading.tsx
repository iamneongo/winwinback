import { Skeleton } from "@/components/ui/skeleton";
import { cardClass } from "@/components/dashboard/ui";

const sk = "bg-[#e7eef7]";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">
          Đơn hàng của tôi
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Theo dõi trạng thái đơn hàng và tiền hoàn của bạn
        </p>
      </header>
      <Skeleton className={`mb-5 h-12 w-full max-w-[44rem] rounded-xl ${sk}`} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${cardClass} min-h-[8.25rem]`}>
            <Skeleton className={`h-12 w-12 rounded-full ${sk}`} />
            <Skeleton className={`mt-3 h-4 w-28 ${sk}`} />
            <Skeleton className={`mt-2 h-7 w-20 ${sk}`} />
          </div>
        ))}
      </div>
      <div className={`mt-5 ${cardClass} space-y-3`}>
        <Skeleton className={`h-5 w-48 ${sk}`} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className={`h-12 w-full ${sk}`} />
        ))}
      </div>
    </main>
  );
}
