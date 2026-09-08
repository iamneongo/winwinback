"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import {
  Link2,
  ShoppingBag,
  Share2,
  Users,
  Star,
  UserPlus,
  UsersRound,
  Gift,
  Check,
  Copy,
  CircleCheck,
  Clock,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVnd } from "@/lib/config";
import type { MissionView } from "@/lib/missions/service";
import {
  claimMissionAction,
  submitProofAction,
} from "@/app/dashboard/nhiem-vu/actions";

const icons: Record<string, LucideIcon> = {
  Link2,
  ShoppingBag,
  Share2,
  Users,
  Star,
  UserPlus,
  UsersRound,
};

type Msg = { key: string; error?: string; success?: string } | null;

export function MissionBoard({
  missions,
  inviteUrl,
  referralCount,
}: {
  missions: MissionView[];
  inviteUrl: string;
  referralCount: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<Msg>(null);
  const [copied, setCopied] = useState(false);
  const [proofFor, setProofFor] = useState<MissionView | null>(null);
  const [proof, setProof] = useState("");

  function claim(key: string) {
    startTransition(async () => {
      const res = await claimMissionAction(key);
      setMsg({ key, ...res });
      router.refresh();
    });
  }

  function sendProof() {
    if (!proofFor) return;
    const key = proofFor.key;
    startTransition(async () => {
      const res = await submitProofAction(key, proof);
      if (res.success) {
        setProofFor(null);
        setProof("");
        router.refresh();
      }
      setMsg({ key, ...res });
    });
  }

  async function shareInvite() {
    try {
      await navigator.clipboard?.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — share sheet below still works */
    }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Win-Win Back — Hoàn tiền mua sắm",
          text: "Mua sắm hoàn tiền cùng mình trên Win-Win Back nhé:",
          url: inviteUrl,
        });
      } catch {
        /* user dismissed */
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* Referral / invite card */}
      <section className="ww-dashboard-link-banner relative overflow-hidden rounded-xl px-5 py-6 text-white shadow-[0_8px_24px_rgba(9,54,95,0.14)] sm:px-7">
        <div className="relative z-10 max-w-[42rem]">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Gift className="h-5 w-5 text-[#d7fb76]" /> Mời bạn — nhận thưởng
          </h2>
          <p className="mt-1 text-sm text-white/75">
            Chia sẻ link giới thiệu của bạn. Mỗi bạn đăng ký giúp bạn tiến gần
            hơn tới phần thưởng. Bạn đã mời được{" "}
            <b className="text-[#d7fb76]">{referralCount}</b> người.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={inviteUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 truncate rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50"
            />
            <Button
              variant="cta"
              onClick={shareInvite}
              className="h-auto shrink-0 gap-1.5 rounded-lg px-4 py-2 font-bold"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Đã sao chép!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Sao chép & chia sẻ
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Mission grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {missions.map((m) => {
          const Icon = icons[m.icon] ?? Gift;
          return (
            <div
              key={m.key}
              className="flex flex-col rounded-xl border border-[#e8eef6] bg-white p-4 shadow-[0_2px_8px_rgba(9,54,95,0.05)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef7e2] text-[#3f8a2e]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-5 text-[#0d315d]">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#6681a7]">
                    {m.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#eafbe0] px-2 py-1 text-xs font-black text-[#3f8a2e]">
                  +{formatVnd(m.reward)}
                </span>
              </div>

              {/* Referral progress bar */}
              {m.progress && m.state !== "approved" && (
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#eef2f8]">
                    <div
                      className="h-full rounded-full bg-[#9ddd5d]"
                      style={{
                        width: `${Math.min(100, (m.progress.current / m.progress.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-[#6681a7]">
                    {m.progress.current}/{m.progress.target} bạn
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                {renderAction(m, { pending, claim, openProof: setProofFor })}
              </div>

              {msg?.key === m.key && msg.error && (
                <p className="mt-2 text-xs text-red-600">{msg.error}</p>
              )}
              {msg?.key === m.key && msg.success && (
                <p className="mt-2 text-xs font-medium text-[#2f7a1c]">
                  {msg.success}
                </p>
              )}
              {m.state === "rejected" && m.adminNote && (
                <p className="mt-2 text-xs text-[#b7791f]">
                  Lý do từ chối: {m.adminNote}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* Proof submission dialog */}
      <Dialog.Root
        open={proofFor !== null}
        onOpenChange={(next) => {
          if (!next) {
            setProofFor(null);
            setProof("");
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(9,54,95,0.28)]">
            <Dialog.Title className="text-lg font-black tracking-tight text-[#0d315d]">
              {proofFor?.title}
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm leading-6 text-[#6681a7]">
              {proofFor?.proofHint ?? "Dán link/bằng chứng để admin duyệt."}
            </Dialog.Description>
            <input
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="https://..."
              className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#9ddd5d]"
            />
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="cta"
                disabled={pending}
                onClick={sendProof}
                className="h-auto w-full rounded-xl px-4 py-2.5 font-bold"
              >
                {pending ? "Đang gửi…" : "Gửi để duyệt"}
              </Button>
              <Dialog.Close
                render={
                  <Button
                    variant="ghost"
                    className="h-auto w-full rounded-xl px-4 py-2.5 text-[#6681a7]"
                  />
                }
              >
                Để sau
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function renderAction(
  m: MissionView,
  {
    pending,
    claim,
    openProof,
  }: {
    pending: boolean;
    claim: (key: string) => void;
    openProof: (m: MissionView) => void;
  },
) {
  switch (m.state) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8eb] px-3 py-1.5 text-xs font-bold text-[#168146]">
          <CircleCheck className="h-4 w-4" /> Đã nhận thưởng
        </span>
      );
    case "submitted":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff3dc] px-3 py-1.5 text-xs font-bold text-[#b7791f]">
          <Clock className="h-4 w-4" /> Đang chờ duyệt
        </span>
      );
    case "claimable":
      return (
        <Button
          variant="cta"
          disabled={pending}
          onClick={() => claim(m.key)}
          className="h-auto gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
        >
          <Gift className="h-4 w-4" /> Nhận thưởng
        </Button>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6681a7]">
          Mời thêm bạn để mở khoá thưởng
        </span>
      );
    case "available":
    case "rejected":
      return (
        <Button
          variant="outline"
          onClick={() => openProof(m)}
          className="h-auto gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-[#0d315d]"
        >
          <Share2 className="h-4 w-4" />
          {m.state === "rejected" ? "Gửi lại" : "Gửi bằng chứng"}
        </Button>
      );
    case "locked":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2f8] px-3 py-1.5 text-xs font-bold text-[#6b83a6]">
          <Lock className="h-4 w-4" /> Chưa hoàn thành
        </span>
      );
  }
}
