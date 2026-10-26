import { Extension, type Editor } from "@tiptap/core";

export const MAX_FIRST_LINE_INDENT = 4;

function indentLevel(value: unknown): number {
  if (value === true) return 1; // Existing drafts stored this attribute as a boolean.
  return typeof value === "number" && Number.isInteger(value)
    ? Math.max(0, Math.min(MAX_FIRST_LINE_INDENT, value))
    : 0;
}

/** Keep first-line indentation as a paragraph attribute so it survives HTML saves. */
export const ArticleFirstLineIndent = Extension.create({
  name: "articleFirstLineIndent",
  addGlobalAttributes() {
    return [{
      types: ["paragraph"],
      attributes: {
        firstLineIndent: {
          default: 0,
          parseHTML: (element: HTMLElement) => {
            const match = /^([2468])em$/.exec(element.style.textIndent.trim());
            return match ? Number(match[1]) / 2 : 0;
          },
          renderHTML: (attributes: { firstLineIndent?: number | boolean }) => {
            const level = indentLevel(attributes.firstLineIndent);
            return level ? { style: `text-indent: ${level * 2}em` } : {};
          },
        },
      },
    }];
  },
});

/** Increase or decrease every selected paragraph without shifting node positions. */
export function changeFirstLineIndent(editor: Editor, direction: 1 | -1): void {
  editor.chain().focus().command(({ state, tr }) => {
    let changed = false;
    state.doc.nodesBetween(state.selection.from, state.selection.to, (node, position) => {
      if (node.type.name !== "paragraph") return;
      const current = indentLevel(node.attrs.firstLineIndent);
      const next = Math.max(0, Math.min(MAX_FIRST_LINE_INDENT, current + direction));
      if (current === next) return;
      tr.setNodeMarkup(position, undefined, { ...node.attrs, firstLineIndent: next });
      changed = true;
    });
    return changed;
  }).run();
}
