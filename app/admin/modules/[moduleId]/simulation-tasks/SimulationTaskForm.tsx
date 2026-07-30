"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  createSimulationTask,
  updateSimulationTask,
  type SimulationTaskFormInput,
} from "@/lib/actions/admin-simulation-tasks";
import type { AdminSimulationTaskRow } from "@/lib/admin/queries";
import OptionsEditor from "../../../OptionsEditor";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";

const TASK_TYPES = [
  "ranking",
  "fact_checking",
  "instruction_following",
  "safety",
  "annotation",
  "logic",
  "reasoning",
];

export default function SimulationTaskForm({
  moduleId,
  task,
}: {
  moduleId: string;
  task?: AdminSimulationTaskRow;
}) {
  const router = useRouter();
  const isEdit = !!task;

  const [id, setId] = useState(task?.id ?? "");
  const [type, setType] = useState(task?.type ?? "ranking");
  const [title, setTitle] = useState(task?.title ?? "");
  const [prompt, setPrompt] = useState(task?.prompt ?? "");
  const [responses, setResponses] = useState<{ letter: string; text: string }[]>(
    task?.responses ?? [],
  );
  const [responseSingle, setResponseSingle] = useState(task?.response_single ?? "");
  const [response, setResponse] = useState(task?.response ?? "");
  const [options, setOptions] = useState<string[]>(task?.options ?? []);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(
    task?.correct_option_index ?? 0,
  );
  const [idealJustificationKeywords, setIdealJustificationKeywords] = useState(
    (task?.ideal_justification_keywords ?? []).join(", "),
  );
  const [rubric, setRubric] = useState(task?.rubric ?? "");
  const [explanation, setExplanation] = useState(task?.explanation ?? "");
  const [idealRating, setIdealRating] = useState(
    task?.ideal_rating != null ? String(task.ideal_rating) : "",
  );
  const [hallucination, setHallucination] = useState(
    task?.ideal_flags?.hallucination ?? false,
  );
  const [safety, setSafety] = useState(task?.ideal_flags?.safety ?? false);
  const [formatting, setFormatting] = useState(
    task?.ideal_flags?.formatting ?? false,
  );
  const [category, setCategory] = useState(task?.category ?? "");
  const [sortOrder, setSortOrder] = useState(String(task?.sort_order ?? 0));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addResponse = () => setResponses([...responses, { letter: "", text: "" }]);
  const updateResponse = (idx: number, field: "letter" | "text", value: string) => {
    const next = [...responses];
    next[idx] = { ...next[idx], [field]: value };
    setResponses(next);
  };
  const removeResponse = (idx: number) =>
    setResponses(responses.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const input: SimulationTaskFormInput = {
      moduleId,
      type,
      title,
      prompt,
      responses,
      responseSingle,
      response,
      options,
      correctOptionIndex,
      idealJustificationKeywords,
      rubric,
      explanation,
      idealRating: idealRating ? Number(idealRating) : null,
      idealFlags: { hallucination, safety, formatting },
      category,
      sortOrder: Number(sortOrder) || 0,
    };

    const result = isEdit
      ? await updateSimulationTask(task!.id, id, input)
      : await createSimulationTask(id, input);

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
            placeholder="e.g. sim_m2_task1"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Prompt</label>
          <textarea
            className={inputClass}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {type === "ranking" ? (
          <div className="sm:col-span-2 space-y-2">
            <label className={labelClass}>Responses to Rank (letter + text)</label>
            {responses.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <input
                  className={`${inputClass} w-16 shrink-0`}
                  value={r.letter}
                  onChange={(e) => updateResponse(idx, "letter", e.target.value)}
                  placeholder="A"
                />
                <textarea
                  className={inputClass}
                  rows={2}
                  value={r.text}
                  onChange={(e) => updateResponse(idx, "text", e.target.value)}
                  placeholder="Response text..."
                />
                <button
                  type="button"
                  onClick={() => removeResponse(idx)}
                  className="text-rose-500 hover:text-rose-600 text-xs font-bold px-2 shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addResponse}
              className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
            >
              + Add Response
            </button>
          </div>
        ) : (
          <>
            <div className="sm:col-span-2">
              <label className={labelClass}>Single Response</label>
              <textarea
                className={inputClass}
                rows={3}
                value={responseSingle}
                onChange={(e) => setResponseSingle(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Response (alternate field)</label>
              <textarea
                className={inputClass}
                rows={3}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
          </>
        )}

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
          <label className={labelClass}>Ideal Justification Keywords (comma-separated)</label>
          <input
            className={inputClass}
            value={idealJustificationKeywords}
            onChange={(e) => setIdealJustificationKeywords(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Rubric</label>
          <textarea
            className={inputClass}
            rows={2}
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
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
          <label className={labelClass}>Ideal Rating (optional)</label>
          <input
            type="number"
            className={inputClass}
            value={idealRating}
            onChange={(e) => setIdealRating(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} />
        </div>

        <div className="sm:col-span-2 flex items-center gap-6">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={hallucination}
              onChange={(e) => setHallucination(e.target.checked)}
              className="w-4 h-4"
            />
            Hallucination Flag
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={safety}
              onChange={(e) => setSafety(e.target.checked)}
              className="w-4 h-4"
            />
            Safety Flag
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={formatting}
              onChange={(e) => setFormatting(e.target.checked)}
              className="w-4 h-4"
            />
            Formatting Flag
          </label>
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
          {isEdit ? "Save Changes" : "Create Simulation Task"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/modules/${moduleId}/simulation-tasks`)}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
