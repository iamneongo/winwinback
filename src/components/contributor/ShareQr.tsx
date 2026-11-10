"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareQr({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Không sao chép tự động được. Hãy chọn và sao chép đường dẫn bên dưới.");
    }
  }

  function download() {
    const svg = document.getElementById("contributor-share-qr");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "winwinback-qr.svg";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  return <div className="grid gap-5 rounded-xl border border-[#dce8f5] bg-white p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
    <div className="flex justify-center rounded-xl bg-white p-3"><QRCodeSVG id="contributor-share-qr" value={url} size={220} marginSize={1} fgColor="#0d315d" title={`Mã QR dẫn đến ${title}`} /></div>
    <div className="min-w-0"><h2 className="text-lg font-bold">Link và mã QR của bạn</h2><p className="mt-1 text-sm text-[#58749a]">Cả hai đều dẫn khách đến bài viết trên Win-Win Back và ghi nhận lượt truy cập.</p><input readOnly aria-label="Link theo dõi" value={url} onFocus={(event) => event.currentTarget.select()} className="mt-4 w-full rounded-lg border border-[#dce8f5] bg-[#f8fbff] px-3 py-2.5 text-sm" /><div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="cta" onClick={() => void copy()}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Đã sao chép" : "Sao chép link"}</Button><Button type="button" variant="outline" onClick={download}><Download data-icon="inline-start" />Tải mã QR</Button></div>{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</div>
  </div>;
}
