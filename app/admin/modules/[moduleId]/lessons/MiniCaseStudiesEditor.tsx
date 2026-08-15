"use client";

import { useState } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import type { AdminMiniCaseStudy } from "@/lib/admin/queries";
import CollapsibleCard from "../../../CollapsibleCard";
import OptionsEditor from "../../../OptionsEditor";
import BoldTextarea from "../../../BoldTextarea";
import { uploadMediaClip, removeMediaClip } from "@/lib/supabase/upload-media";

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
  lessonId: string;
  caseStudies: AdminMiniCaseStudy[];
  onChange: (caseStudies: AdminMiniCaseStudy[]) => void;
}

// Media uploads straight to Supabase on selection (see
// lib/supabase/upload-media.ts) rather than being held as a pending File for
// the form's "use server" action to upload later — that path 413'd on
// anything but the smallest clips, since Vercel caps a server action's
// request body well below the app's own 20MB limit. Once uploaded, the
// result is appended straight into the case study's `media` array, same as
// pre-existing media.
export default function MiniCaseStudiesEditor({ lessonId, caseStudies, onChange }: MiniCaseStudiesEditorProps) {
  const [uploadingCaseId, setUploadingCaseId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<Record<string, string>>({});

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
    onChange(caseStudies.filter((_, i) => i !== idx));
  };

  const removeExistingMedia = (idx: number, mediaIdx: number) => {
    const cs = caseStudies[idx];
    const removed = (cs.media ?? [])[mediaIdx];
    if (removed?.path) removeMediaClip("lesson-media", removed.path).catch(() => {});
    const nextMedia = (cs.media ?? []).filter((_, i) => i !== mediaIdx);
    updateCase(idx, { media: nextMedia });
  };

  const handleAddMedia = async (
    idx: number,
    type: "image" | "video" | "audio",
    file: File | null,
  ) => {
    if (!file) return;
    const caseId = caseStudies[idx].id;
    setMediaError((prev) => ({ ...prev, [caseId]: "" }));

    if (type !== "image") {
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
    }

    setUploadingCaseId(caseId);
    try {
      const media = await uploadMediaClip("lesson-media", `${lessonId}/${caseId}`, type, file);
      const cs = caseStudies[idx];
      updateCase(idx, { media: [...(cs.media ?? []), media] });
    } catch (err) {
      setMediaError((prev) => ({
        ...prev,
        [caseId]: err instanceof Error ? err.message : "Upload failed.",
      }));
    } finally {
      setUploadingCaseId(null);
    }
  };

  return (
    <div className="space-y-2">
      {caseStudies.map((cs, idx) => {
        const existingImages = (cs.media ?? []).filter((m) => m.type === "image");
        const existingVideos = (cs.media ?? []).filter((m) => m.type === "video");
        const existingAudios = (cs.media ?? []).filter((m) => m.type === "audio");
        const isUploading = uploadingCaseId === cs.id;

        return (
          <CollapsibleCard
            key={cs.id}
            title={`Case Study ${idx + 1}${cs.scenario ? `: ${cs.scenario}` : ""}`}
            onRemove={() => removeCase(idx)}
          >
            <div>
              <label className={labelClass}>Scenario</label>
              <BoldTextarea className={inputClass} rows={2} value={cs.scenario} onChange={(v) => updateCase(idx, { scenario: v })} />
            </div>
            <div>
              <label className={labelClass}>Prompt</label>
              <BoldTextarea className={inputClass} rows={2} value={cs.prompt} onChange={(v) => updateCase(idx, { prompt: v })} />
            </div>
            <div>
              <label className={labelClass}>Response</label>
              <BoldTextarea className={inputClass} rows={2} value={cs.response} onChange={(v) => updateCase(idx, { response: v })} />
            </div>

            <div>
              <label className={labelClass}>
                Image / Video / Audio (optional — max {MAX_PER_TYPE} each, video/audio ≤{MAX_CLIP_SECONDS}s)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Images ({existingImages.length}/{MAX_PER_TYPE})</span>
                  {existingImages.map((m) => (
                    <div key={m.path} className="flex items-center gap-2">
                      <img src={m.url} alt="" className="w-full max-h-28 rounded-lg object-contain" />
                      <button
                        type="button"
                        onClick={() => removeExistingMedia(idx, (cs.media ?? []).indexOf(m))}
                        className="text-rose-500 hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {isUploading ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-450">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    existingImages.length < MAX_PER_TYPE && (
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        Add image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAddMedia(idx, "image", e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )
                  )}
                </div>

                <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Videos ({existingVideos.length}/{MAX_PER_TYPE})</span>
                  {existingVideos.map((m) => (
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
                  {isUploading ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-450">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    existingVideos.length < MAX_PER_TYPE && (
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        Add video
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleAddMedia(idx, "video", e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )
                  )}
                </div>

                <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Audio ({existingAudios.length}/{MAX_PER_TYPE})</span>
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
                  {isUploading ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-450">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </span>
                  ) : (
                    existingAudios.length < MAX_PER_TYPE && (
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                        <Upload className="w-3.5 h-3.5" />
                        Add audio
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => handleAddMedia(idx, "audio", e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )
                  )}
                </div>
              </div>
              {mediaError[cs.id] && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">{mediaError[cs.id]}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Question</label>
              <BoldTextarea className={inputClass} rows={2} value={cs.question} onChange={(v) => updateCase(idx, { question: v })} />
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
              <BoldTextarea className={inputClass} rows={2} value={cs.explanation} onChange={(v) => updateCase(idx, { explanation: v })} />
            </div>
            <div>
              <label className={labelClass}>Reviewer Notes (optional)</label>
              <BoldTextarea
                className={inputClass}
                rows={2}
                value={cs.reviewerNotes ?? ""}
                onChange={(v) => updateCase(idx, { reviewerNotes: v })}
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
}
