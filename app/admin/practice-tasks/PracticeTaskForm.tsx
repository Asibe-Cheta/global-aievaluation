"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  createPracticeTask,
  updatePracticeTask,
} from "@/lib/actions/admin-practice-tasks";
import type { AdminModuleRow, AdminPracticeTaskRow } from "@/lib/admin/queries";
import { SKILL_CATEGORIES, FAILURE_MODE_TAGS } from "@/lib/admin/constants";
import OptionsEditor from "../OptionsEditor";
import BoldTextarea from "../BoldTextarea";
import MediaClipUpload, { type MediaClipUploadHandle } from "../MediaClipUpload";
import MultiSelectTags from "../MultiSelectTags";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";
const sectionLabelClass =
  "text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block mb-1";

const BLOCK_KEYS = ["guideline", "item", "response_a", "response_b"] as const;
type BlockKey = (typeof BLOCK_KEYS)[number];

export default function PracticeTaskForm({
  modules,
  task,
}: {
  modules: AdminModuleRow[];
  task?: AdminPracticeTaskRow;
}) {
  const router = useRouter();
  const isEdit = !!task;

  const [id, setId] = useState(task?.id ?? "");
  const [moduleId, setModuleId] = useState(task?.module_id ?? modules[0]?.id ?? "");
  const [taskType, setTaskType] = useState(task?.task_type ?? "evaluation");
  const [category, setCategory] = useState(task?.category ?? SKILL_CATEGORIES[0]);
  const [sortOrder, setSortOrder] = useState(String(task?.sort_order ?? 0));

  const [guidelineText, setGuidelineText] = useState(task?.guideline?.text ?? "");
  const [itemText, setItemText] = useState(task?.item?.text ?? "");
  const [responseAText, setResponseAText] = useState(task?.response_a?.text ?? "");
  const [hasResponseB, setHasResponseB] = useState(!!task?.response_b);
  const [responseBText, setResponseBText] = useState(task?.response_b?.text ?? "");
  const [question, setQuestion] = useState(task?.question ?? "");

  const [responseMode, setResponseMode] = useState<"choice" | "written" | "choice_plus_written">(
    task?.response_mode ?? "choice",
  );
  const [options, setOptions] = useState<string[]>(
    task?.options?.map((o) => o.text) ?? [],
  );
  const [correctIndex, setCorrectIndex] = useState(
    Math.max(0, task?.options?.findIndex((o) => o.is_correct) ?? 0),
  );

  const [modelAnswer, setModelAnswer] = useState(task?.model_answer ?? "");
  const [explanation, setExplanation] = useState(task?.explanation ?? "");
  const [reviewerNotes, setReviewerNotes] = useState(task?.reviewer_notes ?? "");

  const [timed, setTimed] = useState(task?.timed ?? false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(
    String(task?.time_limit_seconds ?? 600),
  );
  const [failureModeTags, setFailureModeTags] = useState<string[]>(
    task?.failure_mode_tags ?? [],
  );

  const [mediaState, setMediaState] = useState<Record<BlockKey, MediaClipUploadHandle | null>>({
    guideline: null,
    item: null,
    response_a: null,
    response_b: null,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingBlocks = {
    guideline: task?.guideline ?? null,
    item: task?.item ?? null,
    response_a: task?.response_a ?? null,
    response_b: task?.response_b ?? null,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("moduleId", moduleId);
    formData.set("taskType", taskType);
    formData.set("category", category);
    formData.set("sortOrder", sortOrder);
    formData.set("guidelineText", guidelineText);
    formData.set("itemText", itemText);
    formData.set("responseAText", responseAText);
    formData.set("hasResponseB", String(hasResponseB));
    formData.set("responseBText", responseBText);
    formData.set("question", question);
    formData.set("responseMode", responseMode);
    formData.set(
      "options",
      JSON.stringify(options.map((text, i) => ({ text, is_correct: i === correctIndex }))),
    );
    formData.set("modelAnswer", modelAnswer);
    formData.set("explanation", explanation);
    formData.set("reviewerNotes", reviewerNotes);
    formData.set("timed", String(timed));
    formData.set("timeLimitSeconds", timeLimitSeconds);
    formData.set("failureModeTags", JSON.stringify(failureModeTags));

    for (const key of BLOCK_KEYS) {
      const pending = mediaState[key];
      if (!pending) continue;
      if (pending.file && pending.type) {
        const capType = pending.type[0].toUpperCase() + pending.type.slice(1);
        formData.set(`${key}${capType}`, pending.file);
      }
      if (pending.removeExisting) {
        formData.set(`${key}RemoveMedia`, "true");
      }
    }

    let result: { error?: string } | undefined;
    if (isEdit) {
      formData.set("existingBlocks", JSON.stringify(existingBlocks));
      result = await updatePracticeTask(task!.id, id, formData);
    } else {
      result = await createPracticeTask(id, formData);
    }

    setIsSubmitting(false);
    if (result?.error) setError(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className={labelClass}>Slug / ID</label>
          <input className={inputClass} value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. m2_assess_t04" required />
        </div>
        <div>
          <label className={labelClass}>Module</label>
          <select className={inputClass} value={moduleId} onChange={(e) => setModuleId(e.target.value)} required>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Task Type</label>
          <input className={inputClass} value={taskType} onChange={(e) => setTaskType(e.target.value)} placeholder="evaluation / annotation" />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input type="number" className={inputClass} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
        </div>
      </div>

      {/* The Task */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
        <span className={sectionLabelClass}>The Task</span>

        <div>
          <label className={labelClass}>Guideline / Rubric</label>
          <BoldTextarea className={inputClass} rows={2} value={guidelineText} onChange={setGuidelineText} />
          <div className="mt-2">
            <MediaClipUpload label="reference media" existing={existingBlocks.guideline?.media?.[0]} onChange={(s) => setMediaState((p) => ({ ...p, guideline: s }))} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Prompt / Item</label>
          <BoldTextarea className={inputClass} rows={2} value={itemText} onChange={setItemText} />
          <div className="mt-2">
            <MediaClipUpload label="item media" existing={existingBlocks.item?.media?.[0]} onChange={(s) => setMediaState((p) => ({ ...p, item: s }))} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Response {hasResponseB && "A"}</label>
          <BoldTextarea className={inputClass} rows={2} value={responseAText} onChange={setResponseAText} />
          <div className="mt-2">
            <MediaClipUpload label="response media" existing={existingBlocks.response_a?.media?.[0]} onChange={(s) => setMediaState((p) => ({ ...p, response_a: s }))} />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
            <input type="checkbox" checked={hasResponseB} onChange={(e) => setHasResponseB(e.target.checked)} />
            This task compares two responses (pairwise)
          </label>
          {hasResponseB && (
            <>
              <label className={labelClass}>Response B</label>
              <BoldTextarea className={inputClass} rows={2} value={responseBText} onChange={setResponseBText} />
              <div className="mt-2">
                <MediaClipUpload label="response B media" existing={existingBlocks.response_b?.media?.[0]} onChange={(s) => setMediaState((p) => ({ ...p, response_b: s }))} />
              </div>
            </>
          )}
        </div>

        <div>
          <label className={labelClass}>Question</label>
          <BoldTextarea className={inputClass} rows={2} value={question} onChange={setQuestion} />
        </div>
      </div>

      {/* Response Mode */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <span className={sectionLabelClass}>Response Mode</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {([
            { value: "choice", label: "Choice", desc: "Pick an option. MCQ tasks." },
            { value: "written", label: "Written", desc: "Free text. Rationales, transcription." },
            { value: "choice_plus_written", label: "Choice + Written", desc: "Pick, then justify. Assessments." },
          ] as const).map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setResponseMode(m.value)}
              className={`text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                responseMode === m.value
                  ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <p className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>

        {responseMode !== "written" && (
          <div className="pt-2">
            <label className={labelClass}>Options &amp; Correct Answer</label>
            <OptionsEditor
              options={options}
              correctIndex={correctIndex}
              onChange={(opts, idx) => {
                setOptions(opts);
                setCorrectIndex(idx);
              }}
            />
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <span className={sectionLabelClass}>Answer &amp; Feedback</span>
        {responseMode !== "choice" && (
          <div>
            <label className={labelClass}>Model Answer</label>
            <BoldTextarea className={inputClass} rows={2} value={modelAnswer} onChange={setModelAnswer} />
          </div>
        )}
        <div>
          <label className={labelClass}>Explanation</label>
          <BoldTextarea className={inputClass} rows={2} value={explanation} onChange={setExplanation} />
        </div>
        <div>
          <label className={labelClass}>Reviewer Notes (the trap)</label>
          <BoldTextarea className={inputClass} rows={2} value={reviewerNotes} onChange={setReviewerNotes} />
        </div>
      </div>

      {/* Config */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3">
        <span className={sectionLabelClass}>Config</span>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
            Timed (Exam Practice mode)
          </label>
          {timed && (
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-500">Time limit (seconds)</label>
              <input type="number" className={`${inputClass} w-24`} value={timeLimitSeconds} onChange={(e) => setTimeLimitSeconds(e.target.value)} />
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>Failure Mode Tags</label>
          <MultiSelectTags options={FAILURE_MODE_TAGS} selected={failureModeTags} onChange={setFailureModeTags} />
        </div>
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
          {isEdit ? "Save Changes" : "Create Practice Task"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/practice-tasks")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
