"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Dialog } from "@base-ui/react/dialog";
import {
  Link2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  PackageX,
  Share2,
  Check,
  ClipboardPaste,
  ClipboardX,
  X,
} from "lucide-react";
import { createLinkAction, type ActionState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { ArticleProgress } from "@/components/dashboard/ArticleProgress";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="cta"
      disabled={pending}
      className="h-auto min-h-12 w-full gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 sm:min-h-0 sm:w-auto"
    >
      {pending ? "Đang kiểm tra…" : "Kiểm tra hoàn tiền"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function CreateLinkForm({ defaultUrl, autoIntent }: { defaultUrl?: string; autoIntent?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    createLinkAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const autoSubmitted = useRef(false);
  // Track the last dismissed action-state by identity. Each submit produces a
  // new state object, so a dialog auto-reopens on a *new* result without an
  // effect. One flag covers both the success and the "not eligible" dialogs.
  const [dismissed, setDismissed] = useState<ActionState>(undefined);
  const created = state?.link ?? null;
  const ineligible = state?.ineligible ?? null;
  const showSuccess = created !== null && state !== dismissed;
  const showIneligible = ineligible !== null && state !== dismissed;
  // Transient "Đã sao chép" feedback on the share button.
  const [copied, setCopied] = useState(false);
  const [urlValue, setUrlValue] = useState(defaultUrl ?? "");
  const [pasteNotice, setPasteNotice] = useState<{ id: number; title: string; message: string } | null>(null);
  const [noticeClosing, setNoticeClosing] = useState(false);
  const noticeId = useRef(0);

  const inputValue = state?.success && state !== dismissed ? "" : urlValue;

  function showPasteNotice(title: string, message: string) {
    setNoticeClosing(false);
    setPasteNotice({ id: ++noticeId.current, title, message });
  }

  async function pasteLink() {
    try {
      const pasted = await navigator.clipboard.readText();
      if (!pasted.trim()) {
        showPasteNotice("Chưa có link để dán", "Clipboard đang trống. Hãy sao chép link sản phẩm trước nhé.");
        return;
      }
      setUrlValue(pasted.trim());
      setPasteNotice(null);
    } catch {
      showPasteNotice("Không thể dán tự động", "Không thể đọc clipboard. Hãy dán link vào ô nhập.");
    }
  }

  useEffect(() => {
    if (!pasteNotice) return;
    const exitTimer = window.setTimeout(() => setNoticeClosing(true), 4500);
    const removeTimer = window.setTimeout(() => setPasteNotice(null), 4700);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [pasteNotice]);

  useEffect(() => {
    if (!defaultUrl || !autoIntent || autoSubmitted.current || !/^[\da-f-]{36}$/i.test(autoIntent)) return;
    autoSubmitted.current = true;
    const key = `winwin-link-intent:${autoIntent}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "used");
    } catch {
      // Storage can be unavailable in private browsing; the in-memory guard remains.
    }
    // A refresh must not create the same affiliate link again.
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("intent");
    window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    formRef.current?.requestSubmit();
  }, [autoIntent, defaultUrl]);

  function close() {
    setDismissed(state);
    if (state?.success) setUrlValue("");
  }

  /**
   * Share the affiliate link so a purchase by anyone through it earns the user.
   * Copies the absolute URL to the clipboard first (always works), then opens
   * the native share sheet when the browser supports it.
   */
  async function shareLink() {
    if (!created) return;
    const url = `${window.location.origin}${created.goPath}`;
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked (insecure context / permissions) — the share
      // sheet below still gives the user a way to send the link.
    }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Ưu đãi hoàn tiền trên ${created.platformName}`,
          text: "Mua qua link này để được hoàn tiền cùng Win-Win Back:",
          url,
        });
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    }
  }

  return (
    <>
      <form ref={formRef} action={action} className="space-y-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:rounded-2xl sm:border sm:border-[#dce9ef] sm:bg-[#fbfdff] sm:p-2 sm:pl-3 sm:transition-colors sm:focus-within:border-[#9bdc55]">
          <div className="flex min-w-0 w-full flex-1 items-center gap-2 rounded-xl border border-[#dce9ef] bg-[#fbfdff] px-3 py-3 transition-colors focus-within:border-[#9bdc55] sm:w-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <Link2 className="size-4 shrink-0 text-[#6b8290]" />
            <input
              name="url"
              type="url"
              required
              aria-label="Link sản phẩm Shopee hoặc TikTok Shop"
              value={inputValue}
              onChange={(event) => {
                if (state?.success) setDismissed(state);
                setUrlValue(event.target.value);
                setPasteNotice(null);
              }}
              placeholder="Dán link sản phẩm..."
              className="min-w-0 w-full flex-1 truncate bg-transparent text-base text-[#0a3151] outline-none placeholder:text-[#536d83] sm:py-1.5 sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-auto">
            {inputValue.trim() ? (
              <SubmitButton />
            ) : (
              <Button
                type="button"
                variant="cta"
                onClick={pasteLink}
                className="h-auto min-h-12 w-full gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 sm:min-h-0 sm:w-auto"
              >
                <ClipboardPaste className="h-4 w-4" />
                Dán nhanh
              </Button>
            )}
          </div>
        </div>
        {state?.error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}
      </form>
      {pasteNotice && (
        <div
          key={pasteNotice.id}
          role="alert"
          className={`ww-clipboard-notice fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex w-[min(25rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-[#dcead5] bg-white px-4 py-3 text-[#0d315d] shadow-[0_4px_8px_rgba(20,67,81,0.14)] lg:bottom-6 ${noticeClosing ? "ww-clipboard-notice--closing" : ""}`}
        >
          <span className="ww-clipboard-notice-icon grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf9dc] text-[#188437]" aria-hidden="true">
            <ClipboardX className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{pasteNotice.title}</p>
            <p className="mt-0.5 text-sm leading-5 text-[#315674]">{pasteNotice.message}</p>
          </div>
          <button type="button" onClick={() => setPasteNotice(null)} aria-label="Đóng thông báo" className="grid size-8 shrink-0 place-items-center rounded-lg text-[#56728e] transition-colors hover:bg-[#f0f7f7] hover:text-[#0d315d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#188437]">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
      <Dialog.Root
        open={showSuccess}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 text-center shadow-[0_24px_60px_rgba(9,54,95,0.28)] transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eafbe0] text-[#3f8a2e]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <Dialog.Title className="mt-4 text-lg font-black tracking-tight text-[#0d315d]">
              Đã tạo link hoàn tiền!
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm leading-6 text-[#6681a7]">
              Mua để tự nhận hoàn tiền, hoặc chia sẻ link cho bạn bè — có đơn
              phát sinh qua link là bạn nhận tiền.
            </Dialog.Description>
            {created?.estimatedCashback ? (
              <div className="mt-4 rounded-xl border border-[#d8f0bd] bg-[#f3fbe9] px-4 py-3 text-left">
                <p className="text-xs font-medium text-[#4a7a2e]">
                  Hoàn tiền dự kiến cho đơn này
                </p>
                <p className="mt-0.5 text-2xl font-black tracking-tight text-[#2f7d1e]">
                  ~{created.estimatedCashback.toLocaleString("vi-VN")}
                  {created.estimatedCashbackMax &&
                  created.estimatedCashbackMax !== created.estimatedCashback
                    ? ` – ${created.estimatedCashbackMax.toLocaleString("vi-VN")}`
                    : ""}
                  ₫
                </p>
                <p className="mt-1 text-[11px] leading-4 text-[#6a8c53]">
                  Ước tính theo hoa hồng sản phẩm; có thể thay đổi theo giá /
                  khuyến mãi khi đặt hàng.
                </p>
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant="cta"
                nativeButton={false}
                className="h-auto w-full gap-1.5 rounded-xl px-4 py-2.5 font-bold"
                render={
                  <a
                    href={created?.goPath ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                  />
                }
              >
                <ShoppingBag className="h-4 w-4" />
                Mua ngay trên {created?.platformName}
              </Button>
              <Button
                variant="outline"
                onClick={shareLink}
                className="h-auto w-full gap-1.5 rounded-xl px-4 py-2.5 font-bold text-[#0d315d]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#3f8a2e]" />
                    Đã sao chép link!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Chia sẻ link kiếm tiền
                  </>
                )}
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
            {created?.articleCode ? (
              <ArticleProgress key={created.articleCode} code={created.articleCode} showFullArticle />
            ) : (
              <p className="mt-4 border-t border-[#e5edf6] pt-4 text-left text-xs leading-5 text-[#58749a]">
                Chưa đủ thông tin sản phẩm để tạo bài viết cho link này.
              </p>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={showIneligible}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 text-center shadow-[0_24px_60px_rgba(9,54,95,0.28)] transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff2e2] text-[#e08a1e]">
              <PackageX className="h-6 w-6" />
            </div>
            <Dialog.Title className="mt-4 text-lg font-black tracking-tight text-[#0d315d]">
              Sản phẩm chưa thuộc diện hoàn tiền
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm leading-6 text-[#6681a7]">
              Sản phẩm này trên {ineligible?.platformName} hiện không tham gia
              chương trình tiếp thị liên kết nên chưa thể tạo link hoàn tiền. Bạn
              hãy thử một sản phẩm khác nhé.
            </Dialog.Description>
            <div className="mt-5">
              <Dialog.Close
                render={
                  <Button
                    variant="cta"
                    className="h-auto w-full rounded-xl px-4 py-2.5 font-bold"
                  />
                }
              >
                Đã hiểu
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
