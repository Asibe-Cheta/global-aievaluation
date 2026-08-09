"use client";

import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import type { AdminCaseStudyMediaItem } from "@/lib/admin/queries";

const MAX_CLIP_SECONDS = 10;

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

export interface MediaClipUploadHandle {
  file: File | null;
  type: "image" | "video" | "audio" | null;
  removeExisting: boolean;
}

// A single optional media slot (image, or a <=10s video/audio clip) for one
// practice-task content block. Mirrors the media widget in
// ExamQuestionForm.tsx, generalized to also accept images and to report
// its pending selection back to the parent form instead of managing its
// own FormData field names (this widget is used up to 4x per form).
export default function MediaClipUpload({
  label,
  existing,
  onChange,
}: {
  label: string;
  existing?: AdminCaseStudyMediaItem;
  onChange: (state: MediaClipUploadHandle) => void;
}) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingType, setPendingType] = useState<"image" | "video" | "audio" | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | null, type: "image" | "video" | "audio") => {
    setError("");
    if (!file) return;

    if (type !== "image") {
      try {
        const duration = await readClipDuration(file);
        if (duration > MAX_CLIP_SECONDS) {
          setError(`That ${type} is ${duration.toFixed(1)}s long. Clips must be ${MAX_CLIP_SECONDS}s or less.`);
          return;
        }
      } catch {
        setError("Could not read that file's duration.");
        return;
      }
    }

    setPendingFile(file);
    setPendingType(type);
    setRemoveExisting(false);
    onChange({ file, type, removeExisting: false });
  };

  const handleRemove = () => {
    setPendingFile(null);
    setPendingType(null);
    setRemoveExisting(true);
    onChange({ file: null, type: null, removeExisting: true });
  };

  const showExisting = existing && !pendingFile && !removeExisting;

  return (
    <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2">
      {showExisting && existing && (
        <div className="flex items-center gap-2">
          {existing.type === "image" ? (
            <img src={existing.url} alt="" className="max-h-32 rounded-lg object-contain" />
          ) : existing.type === "video" ? (
            <video src={existing.url} controls className="w-full max-h-32 rounded-lg bg-black" />
          ) : (
            <audio src={existing.url} controls className="w-full" />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="text-rose-500 hover:text-rose-600 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {pendingFile && pendingType && (
        <div className="flex items-center gap-2">
          {pendingType === "image" ? (
            <img src={URL.createObjectURL(pendingFile)} alt="" className="max-h-32 rounded-lg object-contain" />
          ) : pendingType === "video" ? (
            <video src={URL.createObjectURL(pendingFile)} controls className="w-full max-h-32 rounded-lg bg-black" />
          ) : (
            <audio src={URL.createObjectURL(pendingFile)} controls className="w-full" />
          )}
        </div>
      )}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
          <Upload className="w-3.5 h-3.5" />
          {existing || pendingFile ? `Replace ${label}` : `Add ${label}`} — image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null, "image")}
          />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
          <Upload className="w-3.5 h-3.5" />
          video
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null, "video")}
          />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
          <Upload className="w-3.5 h-3.5" />
          audio
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null, "audio")}
          />
        </label>
      </div>
      {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
    </div>
  );
}
