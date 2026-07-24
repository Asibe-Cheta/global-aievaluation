"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  createExamQuestion,
  updateExamQuestion,
  type ExamQuestionFormInput,
} from "@/lib/actions/admin-exam-questions";
import type { AdminExamQuestionRow, AdminModuleRow } from "@/lib/admin/queries";
import OptionsEditor from "../OptionsEditor";

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
  const [type, setType] = useState<ExamQuestionFormInput["type"]>(
    (question?.type as ExamQuestionFormInput["type"]) ?? "mcq",
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

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const input: ExamQuestionFormInput = {
      moduleId,
      type,
      category,
      question: questionText,
      options,
      correctOptionIndex,
      explanation,
      part,
      scenario,
      sortOrder: Number(sortOrder) || 0,
    };

    const result = isEdit
      ? await updateExamQuestion(question!.id, input)
      : await createExamQuestion(id, input);

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
            onChange={(e) => setType(e.target.value as ExamQuestionFormInput["type"])}
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
