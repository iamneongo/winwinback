"use client";

import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "./PwaProvider";

export const shortcutPrefix = "https://winwinback.com/share-target?text=";

export function InstallActions() {
  const { prompt, installed, clearPrompt } = usePwaInstall();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function install() {
    if (!prompt) return;
    setBusy(true);
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      setMessage(result.outcome === "accepted" ? "Trình duyệt đang cài ứng dụng. Khi hoàn tất, mở Win-Win Back để đăng nhập." : "Bạn có thể cài lại từ menu của Chrome bất cứ lúc nào.");
    } catch {
      setMessage("Hãy mở menu Chrome → Cài đặt ứng dụng / Thêm vào màn hình chính.");
    } finally {
      clearPrompt();
      setBusy(false);
    }
  }
  return <div className="mt-4 space-y-2">
    {installed ? <p className="font-medium text-[#315c13]">Bạn đang dùng Win-Win Back dưới dạng ứng dụng.</p> : prompt ? (
      <Button variant="cta" disabled={busy} onClick={install} className="h-auto min-h-11 whitespace-normal px-5 py-3">
        <Download className="size-4 shrink-0" />{busy ? "Đang mở trình cài đặt…" : "Cài Win-Win Back"}
      </Button>
    ) : <p className="text-sm leading-6">Chưa thấy nút cài đặt? Mở trang này bằng Chrome trên Android, chọn menu ⋮ → <strong>Cài đặt ứng dụng</strong> hoặc <strong>Thêm vào màn hình chính</strong>.</p>}
    <p role="status" className="text-sm leading-6">{message}</p>
  </div>;
}

export function ShortcutAddress() {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(shortcutPrefix);
      setMessage("Đã sao chép địa chỉ. Dán vào tác vụ Văn bản trong Phím tắt.");
    } catch {
      setMessage("Chạm giữ địa chỉ phía trên và chọn Sao chép.");
    }
  }
  return <div className="my-3 space-y-2">
    <code className="block select-all break-all rounded-lg bg-[#edf3fa] p-3 text-sm text-[#173861]">{shortcutPrefix}</code>
    <Button variant="outline" onClick={copy} className="min-h-11"><Copy className="size-4" />Sao chép địa chỉ</Button>
    <p role="status" className="text-sm leading-6 text-[#315c13]">{message}</p>
  </div>;
}
