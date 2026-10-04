"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Check, ExternalLink, Loader2, Save } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import { saveArticleContentAction } from "./actions";

// react-quill-new touches `document`, so it must be client-only. Wrap it in a
// forwardRef so we can reach the Quill instance for the image handler.
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const Wrapped = forwardRef<
      InstanceType<typeof RQ>,
      React.ComponentProps<typeof RQ>
    >(function Wrapped(props, ref) {
      return <RQ ref={ref} {...props} />;
    });
    return Wrapped;
  },
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-sm text-[#6681a7]">Đang tải trình soạn thảo…</div>
    ),
  },
);

interface QuillLike {
  getSelection: (focus?: boolean) => { index: number } | null;
  insertEmbed: (index: number, type: string, value: string, source?: string) => void;
}
interface QuillHost {
  getEditor: () => QuillLike;
}

/**
 * Downscale + compress an image to a JPEG data URL so pasted/large photos don't
 * produce an oversized base64 string (which can break storage/rendering).
 */
async function compressImageToDataUrl(
  file: File,
  maxDim = 1600,
  maxBytes = 700_000,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let out = canvas.toDataURL("image/jpeg", quality);
  // base64 length ≈ 1.37 × byte size; shrink quality until under the cap.
  while (out.length > maxBytes * 1.37 && quality > 0.35) {
    quality -= 0.1;
    out = canvas.toDataURL("image/jpeg", quality);
  }
  if (out.length > maxBytes * 1.37 * 2) {
    throw new Error("image too large");
  }
  return out;
}

export function ArticleEditor({
  id,
  slug,
  initialHtml,
}: {
  id: string;
  slug: string;
  initialHtml: string;
}) {
  const [html, setHtml] = useState(initialHtml);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const quillRef = useRef<QuillHost | null>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await compressImageToDataUrl(file);
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        editor.insertEmbed(range ? range.index : 0, "image", url, "user");
      } catch {
        window.alert(
          "Không xử lý được ảnh này (ảnh lỗi hoặc quá lớn kể cả sau khi nén). Vui lòng thử ảnh khác hoặc ảnh nhẹ hơn.",
        );
      }
    };
    input.click();
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler],
  );

  function save() {
    startTransition(async () => {
      await saveArticleContentAction(id, html);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href={`/bai-viet/${slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#1261ed] hover:underline"
        >
          Xem bài <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#b7e961] px-4 py-2 text-sm font-bold text-[#173b5e] transition hover:bg-[#a9e75e] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {pending ? "Đang lưu…" : saved ? "Đã lưu" : "Lưu bài viết"}
        </button>
      </div>
      <div className="rounded-xl border border-[#dfe9f5] bg-white [&_.ql-container]:min-h-[55vh] [&_.ql-container]:text-[15px] [&_.ql-editor]:leading-7">
        <ReactQuill
          ref={quillRef as never}
          theme="snow"
          value={html}
          onChange={setHtml}
          modules={modules}
        />
      </div>
      <p className="mt-2 text-xs text-[#7790b1]">
        Ảnh chèn vào sẽ được tự động nén để không làm bài viết quá nặng.
      </p>
    </div>
  );
}
