"use client";

import type { AdminPracticeTask } from "@/lib/admin/queries";
import CollapsibleCard from "../../../CollapsibleCard";
import StringListEditor from "../../../StringListEditor";

const inputClass =
  "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-[10px] text-slate-455 font-bold uppercase tracking-wider block mb-1";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface PracticeLabEditorProps {
  tasks: AdminPracticeTask[];
  onChange: (tasks: AdminPracticeTask[]) => void;
}

export default function PracticeLabEditor({ tasks, onChange }: PracticeLabEditorProps) {
  const updateTask = (idx: number, patch: Partial<AdminPracticeTask>) => {
    const next = [...tasks];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const addTask = () =>
    onChange([
      ...tasks,
      {
        id: newId("task"),
        client: "",
        taskType: "",
        instructions: "",
        prompt: "",
        response: "",
        rubrics: [],
        idealResponseKeywords: [],
        idealResponseLength: 0,
      },
    ]);

  const removeTask = (idx: number) => onChange(tasks.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {tasks.map((task, idx) => (
        <CollapsibleCard
          key={task.id}
          title={`Practice Task ${idx + 1}${task.client ? `: ${task.client}` : ""}`}
          onRemove={() => removeTask(idx)}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Client</label>
              <input
                className={inputClass}
                value={task.client}
                onChange={(e) => updateTask(idx, { client: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Task Type</label>
              <input
                className={inputClass}
                value={task.taskType}
                onChange={(e) => updateTask(idx, { taskType: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Instructions</label>
            <textarea
              className={inputClass}
              rows={2}
              value={task.instructions}
              onChange={(e) => updateTask(idx, { instructions: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Prompt</label>
            <textarea
              className={inputClass}
              rows={2}
              value={task.prompt}
              onChange={(e) => updateTask(idx, { prompt: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Response</label>
            <textarea
              className={inputClass}
              rows={2}
              value={task.response}
              onChange={(e) => updateTask(idx, { response: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Rubrics</label>
            <StringListEditor
              items={task.rubrics}
              onChange={(rubrics) => updateTask(idx, { rubrics })}
              rows={1}
            />
          </div>
          <div>
            <label className={labelClass}>Ideal Response Keywords</label>
            <StringListEditor
              items={task.idealResponseKeywords}
              onChange={(idealResponseKeywords) =>
                updateTask(idx, { idealResponseKeywords })
              }
              rows={1}
            />
          </div>
          <div>
            <label className={labelClass}>Ideal Response Length (words)</label>
            <input
              type="number"
              className={inputClass}
              value={task.idealResponseLength}
              onChange={(e) =>
                updateTask(idx, { idealResponseLength: Number(e.target.value) || 0 })
              }
            />
          </div>
        </CollapsibleCard>
      ))}
      <button
        type="button"
        onClick={addTask}
        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline"
      >
        + Add Practice Task
      </button>
    </div>
  );
}
