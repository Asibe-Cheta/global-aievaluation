"use client";

import type { AdminExample } from "@/lib/admin/queries";
import CollapsibleCard from "../../../CollapsibleCard";

const inputClass =
  "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-[10px] text-slate-455 font-bold uppercase tracking-wider block mb-1";

interface ExamplesEditorProps {
  examples: AdminExample[];
  onChange: (examples: AdminExample[]) => void;
}

const EMPTY_EXAMPLE: AdminExample = {
  title: "",
  prompt: "",
  response: "",
  rating: "",
  justification: "",
};

export default function ExamplesEditor({ examples, onChange }: ExamplesEditorProps) {
  const updateExample = (idx: number, patch: Partial<AdminExample>) => {
    const next = [...examples];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const addExample = () => onChange([...examples, { ...EMPTY_EXAMPLE }]);
  const removeExample = (idx: number) => onChange(examples.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {examples.map((ex, idx) => (
        <CollapsibleCard
          key={idx}
          title={`Example ${idx + 1}${ex.title ? `: ${ex.title}` : ""}`}
          onRemove={() => removeExample(idx)}
        >
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={ex.title}
              onChange={(e) => updateExample(idx, { title: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Prompt</label>
            <textarea
              className={inputClass}
              rows={2}
              value={ex.prompt}
              onChange={(e) => updateExample(idx, { prompt: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Response</label>
            <textarea
              className={inputClass}
              rows={2}
              value={ex.response}
              onChange={(e) => updateExample(idx, { response: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Rating</label>
            <input
              className={inputClass}
              value={ex.rating}
              onChange={(e) => updateExample(idx, { rating: e.target.value })}
              placeholder="e.g. Excellent, Needs Work"
            />
          </div>
          <div>
            <label className={labelClass}>Justification</label>
            <textarea
              className={inputClass}
              rows={2}
              value={ex.justification}
              onChange={(e) => updateExample(idx, { justification: e.target.value })}
            />
          </div>
        </CollapsibleCard>
      ))}
      <button
        type="button"
        onClick={addExample}
        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
      >
        + Add Example
      </button>
    </div>
  );
}
