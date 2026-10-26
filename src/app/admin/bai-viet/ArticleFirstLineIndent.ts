import { Extension, type Editor } from "@tiptap/core";

/** Keep first-line indentation as a paragraph attribute so it survives HTML saves. */
export const ArticleFirstLineIndent = Extension.create({
  name: "articleFirstLineIndent",
  addGlobalAttributes() {
    return [{
      types: ["paragraph"],
      attributes: {
        firstLineIndent: {
          default: false,
          parseHTML: (element: HTMLElement) => element.style.textIndent.trim() === "2em",
          renderHTML: (attributes: { firstLineIndent?: boolean }) =>
            attributes.firstLineIndent ? { style: "text-indent: 2em" } : {},
        },
      },
    }];
  },
});

/** Apply to every selected paragraph; changing attributes never shifts node positions. */
export function setFirstLineIndent(editor: Editor, enabled: boolean): void {
  editor.chain().focus().command(({ state, tr }) => {
    let changed = false;
    state.doc.nodesBetween(state.selection.from, state.selection.to, (node, position) => {
      if (node.type.name !== "paragraph" || node.attrs.firstLineIndent === enabled) return;
      tr.setNodeMarkup(position, undefined, { ...node.attrs, firstLineIndent: enabled });
      changed = true;
    });
    return changed;
  }).run();
}
