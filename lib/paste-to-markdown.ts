// Word/Claude/ChatGPT copy-paste hands us HTML with real <strong>/<h1-h6> tags
// (or, for Word, inline `font-weight` styles on <span>/<p>). Our lesson
// content is stored as plain text using our own "**bold**" / "## heading"
// convention, so a raw paste silently drops that formatting. This walks the
// clipboard HTML and re-encodes it into that convention before it lands in
// the textarea.
function isBoldElement(el: HTMLElement): boolean {
  const style = el.getAttribute("style") || "";
  const match = /font-weight\s*:\s*(\d+|bold)/i.exec(style);
  if (!match) return false;
  const value = match[1].toLowerCase();
  if (value === "bold") return true;
  const numeric = parseInt(value, 10);
  return !isNaN(numeric) && numeric >= 600;
}

function walk(node: Node, parentBold: boolean): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const boldHere = parentBold || tag === "b" || tag === "strong" || isBoldElement(el);
  const inner = Array.from(el.childNodes)
    .map((child) => walk(child, boldHere))
    .join("");

  switch (tag) {
    case "h1":
    case "h2":
      return inner.trim() ? `\n## ${inner.trim()}\n` : "";
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return inner.trim() ? `\n### ${inner.trim()}\n` : "";
    case "li": {
      const parentTag = el.parentElement?.tagName.toLowerCase();
      if (parentTag === "ol") {
        const index = Array.from(el.parentElement!.children).indexOf(el) + 1;
        return inner.trim() ? `\n${index}. ${inner.trim()}` : "";
      }
      return inner.trim() ? `\n• ${inner.trim()}` : "";
    }
    case "br":
      return "\n";
    case "p":
    case "div":
      return inner.trim() ? `\n${inner}\n` : "\n";
    default:
      if (boldHere && !parentBold && inner.trim()) {
        return `**${inner}**`;
      }
      return inner;
  }
}

export function htmlClipboardToMarkdown(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;

  const raw = walk(container, false);
  return raw
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
