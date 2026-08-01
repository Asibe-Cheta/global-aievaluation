"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Upload } from "lucide-react";
import {
  createAnnotationTask,
  updateAnnotationTask,
} from "@/lib/actions/admin-annotation-tasks";
import type { AdminAnnotationTaskRow, AdminModuleRow } from "@/lib/admin/queries";
import OptionsEditor from "../OptionsEditor";
import BoldTextarea from "../BoldTextarea";

const MAX_VIDEO_SECONDS = 10;

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";
const sectionLabelClass =
  "text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block mb-2";

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read video metadata."));
    };
    video.src = URL.createObjectURL(file);
  });
}

export default function AnnotationTaskForm({
  modules,
  task,
}: {
  modules: AdminModuleRow[];
  task?: AdminAnnotationTaskRow;
}) {
  const router = useRouter();
  const isEdit = !!task;

  const [id, setId] = useState(task?.id ?? "");
  const [moduleId, setModuleId] = useState(task?.module_id ?? modules[0]?.id ?? "");
  const [type, setType] = useState<"image_pair" | "video" | "audio">(
    task?.type ?? "image_pair",
  );
  const [title, setTitle] = useState(task?.title ?? "");
  const [instructions, setInstructions] = useState(task?.instructions ?? "");
  const [sortOrder, setSortOrder] = useState(String(task?.sort_order ?? 0));

  const [scenario, setScenario] = useState(task?.scenario ?? "");
  const [question, setQuestion] = useState(task?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    task?.options && task.options.length >= 2 ? task.options : ["", ""],
  );
  const [correctOptionIndex, setCorrectOptionIndex] = useState(
    task?.correct_option_index ?? 0,
  );
  const [explanation, setExplanation] = useState(task?.explanation ?? "");
  const [reviewerNotes, setReviewerNotes] = useState(task?.reviewer_notes ?? "");

  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | undefined>(
    task?.media?.[0]?.durationSeconds,
  );

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVideoChange = async (file: File | null) => {
    setVideo(file);
    setError("");
    if (!file) return;
    try {
      const duration = await readVideoDuration(file);
      setVideoDuration(duration);
      if (duration > MAX_VIDEO_SECONDS) {
        setError(
          `That video is ${duration.toFixed(1)}s long. Videos must be ${MAX_VIDEO_SECONDS}s or less.`,
        );
      }
    } catch {
      setError("Could not read that video file's duration.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (type === "video" && videoDuration && videoDuration > MAX_VIDEO_SECONDS) {
      setError(`Video must be ${MAX_VIDEO_SECONDS}s or less.`);
      return;
    }
    if (!isEdit && type === "image_pair" && (!image1 || !image2)) {
      setError("Both images are required.");
      return;
    }
    if (!isEdit && type === "video" && !video) {
      setError("A video file is required.");
      return;
    }
    if (!isEdit && type === "audio" && !audio) {
      setError("An audio file is required.");
      return;
    }
    if (!question.trim()) {
      setError("Question is required.");
      return;
    }
    if (options.filter((o) => o.trim()).length < 2) {
      setError("At least 2 options are required.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("moduleId", moduleId);
    formData.set("type", type);
    formData.set("title", title);
    formData.set("instructions", instructions);
    formData.set("sortOrder", sortOrder);
    formData.set("scenario", scenario);
    formData.set("question", question);
    formData.set("options", JSON.stringify(options));
    formData.set("correctOptionIndex", String(correctOptionIndex));
    formData.set("explanation", explanation);
    formData.set("reviewerNotes", reviewerNotes);
    if (image1) formData.set("image1", image1);
    if (image2) formData.set("image2", image2);
    if (video) formData.set("video", video);
    if (audio) formData.set("audio", audio);
    if (videoDuration) formData.set("videoDurationSeconds", String(videoDuration));

    let result: { error?: string } | undefined;
    if (isEdit) {
      formData.set("existingMedia", JSON.stringify(task!.media ?? []));
      result = await updateAnnotationTask(task!.id, id, formData);
    } else {
      formData.set("id", id);
      result = await createAnnotationTask(formData);
    }

    setIsSubmitting(false);
    if (result?.error) setError(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug / ID</label>
          <input
            className={inputClass}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. m1_ann_1"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Module (which pool this task belongs to)</label>
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
            onChange={(e) =>
              setType(e.target.value as "image_pair" | "video" | "audio")
            }
            disabled={isEdit}
          >
            <option value="image_pair">Image pair</option>
            <option value="video">Video (max {MAX_VIDEO_SECONDS}s)</option>
            <option value="audio">Audio clip</option>
          </select>
          {isEdit && (
            <p className="text-[10px] text-slate-400 mt-1">
              Type can't change after creation — delete and recreate instead.
            </p>
          )}
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
          <label className={labelClass}>Instructions</label>
          <BoldTextarea
            className={inputClass}
            rows={2}
            value={instructions}
            onChange={setInstructions}
            placeholder="What should the annotator look/listen for?"
          />
        </div>
      </div>

      <div>
        <label className={sectionLabelClass}>Media</label>
        {type === "image_pair" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { slot: 1, file: image1, setFile: setImage1, existing: task?.media?.[0] },
              { slot: 2, file: image2, setFile: setImage2, existing: task?.media?.[1] },
            ].map(({ slot, file, setFile, existing }) => (
              <div
                key={slot}
                className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-4 space-y-2"
              >
                <label className={labelClass}>Image {slot}</label>
                {existing?.url && !file && (
                  <img
                    src={existing.url}
                    alt={`Current image ${slot}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                {file && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New image ${slot} preview`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                  <Upload className="w-3.5 h-3.5" />
                  {existing ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            ))}
          </div>
        ) : type === "video" ? (
          <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-4 space-y-2 max-w-md">
            {task?.media?.[0]?.url && !video && (
              <video
                src={task.media[0].url}
                controls
                className="w-full max-h-48 rounded-lg bg-black"
              />
            )}
            {video && (
              <video
                src={URL.createObjectURL(video)}
                controls
                className="w-full max-h-48 rounded-lg bg-black"
              />
            )}
            {videoDuration !== undefined && (
              <p className="text-[10px] text-slate-450">
                Duration: {videoDuration.toFixed(1)}s
                {videoDuration > MAX_VIDEO_SECONDS && (
                  <span className="text-red-500 font-bold"> — exceeds the {MAX_VIDEO_SECONDS}s limit</span>
                )}
              </p>
            )}
            <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              <Upload className="w-3.5 h-3.5" />
              {task?.media?.[0] ? "Replace video" : "Upload video"}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 dark:border-slate-750 rounded-xl p-4 space-y-2 max-w-md">
            {task?.media?.[0]?.url && !audio && (
              <audio src={task.media[0].url} controls className="w-full" />
            )}
            {audio && (
              <audio src={URL.createObjectURL(audio)} controls className="w-full" />
            )}
            <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
              <Upload className="w-3.5 h-3.5" />
              {task?.media?.[0] ? "Replace audio" : "Upload audio"}
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        )}
      </div>

      {/* Same Q&A shape as a Lesson's Mini Case Study, minus prompt/response
          (the media above stands in for that) */}
      <div>
        <label className={sectionLabelClass}>Scenario (optional)</label>
        <BoldTextarea
          className={inputClass}
          rows={2}
          value={scenario}
          onChange={setScenario}
          placeholder="Any context the annotator needs before reviewing the media..."
        />
      </div>

      <div>
        <label className={sectionLabelClass}>Question</label>
        <BoldTextarea className={inputClass} rows={2} value={question} onChange={setQuestion} required />
      </div>

      <div>
        <label className={sectionLabelClass}>Options &amp; Correct Answer</label>
        <OptionsEditor
          options={options}
          correctIndex={correctOptionIndex}
          onChange={(opts, correctIdx) => {
            setOptions(opts);
            setCorrectOptionIndex(correctIdx);
          }}
        />
      </div>

      <div>
        <label className={sectionLabelClass}>Explanation</label>
        <BoldTextarea className={inputClass} rows={2} value={explanation} onChange={setExplanation} />
      </div>

      <div>
        <label className={sectionLabelClass}>Reviewer Notes (optional)</label>
        <BoldTextarea className={inputClass} rows={2} value={reviewerNotes} onChange={setReviewerNotes} />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-850 sticky bottom-0 bg-white dark:bg-slate-900 py-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Task"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/annotation-tasks")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
