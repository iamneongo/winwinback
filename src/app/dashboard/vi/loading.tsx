import { Skeleton } from "@/components/ui/skeleton";
import { cardClass } from "@/components/dashboard/ui";

const sk = "bg-[#e7eef7]";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-6">
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#11335e] sm:text-[30px]">
          Ví hoàn tiền
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Theo dõi số dư, lịch sử giao dịch và rút tiền về tài khoản của bạn
        </p>
      </header>
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22.8rem]">
        <div>
          <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${cardClass} min-h-[9.5rem]`}>
                <Skeleton className={`h-10 w-10 rounded-full ${sk}`} />
                <Skeleton className={`mt-4 h-6 w-24 ${sk}`} />
                <Skeleton className={`mt-4 h-4 w-20 ${sk}`} />
              </div>
            ))}
          </div>
          <div className={`mt-4 ${cardClass} space-y-3`}>
            <Skeleton className={`h-5 w-40 ${sk}`} />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`h-11 w-full ${sk}`} />
            ))}
          </div>
        </div>
        <aside className="space-y-4">
          <div className={`${cardClass} space-y-3`}>
            <Skeleton className={`h-5 w-24 ${sk}`} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={`h-10 w-full ${sk}`} />
            ))}
          </div>
          <div className={`${cardClass} space-y-3`}>
            <Skeleton className={`h-5 w-32 ${sk}`} />
            <Skeleton className={`h-12 w-full ${sk}`} />
          </div>
        </aside>
      </section>
    </main>
  );
}
