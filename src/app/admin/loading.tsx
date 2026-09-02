import { Skeleton } from "@/components/ui/skeleton";
import { cardClass } from "@/components/dashboard/ui";

const sk = "bg-[#e7eef7]";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">
          Quản trị
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Quản lý đơn hàng, hoa hồng, yêu cầu rút tiền và khách hàng
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${cardClass} flex items-center gap-3`}>
            <Skeleton className={`h-12 w-12 rounded-full ${sk}`} />
            <div className="flex-1 space-y-2">
              <Skeleton className={`h-3 w-24 ${sk}`} />
              <Skeleton className={`h-6 w-16 ${sk}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${cardClass} space-y-3`}>
            <Skeleton className={`h-5 w-48 ${sk}`} />
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className={`h-11 w-full ${sk}`} />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
