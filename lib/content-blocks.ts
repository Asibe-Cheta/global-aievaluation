import type { ContentBlock } from "@/types";

/**
 * Lessons authored before content blocks supported media stored `content`
 * as a plain string[]. Normalizes either shape into ContentBlock[] so the
 * rest of the app only ever deals with one shape.
 */
export function normalizeContentBlocks(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    if (typeof item === "string") {
      return { id: `legacy-${idx}`, text: item };
    }
    const obj = item as Partial<ContentBlock>;
    return {
      id: obj.id ?? `legacy-${idx}`,
      text: obj.text ?? "",
      media: obj.media ?? [],
    };
  });
}
