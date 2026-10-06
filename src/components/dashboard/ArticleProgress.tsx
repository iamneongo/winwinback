"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, LoaderCircle, Sparkles } from "lucide-react";
import { retryArticleAction } from "@/app/dashboard/actions";

export type Progress = {
  status: string | null;
  preview: string | null;
  slug: string | null;
  updatedAt: string | null;
};

const stageLabel: Record<string, string> = {
  queued: "Đang chuẩn bị bài viết…",
  fetching_product: "Đang lấy thông tin sản phẩm…",
  generating: "AI đang viết bài review…",
  published: "Bài viết đã sẵn sàng",
  failed: "Chưa tạo được bài viết",
};

export function ArticleProgress({ code, initial, allowRetry = false }: { code: string; initial?: Progress; allowRetry?: boolean }) {
  const [progress, setProgress] = useState<Progress>(initial ?? {
    status: "queued",
    preview: null,
    slug: null,
    updatedAt: null,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = async () => {
      try {
        const response = await fetch(`/api/articles/status/${encodeURIComponent(code)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Không đọc được trạng thái bài viết");
        const next = (await response.json()) as Progress;
        if (!active) return;
        setProgress(next);
        if (next.status !== "published" && next.status !== "failed") {
          timer = setTimeout(refresh, 1000);
        }
      } catch {
        if (active) timer = setTimeout(refresh, 3000);
      }
    };
    if (initial?.status !== "published" && initial?.status !== "failed") void refresh();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [code, initial?.status]);

  const articlePath = progress.slug
    ? `/bai-viet/${progress.slug}?ref=${encodeURIComponent(code)}`
    : null;
  const stalled =
    progress.status !== "published" &&
    progress.status !== "failed" &&
    progress.updatedAt &&
    Date.now() - new Date(progress.updatedAt).getTime() > 4 * 60_000;

  return (
    <section aria-live="polite" className="mt-5 border-t border-[#e5edf6] pt-5 text-left">
      <div className="flex items-start gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eef6ff] text-[#287be5]">
          {progress.status === "published" ? (
            <Check className="size-4" />
          ) : progress.status === "failed" || stalled ? (
            <Sparkles className="size-4" />
          ) : (
            <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-[#14375e]">
            {stalled ? "Bài viết đang bị gián đoạn" : stageLabel[progress.status ?? ""] ?? "AI đang chuẩn bị bài viết…"}
          </h3>
          <p className="mt-0.5 text-xs leading-5 text-[#58749a]">
            {progress.status === "failed" || stalled
              ? "Link hoàn tiền vẫn dùng được. Bạn có thể thử tạo bài lại trong Bài viết của bạn."
              : progress.status === "published"
                ? "Bạn có thể xem và chia sẻ bài viết gắn với link hoàn tiền của mình."
                : "Bạn có thể đóng cửa sổ; tiến độ vẫn được lưu trong Bài viết của bạn."}
          </p>
        </div>
      </div>
      {progress.preview && progress.status !== "failed" && (
        <div className="mt-3 max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[#f7faff] p-3 text-xs leading-5 text-[#34527d] sm:max-h-44">
          {progress.preview}
        </div>
      )}
      {articlePath && progress.status === "published" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={articlePath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-[#eaf9df] px-3 py-2 text-xs font-bold text-[#28711a] hover:bg-[#def3cc]">
            <ExternalLink className="size-3.5" /> Xem bài viết
          </Link>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(`${window.location.origin}${articlePath}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#dbe6f3] px-3 py-2 text-xs font-bold text-[#315a90] hover:bg-[#f4f8fe]"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Đã sao chép" : "Chia sẻ bài"}
          </button>
        </div>
      )}
      {allowRetry && (progress.status === "failed" || stalled) && (
        <form action={retryArticleAction} className="mt-3">
          <input type="hidden" name="code" value={code} />
          <button type="submit" className="rounded-lg border border-[#dbe6f3] px-3 py-2 text-xs font-bold text-[#315a90] hover:bg-[#f4f8fe]">
            Thử viết lại
          </button>
        </form>
      )}
    </section>
  );
}
