"use client";

import type { AdminQuizQuestion } from "@/lib/admin/queries";
import CollapsibleCard from "../../../CollapsibleCard";
import OptionsEditor from "../../../OptionsEditor";

const inputClass =
  "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-[10px] text-slate-455 font-bold uppercase tracking-wider block mb-1";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface QuizEditorProps {
  quiz: AdminQuizQuestion[];
  onChange: (quiz: AdminQuizQuestion[]) => void;
}

export default function QuizEditor({ quiz, onChange }: QuizEditorProps) {
  const updateQuestion = (idx: number, patch: Partial<AdminQuizQuestion>) => {
    const next = [...quiz];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const addQuestion = () =>
    onChange([
      ...quiz,
      {
        id: newId("quiz"),
        type: "mcq",
        question: "",
        options: ["", ""],
        correctOptionIndex: 0,
        explanation: "",
      },
    ]);

  const removeQuestion = (idx: number) => onChange(quiz.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {quiz.map((q, idx) => (
        <CollapsibleCard
          key={q.id}
          title={`Question ${idx + 1}${q.question ? `: ${q.question.slice(0, 50)}` : ""}`}
          onRemove={() => removeQuestion(idx)}
        >
          <div>
            <label className={labelClass}>Type</label>
            <select
              className={inputClass}
              value={q.type}
              onChange={(e) =>
                updateQuestion(idx, {
                  type: e.target.value as AdminQuizQuestion["type"],
                })
              }
            >
              <option value="mcq">mcq</option>
              <option value="tf">tf</option>
              <option value="scenario">scenario</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Question</label>
            <textarea
              className={inputClass}
              rows={2}
              value={q.question}
              onChange={(e) => updateQuestion(idx, { question: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Options &amp; Correct Answer</label>
            <OptionsEditor
              options={q.options}
              correctIndex={q.correctOptionIndex}
              onChange={(opts, correctIdx) =>
                updateQuestion(idx, { options: opts, correctOptionIndex: correctIdx })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Explanation</label>
            <textarea
              className={inputClass}
              rows={2}
              value={q.explanation}
              onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
            />
          </div>
        </CollapsibleCard>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
      >
        + Add Quiz Question
      </button>
    </div>
  );
}
