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
import { Check, ExternalLink, ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import { saveArticleContentAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  initialTitle,
  initialDescription,
  initialCategory,
  initialImageUrl,
}: {
  id: string;
  slug: string;
  initialHtml: string;
  initialTitle: string;
  initialDescription: string;
  initialCategory: string;
  initialImageUrl: string;
}) {
  const [html, setHtml] = useState(initialHtml);
  const [title, setTitle] = useState(initialTitle);
  const [metaDescription, setMetaDescription] = useState(initialDescription);
  const [category, setCategory] = useState(initialCategory);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [error, setError] = useState("");
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
    setError("");
    startTransition(async () => {
      try {
        const result = await saveArticleContentAction(id, {
          html, title, metaDescription, category, imageUrl,
        });
        if (!result.ok) {
          setError(result.error ?? "Không lưu được bài viết.");
          return;
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch {
        setError("Không lưu được bài viết. Vui lòng thử lại.");
      }
    });
  }

  async function selectCover(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp ảnh.");
      return;
    }
    try {
      setError("");
      setImageUrl(await compressImageToDataUrl(file, 1200, 160_000));
      setSaved(false);
    } catch {
      setError("Ảnh không xử lý được hoặc quá lớn. Vui lòng chọn ảnh khác.");
    }
  }

  const coverSrc = imageUrl.startsWith("data:") || imageUrl.startsWith("/")
    ? imageUrl
    : imageUrl ? `/api/img?url=${encodeURIComponent(imageUrl)}` : "";

  return (
    <div className="space-y-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href={`/bai-viet/${slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#1261ed] hover:underline"
        >
          Xem bài <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Button
          type="button"
          variant="cta"
          onClick={save}
          disabled={pending}
          className="gap-1.5 px-4 text-sm font-bold text-[#173b5e]"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {pending ? "Đang lưu…" : saved ? "Đã lưu" : "Lưu bài viết"}
        </Button>
      </div>
      {error ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <section className="space-y-5 rounded-xl border border-[#dfe9f5] bg-white p-4 sm:p-6" aria-label="Thông tin bài viết và SEO">
        <div>
          <h2 className="text-lg font-black text-[#11335e]">Thông tin bài viết & SEO</h2>
          <p className="mt-1 text-sm text-[#58749a]">Tiêu đề và mô tả dùng cho trang bài viết, kết quả tìm kiếm và khi chia sẻ link.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-[#234568]" htmlFor="article-title">Tiêu đề bài viết</label>
            <Input id="article-title" value={title} onChange={(event) => { setTitle(event.target.value); setSaved(false); }} maxLength={180} className="-mt-2 h-10 border-[#cddced] text-sm focus-visible:border-[#1261ed]" />
            <p className="-mt-2 text-xs text-[#6681a7]">{title.length}/180 ký tự · Nên khoảng 50–65 ký tự. URL bài viết giữ nguyên để không gãy liên kết cũ.</p>
            <label className="block text-sm font-bold text-[#234568]" htmlFor="article-description">Mô tả SEO</label>
            <Textarea id="article-description" value={metaDescription} onChange={(event) => { setMetaDescription(event.target.value); setSaved(false); }} maxLength={300} rows={3} className="-mt-2 min-h-20 resize-y border-[#cddced] text-sm focus-visible:border-[#1261ed]" />
            <p className="-mt-2 text-xs text-[#6681a7]">{metaDescription.length}/300 ký tự · Nên khoảng 120–160 ký tự, mô tả đúng nội dung bài.</p>
            <label className="block text-sm font-bold text-[#234568]" htmlFor="article-category">Danh mục</label>
            <Input id="article-category" value={category} onChange={(event) => { setCategory(event.target.value); setSaved(false); }} maxLength={80} className="-mt-2 h-10 border-[#cddced] text-sm focus-visible:border-[#1261ed]" />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-[#234568]">Ảnh đại diện</p>
            <div className="aspect-[16/10] overflow-hidden rounded-lg border border-[#dfe9f5] bg-[#f0f5fa]">
              {coverSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverSrc} alt="Ảnh đại diện bài viết" className="h-full w-full object-cover" />
              ) : <div className="flex h-full items-center justify-center text-sm text-[#6681a7]">Chưa có ảnh</div>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#cddced] px-3 py-2 text-xs font-bold text-[#234568] hover:bg-[#f4f8fc]">
                <ImagePlus className="size-4" /> Tải ảnh mới
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => { void selectCover(event.target.files?.[0]); event.target.value = ""; }} />
              </label>
              {imageUrl ? <Button type="button" variant="ghost" onClick={() => { setImageUrl(""); setSaved(false); }} className="h-9 gap-1 px-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="size-4" /> Xóa ảnh</Button> : null}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6681a7]">Ảnh tự nén thành JPEG; dùng ở trang Tin tức và ảnh chia sẻ. Ảnh trong nội dung bài viết chỉnh riêng bên dưới.</p>
          </div>
        </div>
        <div className="min-w-0 rounded-lg bg-[#f4f8fc] p-3 text-sm">
          <p className="truncate text-[#1261ed]">winwinback.com/bai-viet/{slug}</p>
          <p className="mt-1 line-clamp-2 font-bold text-[#11335e]">{title || "Tiêu đề bài viết"}</p>
          <p className="mt-1 line-clamp-2 text-[#58749a]">{metaDescription || "Mô tả hiển thị trên kết quả tìm kiếm…"}</p>
        </div>
      </section>
      <h2 className="text-lg font-black text-[#11335e]">Nội dung bài viết</h2>
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
