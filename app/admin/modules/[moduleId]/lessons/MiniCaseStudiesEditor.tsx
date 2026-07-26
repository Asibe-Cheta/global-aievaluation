"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Upload, Trash2, X } from "lucide-react";
import type { AdminMiniCaseStudy, AdminCaseStudyMediaItem } from "@/lib/admin/queries";
import CollapsibleCard from "../../../CollapsibleCard";
import OptionsEditor from "../../../OptionsEditor";

const MAX_CLIP_SECONDS = 10;
const MAX_PER_TYPE = 2;

const inputClass =
  "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-[10px] text-slate-455 font-bold uppercase tracking-wider block mb-1";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readClipDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const isVideo = file.type.startsWith("video");
    const el = document.createElement(isVideo ? "video" : "audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(el.src);
      resolve(el.duration);
    };
    el.onerror = () => {
      URL.revokeObjectURL(el.src);
      reject(new Error("Could not read that file's duration."));
    };
    el.src = URL.createObjectURL(file);
  });
}

interface MiniCaseStudiesEditorProps {
  caseStudies: AdminMiniCaseStudy[];
  onChange: (caseStudies: AdminMiniCaseStudy[]) => void;
}

export interface MiniCaseStudiesEditorHandle {
  getPendingMedia: () => Record<string, { video: File[]; audio: File[] }>;
}

const MiniCaseStudiesEditor = forwardRef<MiniCaseStudiesEditorHandle, MiniCaseStudiesEditorProps>(
  ({ caseStudies, onChange }, ref) => {
    const [pendingMedia, setPendingMedia] = useState<
      Record<string, { video: File[]; audio: File[] }>
    >({});
    const [mediaError, setMediaError] = useState<Record<string, string>>({});

    useImperativeHandle(ref, () => ({
      getPendingMedia: () => pendingMedia,
    }));

    const updateCase = (idx: number, patch: Partial<AdminMiniCaseStudy>) => {
      const next = [...caseStudies];
      next[idx] = { ...next[idx], ...patch };
      onChange(next);
    };

    const addCase = () =>
      onChange([
        ...caseStudies,
        {
          id: newId("case"),
          scenario: "",
          prompt: "",
          response: "",
          question: "",
          options: ["", ""],
          correctOptionIndex: 0,
          explanation: "",
          reviewerNotes: "",
          media: [],
        },
      ]);

    const removeCase = (idx: number) => {
      const caseId = caseStudies[idx].id;
      onChange(caseStudies.filter((_, i) => i !== idx));
      setPendingMedia((prev) => {
        const next = { ...prev };
        delete next[caseId];
        return next;
      });
    };

    const removeExistingMedia = (idx: number, mediaIdx: number) => {
      const cs = caseStudies[idx];
      const nextMedia = (cs.media ?? []).filter((_, i) => i !== mediaIdx);
      updateCase(idx, { media: nextMedia });
    };

    const removePendingMedia = (caseId: string, type: "video" | "audio", fileIdx: number) => {
      setPendingMedia((prev) => ({
        ...prev,
        [caseId]: {
          video: type === "video" ? prev[caseId]?.video.filter((_, i) => i !== fileIdx) ?? [] : prev[caseId]?.video ?? [],
          audio: type === "audio" ? prev[caseId]?.audio.filter((_, i) => i !== fileIdx) ?? [] : prev[caseId]?.audio ?? [],
        },
      }));
    };

    const handleAddMedia = async (
      caseId: string,
      type: "video" | "audio",
      file: File | null,
    ) => {
      if (!file) return;
      setMediaError((prev) => ({ ...prev, [caseId]: "" }));
      try {
        const duration = await readClipDuration(file);
        if (duration > MAX_CLIP_SECONDS) {
          setMediaError((prev) => ({
            ...prev,
            [caseId]: `That ${type} is ${duration.toFixed(1)}s long. Clips must be ${MAX_CLIP_SECONDS}s or less.`,
          }));
          return;
        }
      } catch {
        setMediaError((prev) => ({ ...prev, [caseId]: "Could not read that file's duration." }));
        return;
      }
      setPendingMedia((prev) => ({
        ...prev,
        [caseId]: {
          video: type === "video" ? [...(prev[caseId]?.video ?? []), file] : prev[caseId]?.video ?? [],
          audio: type === "audio" ? [...(prev[caseId]?.audio ?? []), file] : prev[caseId]?.audio ?? [],
        },
      }));
    };

    return (
      <div className="space-y-2">
        {caseStudies.map((cs, idx) => {
          const existingVideos = (cs.media ?? []).filter((m) => m.type === "video");
          const existingAudios = (cs.media ?? []).filter((m) => m.type === "audio");
          const pending = pendingMedia[cs.id] ?? { video: [], audio: [] };
          const videoCount = existingVideos.length + pending.video.length;
          const audioCount = existingAudios.length + pending.audio.length;

          return (
            <CollapsibleCard
              key={cs.id}
              title={`Case Study ${idx + 1}${cs.scenario ? `: ${cs.scenario.slice(0, 50)}` : ""}`}
              onRemove={() => removeCase(idx)}
            >
              <div>
                <label className={labelClass}>Scenario</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={cs.scenario}
                  onChange={(e) => updateCase(idx, { scenario: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Prompt</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={cs.prompt}
                  onChange={(e) => updateCase(idx, { prompt: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Response</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={cs.response}
                  onChange={(e) => updateCase(idx, { response: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Video / Audio Clips (optional — max {MAX_PER_TYPE} videos + {MAX_PER_TYPE} audio, each ≤{MAX_CLIP_SECONDS}s)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Videos ({videoCount}/{MAX_PER_TYPE})</span>
                    {existingVideos.map((m, i) => (
                      <div key={m.path} className="flex items-center gap-2">
                        <video src={m.url} controls className="w-full max-h-28 rounded-lg bg-black" />
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(idx, (cs.media ?? []).indexOf(m))}
                          className="text-rose-500 hover:text-rose-600 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {pending.video.map((file, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <video src={URL.createObjectURL(file)} controls className="w-full max-h-28 rounded-lg bg-black" />
                        <button
                          type="button"
                          onClick={() => removePendingMedia(cs.id, "video", i)}
                          className="text-rose-500 hover:text-rose-600 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {videoCount < MAX_PER_TYPE && (
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        Add video
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleAddMedia(cs.id, "video", e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                  </div>

                  <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Audio ({audioCount}/{MAX_PER_TYPE})</span>
                    {existingAudios.map((m) => (
                      <div key={m.path} className="flex items-center gap-2">
                        <audio src={m.url} controls className="w-full" />
                        <button
                          type="button"
                          onClick={() => removeExistingMedia(idx, (cs.media ?? []).indexOf(m))}
                          className="text-rose-500 hover:text-rose-600 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {pending.audio.map((file, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <audio src={URL.createObjectURL(file)} controls className="w-full" />
                        <button
                          type="button"
                          onClick={() => removePendingMedia(cs.id, "audio", i)}
                          className="text-rose-500 hover:text-rose-600 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {audioCount < MAX_PER_TYPE && (
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        Add audio
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => handleAddMedia(cs.id, "audio", e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                  </div>
                </div>
                {mediaError[cs.id] && (
                  <p className="text-[11px] text-red-500 font-semibold mt-1">{mediaError[cs.id]}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Question</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={cs.question}
                  onChange={(e) => updateCase(idx, { question: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Options &amp; Correct Answer</label>
                <OptionsEditor
                  options={cs.options}
                  correctIndex={cs.correctOptionIndex}
                  onChange={(opts, correctIdx) =>
                    updateCase(idx, { options: opts, correctOptionIndex: correctIdx })
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Explanation</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={cs.explanation}
                  onChange={(e) => updateCase(idx, { explanation: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Reviewer Notes (optional)</label>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={cs.reviewerNotes ?? ""}
                  onChange={(e) => updateCase(idx, { reviewerNotes: e.target.value })}
                />
              </div>
            </CollapsibleCard>
          );
        })}
        <button
          type="button"
          onClick={addCase}
          className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
        >
          + Add Mini Case Study
        </button>
      </div>
    );
  },
);

MiniCaseStudiesEditor.displayName = "MiniCaseStudiesEditor";

export default MiniCaseStudiesEditor;
