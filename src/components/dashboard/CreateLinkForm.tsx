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
} from "lucide-react";
import { createLinkAction, type ActionState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="cta"
      disabled={pending}
      className="h-auto w-full gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 sm:w-auto"
    >
      {pending ? "Đang kiểm tra…" : "Kiểm tra hoàn tiền"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function CreateLinkForm({ defaultUrl }: { defaultUrl?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(
    createLinkAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  // Track the last dismissed action-state by identity. Each submit produces a
  // new state object, so a dialog auto-reopens on a *new* result without an
  // effect. One flag covers both the success and the "not eligible" dialogs.
  const [dismissed, setDismissed] = useState<ActionState>(undefined);
  const created = state?.link ?? null;
  const ineligible = state?.ineligible ?? null;
  const showSuccess = created !== null && state !== dismissed;
  const showIneligible = ineligible !== null && state !== dismissed;

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  function close() {
    setDismissed(state);
  }

  return (
    <>
      <form ref={formRef} action={action} className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-2 transition-colors focus-within:border-[#b7e961] sm:flex-row sm:items-center sm:px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link2 className="ml-1 h-4 w-4 flex-shrink-0 text-[#6b8290]" />
            <input
              name="url"
              type="url"
              required
              defaultValue={defaultUrl}
              placeholder="Dán link sản phẩm TikTok Shop hoặc Shopee…"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="w-full sm:w-auto">
            <SubmitButton />
          </div>
        </div>
        {state?.error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}
      </form>

      <Dialog.Root
        open={showSuccess}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 text-center shadow-[0_24px_60px_rgba(9,54,95,0.28)] transition duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eafbe0] text-[#3f8a2e]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <Dialog.Title className="mt-4 text-lg font-black tracking-tight text-[#0d315d]">
              Đã tạo link hoàn tiền!
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm leading-6 text-[#6681a7]">
              Chuyển đến {created?.platformName} để mua ngay. Đơn mua qua link
              này sẽ được hoàn tiền vào ví của bạn.
            </Dialog.Description>
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
