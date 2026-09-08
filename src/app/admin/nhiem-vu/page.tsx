import { requireAdmin } from "@/lib/auth/guards";
import { listPendingClaims } from "@/lib/missions/service";
import { formatVnd } from "@/lib/config";
import { cardClass, sectionTitleClass, Empty } from "@/components/dashboard/ui";
import { MissionClaimControls } from "@/components/admin/MissionClaimControls";
import { ClipboardCheck } from "lucide-react";

export const metadata = { title: "Duyệt nhiệm vụ — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AdminMissionsPage() {
  await requireAdmin();
  const claims = await listPendingClaims();

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-6 lg:pb-8 lg:pt-6">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-[#0d315d] sm:text-2xl">
          <ClipboardCheck className="h-6 w-6 text-[#1766e7]" /> Duyệt nhiệm vụ
        </h1>
        <p className="mt-1 text-sm text-[#6681a7]">
          Nhiệm vụ mạng xã hội cần bằng chứng. Duyệt để cộng thưởng vào ví người
          dùng, hoặc từ chối kèm lý do.
        </p>
      </div>

      <div className={`${cardClass} overflow-hidden p-0`}>
        <div className="flex items-center justify-between border-b border-[#e8eef6] px-4 py-4 sm:px-5">
          <h2 className={sectionTitleClass}>Chờ duyệt</h2>
          <span className="text-xs font-semibold text-[#6681a7]">
            {claims.length} yêu cầu
          </span>
        </div>
        {claims.length === 0 ? (
          <div className="p-5">
            <Empty text="Không có nhiệm vụ nào đang chờ duyệt." />
          </div>
        ) : (
          <ul className="divide-y divide-[#edf1f7]">
            {claims.map((c) => (
              <li key={c.id} className="flex flex-col gap-3 px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0d315d]">
                      {c.missionTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6681a7]">
                      {c.userName} · {c.userEmail}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#93a6c2]">
                      {c.createdAt.toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#eafbe0] px-2.5 py-1 text-xs font-black text-[#3f8a2e]">
                    +{formatVnd(c.reward)}
                  </span>
                </div>
                {c.proof && (
                  <a
                    href={c.proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit max-w-full truncate rounded-lg bg-[#f4f8ff] px-3 py-1.5 text-xs font-medium text-[#1766e7] hover:underline"
                  >
                    Xem bằng chứng: {c.proof}
                  </a>
                )}
                <MissionClaimControls claimId={c.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
