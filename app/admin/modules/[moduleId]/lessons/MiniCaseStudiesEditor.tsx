"use client";

import type { AdminMiniCaseStudy } from "@/lib/admin/queries";
import CollapsibleCard from "../../../CollapsibleCard";
import OptionsEditor from "../../../OptionsEditor";

const inputClass =
  "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-[10px] text-slate-455 font-bold uppercase tracking-wider block mb-1";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface MiniCaseStudiesEditorProps {
  caseStudies: AdminMiniCaseStudy[];
  onChange: (caseStudies: AdminMiniCaseStudy[]) => void;
}

export default function MiniCaseStudiesEditor({
  caseStudies,
  onChange,
}: MiniCaseStudiesEditorProps) {
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
      },
    ]);

  const removeCase = (idx: number) => onChange(caseStudies.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {caseStudies.map((cs, idx) => (
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
      ))}
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
