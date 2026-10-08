import { requireUser } from "@/lib/auth/guards";
import { getMissionState, ensureReferralCode, getReferralCount } from "@/lib/missions/service";
import { getRequestBaseUrl } from "@/lib/baseUrl";
import { MissionBoard } from "@/components/dashboard/MissionBoard";
import { DashboardPageHeader } from "@/components/dashboard/ui";

export const metadata = { title: "Nhiệm vụ nhận quà — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function MissionsPage() {
  const user = await requireUser();
  const [missions, code, baseUrl, referralCount] = await Promise.all([
    getMissionState(user),
    ensureReferralCode(user),
    getRequestBaseUrl(),
    getReferralCount(user.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 lg:px-8 lg:py-7">
      <DashboardPageHeader title="Nhiệm vụ nhận quà" description="Hoàn thành nhiệm vụ để nhận thưởng tiền mặt vào ví hoàn tiền của bạn." />
      <MissionBoard
        missions={missions}
        inviteUrl={`${baseUrl}/r/${code}`}
        referralCount={referralCount}
      />
    </main>
  );
}
