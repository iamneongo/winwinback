import { Skeleton } from "@/components/ui/skeleton";
import { cardClass } from "@/components/dashboard/ui";

const sk = "bg-[#e7eef7]";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <header className="mb-5">
        <h1 className="text-[30px] font-black tracking-tight text-[#11335e]">
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-[#58749a]">
          Quản lý tài khoản, bảo mật và tùy chọn sử dụng của bạn
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${cardClass} min-h-[6.4rem] flex items-center gap-3`}>
            <Skeleton className={`h-12 w-12 rounded-full ${sk}`} />
            <div className="flex-1 space-y-2">
              <Skeleton className={`h-4 w-24 ${sk}`} />
              <Skeleton className={`h-3 w-32 ${sk}`} />
            </div>
          </div>
        ))}
      </div>
      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22.8rem]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${cardClass} space-y-3`}>
              <Skeleton className={`h-5 w-40 ${sk}`} />
              <Skeleton className={`h-11 w-full ${sk}`} />
              <Skeleton className={`h-11 w-2/3 ${sk}`} />
            </div>
          ))}
        </div>
        <aside className="space-y-4">
          <div className={`${cardClass} space-y-3`}>
            <Skeleton className={`h-5 w-32 ${sk}`} />
            <Skeleton className={`h-20 w-full ${sk}`} />
          </div>
        </aside>
      </section>
    </main>
  );
}
