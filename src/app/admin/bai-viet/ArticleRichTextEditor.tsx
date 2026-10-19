"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { TableKit } from "@tiptap/extension-table";
import { EditorTools, ArticleImage } from "./EditorTools";
import { uploadArticleImage } from "./MediaPicker";
import { sanitizeArticleHtml } from "@/lib/articles/sanitize";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Highlighter,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline,
  Undo2,
  Unlink,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const extensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: { openOnClick: false, defaultProtocol: "https", autolink: true },
  }),
  TableKit.configure({ table: { resizable: true } }),
  ArticleImage.configure({
    allowBase64: true,
  }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  TextStyleKit,
  Highlight.configure({ multicolor: true }),
  Subscript,
  Superscript,
  Youtube.configure({ controls: true, nocookie: true, width: 640, height: 360, HTMLAttributes: { class: "article-video" } }),
  Placeholder.configure({ placeholder: "Bắt đầu soạn nội dung bài viết…" }),
];

function cleanPastedHtml(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("img").forEach((img) => {
    if (img.getAttribute("src")?.startsWith("data:")) img.remove();
  });
  return sanitizeArticleHtml(template.innerHTML);
}

function normalizeLegacyQuillHtml(html: string): string {
  const withoutQuillUi = html.replace(/<span\b(?=[^>]*\bclass=(['"])[^'"]*\bql-ui\b[^'"]*\1)[^>]*>[\s\S]*?<\/span>/gi, "");
  const styled = withoutQuillUi.replace(/<(p|h[1-6]|li|span)\b([^>]*)>/gi, (tag, _name: string, attributes: string) => {
    const classMatch = attributes.match(/\sclass=(['"])(.*?)\1/i);
    if (!classMatch) return tag;

    const classes = classMatch[2].split(/\s+/).filter(Boolean);
    const styles: string[] = [];
    const alignClass = classes.find((name) => /^ql-align-(center|right|justify)$/.test(name));
    const sizeClass = classes.find((name) => /^ql-size-(small|large|huge)$/.test(name));
    const indentClass = classes.find((name) => /^ql-indent-[1-8]$/.test(name));
    if (alignClass) styles.push(`text-align: ${alignClass.slice("ql-align-".length)}`);
    if (sizeClass) {
      const size = sizeClass.slice("ql-size-".length);
      styles.push(`font-size: ${size === "small" ? "0.78em" : size === "large" ? "1.5em" : "2.3em"}`);
    }
    if (indentClass) styles.push(`padding-left: ${Number(indentClass.slice("ql-indent-".length)) * 3}em`);

    const retainedClasses = classes.filter((name) => !/^ql-(?:align-(?:center|right|justify)|size-(?:small|large|huge)|indent-[1-8])$/.test(name));
    let nextAttributes = attributes.replace(classMatch[0], retainedClasses.length ? ` class="${retainedClasses.join(" ")}"` : "");
    if (styles.length) {
      const styleMatch = nextAttributes.match(/\sstyle=(['"])(.*?)\1/i);
      if (styleMatch) {
        nextAttributes = nextAttributes.replace(styleMatch[0], ` style="${styleMatch[2]}; ${styles.join("; ")}"`);
      } else {
        nextAttributes += ` style="${styles.join("; ")}"`;
      }
    }
    return `<${_name}${nextAttributes}>`;
  });

  const listsNormalized = styled.replace(/<ol\b([^>]*)>([\s\S]*?)<\/ol>/gi, (list, attributes: string, contents: string) => {
    const items = [...contents.matchAll(/<li\b([^>]*)>/gi)];
    const allBullets = items.length > 0 && items.every((item) => /\bdata-list=(['"])bullet\1/i.test(item[1]));
    const cleanContents = contents.replace(/\sdata-list=(['"])(?:bullet|ordered)\1/gi, "");
    return allBullets ? `<ul${attributes}>${cleanContents}</ul>` : `<ol${attributes}>${cleanContents}</ol>`;
  });
  return listsNormalized.replace(/<iframe\b(?=[^>]*\bclass=(['"])[^'"]*\bql-video\b[^'"]*\1)[^>]*>[\s\S]*?<\/iframe>/gi, (iframe) => {
    if (!/src=(['"])https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\//i.test(iframe)) return iframe;
    return `<div data-youtube-video>${iframe.replace(/\sclass=(['"])[^'"]*\bql-video\b[^'"]*\1/i, "")}</div>`;
  });
}

function ToolButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`size-8 shrink-0 border-transparent text-[#3f5c80] hover:border-[#d9e5f4] hover:bg-[#f4f8fd] ${active ? "border-[#c9dcf5] bg-[#eaf2ff] text-[#1261ed]" : ""}`}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-[#dfe8f3]" />;
}

export function ArticleRichTextEditor({
  initialHtml,
  onChange,
  onReady,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  onReady?: (editor: Editor) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [error, setError] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [textColor, setTextColor] = useState("#173b5e");
  const [highlightColor, setHighlightColor] = useState("#fff2a8");
  const openImagePicker = useCallback(() => imageInputRef.current?.click(), []);
  const normalizedHtml = useMemo(() => normalizeLegacyQuillHtml(initialHtml).replace(/<(\/?)h1\b/gi, "<$1h2"), [initialHtml]);
  const initialWordCount = normalizedHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
  const editor = useEditor({
    extensions,
    content: normalizedHtml,
    immediatelyRender: false,
    editorProps: {
      attributes: { id: "content", "aria-label": "Nội dung bài viết" },
      transformPastedHTML: cleanPastedHtml,
      handlePaste: (view, event) => {
        const image = Array.from(event.clipboardData?.files ?? []).find((file) => file.type.startsWith("image/"));
        if (!image) return false;
        const position = view.state.selection.from;
        setError("");
        void uploadArticleImage(image).then(({ url }) => {
          editorRef.current?.chain().focus().insertContentAt(position, {
            type: "image",
            attrs: { src: url, alt: image.name.replace(/\.[^.]+$/, "") || "Ảnh bài viết" },
          }).run();
        }).catch(() => setError("Ảnh dán không xử lý được hoặc quá lớn. Vui lòng chọn ảnh khác."));
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      setHasChanged(true);
      onChange(current.getHTML());
    },
  });
  useEffect(() => {
    editorRef.current = editor;
    if (editor) onReady?.(editor);
    return () => { editorRef.current = null; };
  }, [editor, onReady]);
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      underline: current?.isActive("underline") ?? false,
      strike: current?.isActive("strike") ?? false,
      highlight: current?.isActive("highlight") ?? false,
      subscript: current?.isActive("subscript") ?? false,
      superscript: current?.isActive("superscript") ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      blockquote: current?.isActive("blockquote") ?? false,
      codeBlock: current?.isActive("codeBlock") ?? false,
      link: current?.isActive("link") ?? false,
      h1: current?.isActive("heading", { level: 1 }) ?? false,
      h2: current?.isActive("heading", { level: 2 }) ?? false,
      h3: current?.isActive("heading", { level: 3 }) ?? false,
      h4: current?.isActive("heading", { level: 4 }) ?? false,
      textAlign: current?.getAttributes("paragraph").textAlign ?? current?.getAttributes("heading").textAlign ?? "left",
      fontSize: current?.getAttributes("textStyle").fontSize ?? "16px",
      wordCount: current?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0,
    }),
  });
  const state = toolbarState ?? {
    bold: false, italic: false, underline: false, strike: false, highlight: false,
    subscript: false, superscript: false, bulletList: false, orderedList: false,
    blockquote: false, codeBlock: false, link: false, h1: false, h2: false, h3: false, h4: false,
    textAlign: "left", fontSize: "16px", wordCount: 0,
  };
  const blockSelection = state.h1 ? "h1" : state.h2 ? "h2" : state.h3 ? "h3" : state.h4 ? "h4" : "paragraph";
  const blockLabels: Record<string, string> = {
    paragraph: "Đoạn văn",
    h1: "Tiêu đề chính",
    h2: "Tiêu đề 2",
    h3: "Tiêu đề 3",
    h4: "Tiêu đề 4",
  };
  const fontSizeSelection = ["13px", "16px", "20px", "28px"].includes(state.fontSize) ? state.fontSize : "custom";
  const fontSizeLabels: Record<string, string> = {
    custom: "Tùy chỉnh",
    "13px": "Nhỏ",
    "16px": "Thường",
    "20px": "Lớn",
    "28px": "Rất lớn",
  };

  const addImage = useCallback(async (file: File | undefined) => {
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp ảnh.");
      return;
    }
    try {
      setError("");
      const { url: src } = await uploadArticleImage(file);
      editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch {
      setError("Ảnh không xử lý được hoặc quá lớn. Vui lòng chọn ảnh khác.");
    }
  }, [editor]);

  if (!editor) {
    return <div className="min-h-[55vh] animate-pulse rounded-xl bg-[#f4f8fc]" aria-label="Đang tải trình soạn thảo" />;
  }

  const command = (run: () => void) => () => run();
  const active = (key: keyof typeof state) => Boolean(state[key]);

  return (
    <div className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e5edf6] bg-[#f8fbff] p-2" role="toolbar" aria-label="Định dạng nội dung bài viết">
        <Select
          value={blockSelection}
          onValueChange={(value) => {
            if (!value) return;
            const chain = editor.chain().focus();
            if (value === "paragraph") chain.setParagraph().run();
            else chain.toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 }).run();
          }}
        >
          <SelectTrigger aria-label="Kiểu đoạn văn" className="h-8 w-36 border-[#dbe6f3] bg-white text-xs">
            <SelectValue>{blockLabels[blockSelection]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Đoạn văn</SelectItem>
            <SelectItem value="h2">Tiêu đề 2</SelectItem>
            <SelectItem value="h3">Tiêu đề 3</SelectItem>
            <SelectItem value="h4">Tiêu đề 4</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fontSizeSelection} onValueChange={(value) => { if (value && value !== "custom") editor.chain().focus().setFontSize(value).run(); }}>
          <SelectTrigger aria-label="Cỡ chữ" className="h-8 w-24 border-[#dbe6f3] bg-white text-xs"><SelectValue>{fontSizeLabels[fontSizeSelection]}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="custom" disabled>Tùy chỉnh</SelectItem>
            <SelectItem value="13px">Nhỏ</SelectItem>
            <SelectItem value="16px">Thường</SelectItem>
            <SelectItem value="20px">Lớn</SelectItem>
            <SelectItem value="28px">Rất lớn</SelectItem>
          </SelectContent>
        </Select>
        <ToolbarDivider />
        <ToolButton label="In đậm" active={active("bold")} onClick={command(() => editor.chain().focus().toggleBold().run())}><Bold className="size-4" /></ToolButton>
        <ToolButton label="In nghiêng" active={active("italic")} onClick={command(() => editor.chain().focus().toggleItalic().run())}><Italic className="size-4" /></ToolButton>
        <ToolButton label="Gạch chân" active={active("underline")} onClick={command(() => editor.chain().focus().toggleUnderline().run())}><Underline className="size-4" /></ToolButton>
        <ToolButton label="Gạch ngang" active={active("strike")} onClick={command(() => editor.chain().focus().toggleStrike().run())}><Strikethrough className="size-4" /></ToolButton>
        <ToolButton label="Chỉ số dưới" active={active("subscript")} onClick={command(() => editor.chain().focus().toggleSubscript().run())}><SubscriptIcon className="size-4" /></ToolButton>
        <ToolButton label="Chỉ số trên" active={active("superscript")} onClick={command(() => editor.chain().focus().toggleSuperscript().run())}><SuperscriptIcon className="size-4" /></ToolButton>
        <label className="grid size-8 cursor-pointer place-items-center rounded-md text-[#3f5c80] hover:bg-[#f4f8fd]" title="Màu chữ">
          <input aria-label="Màu chữ" type="color" value={textColor} className="absolute size-px opacity-0" onChange={(event) => { setTextColor(event.target.value); editor.chain().focus().setColor(event.target.value).run(); }} />
          <span className="relative grid place-items-center"><span className="text-sm font-black">A</span><span className="absolute -bottom-1 h-1 w-4 rounded" style={{ backgroundColor: textColor }} /></span>
        </label>
        <label className="grid size-8 cursor-pointer place-items-center rounded-md text-[#3f5c80] hover:bg-[#f4f8fd]" title="Tô sáng">
          <input aria-label="Màu tô sáng" type="color" value={highlightColor} className="absolute size-px opacity-0" onChange={(event) => { setHighlightColor(event.target.value); editor.chain().focus().setHighlight({ color: event.target.value }).run(); }} />
          <Highlighter className="size-4" style={{ color: highlightColor }} />
        </label>
        <ToolButton label="Xóa tô sáng" onClick={command(() => editor.chain().focus().unsetHighlight().run())}><span className="text-[10px] font-bold">Tô xóa</span></ToolButton>
        <ToolbarDivider />
        <ToolButton label="Danh sách dấu đầu dòng" active={active("bulletList")} onClick={command(() => editor.chain().focus().toggleBulletList().run())}><List className="size-4" /></ToolButton>
        <ToolButton label="Danh sách đánh số" active={active("orderedList")} onClick={command(() => editor.chain().focus().toggleOrderedList().run())}><ListOrdered className="size-4" /></ToolButton>
        <ToolButton label="Căn trái" active={state.textAlign === "left"} onClick={command(() => editor.chain().focus().setTextAlign("left").run())}><AlignLeft className="size-4" /></ToolButton>
        <ToolButton label="Căn giữa" active={state.textAlign === "center"} onClick={command(() => editor.chain().focus().setTextAlign("center").run())}><AlignCenter className="size-4" /></ToolButton>
        <ToolButton label="Căn phải" active={state.textAlign === "right"} onClick={command(() => editor.chain().focus().setTextAlign("right").run())}><AlignRight className="size-4" /></ToolButton>
        <ToolButton label="Trích dẫn" active={active("blockquote")} onClick={command(() => editor.chain().focus().toggleBlockquote().run())}><Quote className="size-4" /></ToolButton>
        <ToolButton label="Khối mã" active={active("codeBlock")} onClick={command(() => editor.chain().focus().toggleCodeBlock().run())}><Code2 className="size-4" /></ToolButton>
        <ToolButton label="Đường kẻ ngang" onClick={command(() => editor.chain().focus().setHorizontalRule().run())}><Minus className="size-4" /></ToolButton>
        <ToolbarDivider />
        <ToolButton label="Gỡ liên kết" disabled={!active("link")} onClick={command(() => editor.chain().focus().unsetLink().run())}><Unlink className="size-4" /></ToolButton>
        <ToolButton label="Chèn ảnh" onClick={openImagePicker}><ImagePlus className="size-4" /></ToolButton>
        <input ref={imageInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => { void addImage(event.target.files?.[0]); event.target.value = ""; }} />
        <ToolButton label="Nhúng video YouTube" onClick={command(() => {
          const src = window.prompt("Dán đường dẫn video YouTube:");
          if (src?.trim()) editor.chain().focus().setYoutubeVideo({ src: src.trim() }).run();
        })}><Video className="size-4" /></ToolButton>
        <ToolbarDivider />
        <ToolButton label="Hoàn tác" disabled={!editor.can().undo()} onClick={command(() => editor.chain().focus().undo().run())}><Undo2 className="size-4" /></ToolButton>
        <ToolButton label="Làm lại" disabled={!editor.can().redo()} onClick={command(() => editor.chain().focus().redo().run())}><Redo2 className="size-4" /></ToolButton>
        <ToolButton label="Xóa định dạng" onClick={command(() => editor.chain().focus().unsetAllMarks().clearNodes().run())}><RemoveFormatting className="size-4" /></ToolButton>
      </div>
      <EditorTools editor={editor} />
      <EditorContent editor={editor} className="article-editor-content" />
      {error ? <p role="alert" className="border-t border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5edf6] bg-[#fbfdff] px-4 py-2 text-xs text-[#587298]">
        <p>Chọn văn bản để định dạng hoặc dùng AI · Chọn ảnh để chỉnh thông tin</p>
        <p aria-live="polite">{hasChanged ? state.wordCount : initialWordCount} từ</p>
      </div>
    </div>
  );
}
