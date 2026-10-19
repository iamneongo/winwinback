import sanitizeHtml from "sanitize-html";
const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
    "sub", "sup", "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "span", "div", "pre", "code", "hr", "iframe", "mark",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    td: ["colspan", "rowspan", "colwidth", "style"],
    th: ["colspan", "rowspan", "colwidth", "scope", "style"],
    figure: ["data-align"],
    img: ["src", "alt", "title", "width", "height", "style"],
    // Quill video embeds (e.g. YouTube) render as an <iframe>.
    iframe: [
      "src", "width", "height", "frameborder", "allowfullscreen", "allow", "class", "style",
    ],
    "*": ["style", "class"],
  },
  // data: is only allowed for <img> (admin-pasted base64), never for links.
  // iframes (embedded video) must be https — no data:/http:.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"], iframe: ["https"] },
  allowProtocolRelative: false,
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/], "color": [/^#[0-9a-f]{3,8}$/i, /^rgb\([\d\s,]+\)$/], "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\([\d\s,]+\)$/], "font-size": [/^\d+(?:\.\d+)?(?:px|em|rem)$/], "width": [/^\d+(?:px|%)$/], "height": [/^\d+px$/], "padding-left": [/^\d+(?:px|em)$/] } },
  transformTags: {
    h1: "h2",
    a: (_tag, attrs) => ({ tagName: "a", attribs: { ...attrs, ...(attrs.target === "_blank" ? { rel: Array.from(new Set(`${attrs.rel || ""} noopener noreferrer`.split(/\s+/))).join(" ") } : {}) } }),
  },
};

/** Sanitize editor/AI HTML before storing or rendering (XSS-safe). */
export function sanitizeArticleHtml(html: string): string {
  // Quill emits word gaps as non-breaking spaces (U+00A0 / &nbsp;), which stop
  // prose from wrapping and cause horizontal overflow. Collapse them back to
  // regular spaces so paragraphs wrap normally.
  const normalized = html.replace(/ /g, " ").replace(/&nbsp;/gi, " ");
  return sanitizeHtml(normalized, SANITIZE_OPTS);
}
