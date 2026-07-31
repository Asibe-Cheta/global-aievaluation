import React from "react";
import type { CaseStudyMediaItem } from "../types";

// Shared between LessonView (the live student-facing page) and the admin's
// Content Blocks editor (as a live preview), so both agree on exactly what
// "**bold**" / "## heading" / bullet syntax renders as.
export function renderFormattedText(text: string) {
  if (!text.includes("**")) return <span>{text}</span>;
  const parts = text.split("**");
  return (
    <span>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
              {part}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
}

function headingMatch(line: string): { level: 2 | 3; text: string } | null {
  const m = line.match(/^(#{2,3})\s+(.*)/);
  if (!m) return null;
  return { level: m[1].length === 2 ? 2 : 3, text: m[2] };
}

function renderHeading(level: 2 | 3, text: string, key: number | string) {
  return level === 2 ? (
    <h3 key={key} className="text-base font-extrabold text-slate-900 dark:text-white pt-2">
      {renderFormattedText(text)}
    </h3>
  ) : (
    <h4 key={key} className="text-sm font-extrabold text-slate-800 dark:text-slate-100 pt-1">
      {renderFormattedText(text)}
    </h4>
  );
}

function renderBlockMedia(media: CaseStudyMediaItem | undefined, key: number | string) {
  if (!media) return null;
  if (media.type === "image") {
    return <img key={key} src={media.url} alt="" className="rounded-xl max-h-80 w-auto object-contain" />;
  }
  if (media.type === "video") {
    return (
      <video key={key} src={media.url} controls className="rounded-xl max-h-80 w-auto bg-black" />
    );
  }
  return <audio key={key} src={media.url} controls className="w-full max-w-md" />;
}

export function renderLessonParagraph(p: string, pIndex: number | string, media?: CaseStudyMediaItem) {
  if (!p.includes("\n")) {
    const asHeading = headingMatch(p.trim());
    if (asHeading) {
      return (
        <React.Fragment key={pIndex}>
          {renderHeading(asHeading.level, asHeading.text, `${pIndex}-h`)}
          {renderBlockMedia(media, `${pIndex}-m`)}
        </React.Fragment>
      );
    }
    return (
      <div key={pIndex} className="space-y-3">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">
          {renderFormattedText(p)}
        </p>
        {renderBlockMedia(media, `${pIndex}-m`)}
      </div>
    );
  }

  const lines = p.split("\n");
  return (
    <div key={pIndex} className="space-y-2.5 my-3">
      {lines.map((line, lIndex) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIndex} className="h-2" />;

        const asHeading = headingMatch(trimmed);
        if (asHeading) return renderHeading(asHeading.level, asHeading.text, lIndex);

        // Check for bullet list (e.g. "• text", "- text", "* text"). Requires
        // a space after the marker so a bold-opening "**text**" line (no
        // space between the two asterisks) is never mistaken for a bullet.
        const bulletMatch = trimmed.match(/^([•\-\*])\s+(.*)/);
        if (bulletMatch) {
          return (
            <div key={lIndex} className="flex items-start gap-2.5 pl-4 animate-fade-in">
              <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold select-none mt-0.5 shrink-0 text-base leading-none">
                •
              </span>
              <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-350 flex-1">
                {renderFormattedText(bulletMatch[2])}
              </span>
            </div>
          );
        }

        // Check for numbered list (e.g. 1. 2.)
        const numberMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numberMatch) {
          return (
            <div key={lIndex} className="flex items-start gap-2.5 pl-4 animate-fade-in">
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-md min-w-[20px] text-center select-none shrink-0 mt-0.5 leading-none">
                {numberMatch[1]}
              </span>
              <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-350 flex-1">
                {renderFormattedText(numberMatch[2])}
              </span>
            </div>
          );
        }

        return (
          <p key={lIndex} className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">
            {renderFormattedText(line)}
          </p>
        );
      })}
      {renderBlockMedia(media, `${pIndex}-m`)}
    </div>
  );
}
