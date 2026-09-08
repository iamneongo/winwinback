import { requireUser } from "@/lib/auth/guards";
import { getMissionState, ensureReferralCode } from "@/lib/missions/service";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { MissionBoard } from "@/components/dashboard/MissionBoard";

export const metadata = { title: "Nhiệm vụ nhận quà — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  const user = await requireUser();
  const [missions, code, baseUrl] = await Promise.all([
    getMissionState(user),
    ensureReferralCode(user),
    getRequestBaseUrl(),
  ]);
  const referral = missions.find((m) => m.kind === "referral")?.progress;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-6 lg:pb-8 lg:pt-6">
      <div className="mb-5">
        <h1 className="text-xl font-black tracking-tight text-[#0d315d] sm:text-2xl">
          Nhiệm vụ nhận quà
        </h1>
        <p className="mt-1 text-sm text-[#6681a7]">
          Hoàn thành nhiệm vụ để nhận thưởng tiền mặt vào ví hoàn tiền của bạn.
        </p>
      </div>
      <MissionBoard
        missions={missions}
        inviteUrl={`${baseUrl}/r/${code}`}
        referralCount={referral?.current ?? 0}
      />
    </main>
  );
}
