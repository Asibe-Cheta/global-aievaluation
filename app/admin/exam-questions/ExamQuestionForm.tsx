"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Upload, Trash2 } from "lucide-react";
import {
  createExamQuestion,
  updateExamQuestion,
} from "@/lib/actions/admin-exam-questions";
import type { AdminExamQuestionRow, AdminModuleRow } from "@/lib/admin/queries";
import OptionsEditor from "../OptionsEditor";

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

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";

const SKILL_CATEGORIES = [
  "promptEvaluation",
  "responseRanking",
  "factChecking",
  "safetyReview",
  "annotation",
  "reasoning",
  "reasoningEvaluation",
  "instructionFollowing",
];

export default function ExamQuestionForm({
  modules,
  question,
}: {
  modules: AdminModuleRow[];
  question?: AdminExamQuestionRow;
}) {
  const router = useRouter();
  const isEdit = !!question;

  const [id, setId] = useState(question?.id ?? "");
  const [moduleId, setModuleId] = useState(question?.module_id ?? modules[0]?.id ?? "");
  const [type, setType] = useState<"mcq" | "tf" | "scenario">(
    (question?.type as "mcq" | "tf" | "scenario") ?? "mcq",
  );
  const [category, setCategory] = useState(
    question?.category ?? "promptEvaluation",
  );
  const [questionText, setQuestionText] = useState(question?.question ?? "");
  const [options, setOptions] = useState<string[]>(question?.options ?? []);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(
    question?.correct_option_index ?? 0,
  );
  const [explanation, setExplanation] = useState(question?.explanation ?? "");
  const [part, setPart] = useState(question?.part ?? "");
  const [scenario, setScenario] = useState(question?.scenario ?? "");
  const [sortOrder, setSortOrder] = useState(String(question?.sort_order ?? 0));

  const existingMedia = question?.media?.[0];
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "audio">(existingMedia?.type ?? "video");
  const [removeMedia, setRemoveMedia] = useState(false);
  const [mediaError, setMediaError] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMediaChange = async (file: File | null, kind: "video" | "audio") => {
    setMediaError("");
    if (!file) return;
    try {
      const duration = await readClipDuration(file);
      if (duration > MAX_CLIP_SECONDS) {
        setMediaError(`That clip is ${duration.toFixed(1)}s long. Clips must be ${MAX_CLIP_SECONDS}s or less.`);
        return;
      }
    } catch {
      setMediaError("Could not read that file's duration.");
      return;
    }
    setMediaType(kind);
    setMediaFile(file);
    setRemoveMedia(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("moduleId", moduleId);
    formData.set("type", type);
    formData.set("category", category);
    formData.set("question", questionText);
    formData.set("options", JSON.stringify(options));
    formData.set("correctOptionIndex", String(correctOptionIndex));
    formData.set("explanation", explanation);
    formData.set("part", part);
    formData.set("scenario", scenario);
    formData.set("sortOrder", sortOrder);
    formData.set("removeMedia", String(removeMedia));
    if (mediaFile) {
      formData.set(mediaType === "video" ? "mediaVideo" : "mediaAudio", mediaFile);
    }

    let result: { error?: string } | undefined;
    if (isEdit) {
      formData.set("existingMedia", JSON.stringify(question!.media ?? []));
      result = await updateExamQuestion(question!.id, formData);
    } else {
      result = await createExamQuestion(id, formData);
    }

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug / ID</label>
          <input
            className={inputClass}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. exam_m2_q1"
            disabled={isEdit}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Module (which pool this question is drawn from)</label>
          <select
            className={inputClass}
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            required
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Type</label>
          <select
            className={inputClass}
            value={type}
            onChange={(e) => setType(e.target.value as "mcq" | "tf" | "scenario")}
          >
            <option value="mcq">mcq</option>
            <option value="tf">tf</option>
            <option value="scenario">scenario</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Category (skill it tests)</label>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Question</label>
          <textarea
            className={inputClass}
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <label className={labelClass}>Options &amp; Correct Answer</label>
          <OptionsEditor
            options={options}
            correctIndex={correctOptionIndex}
            onChange={(opts, idx) => {
              setOptions(opts);
              setCorrectOptionIndex(idx);
            }}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Explanation</label>
          <textarea
            className={inputClass}
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Part (optional)</label>
          <input className={inputClass} value={part} onChange={(e) => setPart(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input
            type="number"
            className={inputClass}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Scenario (optional)</label>
          <textarea
            className={inputClass}
            rows={2}
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Video / Audio Clip (optional, max {MAX_CLIP_SECONDS}s)</label>
          <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-3 space-y-2 max-w-md">
            {existingMedia && !mediaFile && !removeMedia && (
              <div className="flex items-center gap-2">
                {existingMedia.type === "video" ? (
                  <video src={existingMedia.url} controls className="w-full max-h-40 rounded-lg bg-black" />
                ) : (
                  <audio src={existingMedia.url} controls className="w-full" />
                )}
                <button
                  type="button"
                  onClick={() => setRemoveMedia(true)}
                  className="text-rose-500 hover:text-rose-600 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {mediaFile && (
              <div>
                {mediaType === "video" ? (
                  <video src={URL.createObjectURL(mediaFile)} controls className="w-full max-h-40 rounded-lg bg-black" />
                ) : (
                  <audio src={URL.createObjectURL(mediaFile)} controls className="w-full" />
                )}
              </div>
            )}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                <Upload className="w-3.5 h-3.5" />
                {existingMedia || mediaFile ? "Replace video" : "Add video"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleMediaChange(e.target.files?.[0] ?? null, "video")}
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                <Upload className="w-3.5 h-3.5" />
                {existingMedia || mediaFile ? "Replace audio" : "Add audio"}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => handleMediaChange(e.target.files?.[0] ?? null, "audio")}
                />
              </label>
            </div>
            {mediaError && <p className="text-[11px] text-red-500 font-semibold">{mediaError}</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-850">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Exam Question"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/exam-questions")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
