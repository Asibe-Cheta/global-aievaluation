import React, { useState } from "react";
import {
  ArrowLeft,
  Tags,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Module, UserStats, AnnotationTask, AnnotationSubmission } from "../types";

interface AnnotationViewProps {
  moduleCurriculum: Module[];
  stats: UserStats;
  onSubmit: (taskId: string, submission: AnnotationSubmission) => void;
  onBack: () => void;
}

function ChipToggle({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
        selected
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700"
      }`}
    >
      {label}
    </button>
  );
}

function TaskReview({
  task,
  moduleTitle,
  existing,
  onSubmit,
  onBack,
}: {
  task: AnnotationTask;
  moduleTitle: string;
  existing?: AnnotationSubmission;
  onSubmit: (taskId: string, submission: AnnotationSubmission) => void;
  onBack: () => void;
}) {
  const [labelsPerItem, setLabelsPerItem] = useState<string[][]>(
    existing?.labelsPerItem ?? task.media.map(() => []),
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [justSubmitted, setJustSubmitted] = useState(false);

  const toggleLabel = (itemIdx: number, label: string) => {
    setLabelsPerItem((prev) => {
      const next = prev.map((labels) => [...labels]);
      const current = next[itemIdx] ?? [];
      next[itemIdx] = current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label];
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit(task.id, {
      labelsPerItem,
      notes,
      submittedAt: new Date().toISOString(),
    });
    setJustSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pl-1 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Annotation Tasks
      </button>

      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {moduleTitle}
        </span>
        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {task.title}
        </h1>
        {task.instructions && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {task.instructions}
          </p>
        )}
      </div>

      {justSubmitted && (
        <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold m-0">
            Annotation submitted. Your Annotation skill score has been updated.
          </p>
        </div>
      )}

      <div className={`grid gap-6 ${task.media.length > 1 ? "sm:grid-cols-2" : "grid-cols-1 max-w-xl"}`}>
        {task.media.map((item, idx) => (
          <div
            key={item.path}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3"
          >
            {task.type === "video" ? (
              <video src={item.url} controls className="w-full rounded-xl bg-black max-h-72" />
            ) : (
              <img
                src={item.url}
                alt={`Annotation subject ${idx + 1}`}
                className="w-full rounded-xl object-cover max-h-72"
              />
            )}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
                {task.type === "video" ? "Labels" : `Labels — Image ${idx + 1}`}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {task.labelOptions.length === 0 && (
                  <span className="text-[11px] text-slate-400">No label options configured.</span>
                )}
                {task.labelOptions.map((label) => (
                  <ChipToggle
                    key={label}
                    label={label}
                    selected={(labelsPerItem[idx] ?? []).includes(label)}
                    onClick={() => toggleLabel(idx, label)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider block">
          Notes / Rationale
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Briefly explain what you observed and why you chose these labels..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
      >
        {existing ? "Update Submission" : "Submit Annotation"}
      </button>
    </div>
  );
}

export default function AnnotationView({
  moduleCurriculum,
  stats,
  onSubmit,
  onBack,
}: AnnotationViewProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const tasksWithModule = moduleCurriculum.flatMap((m) =>
    (m.annotationTasks ?? []).map((t) => ({ task: t, moduleTitle: m.title })),
  );

  const selected = tasksWithModule.find((t) => t.task.id === selectedTaskId);

  if (selected) {
    return (
      <TaskReview
        task={selected.task}
        moduleTitle={selected.moduleTitle}
        existing={stats.annotationSubmissions?.[selected.task.id]}
        onSubmit={onSubmit}
        onBack={() => setSelectedTaskId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pl-1">
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Tags className="w-5 h-5 text-indigo-500" />
          Data Annotation Practice
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-normal">
          Review image and video content the way real AI-training platforms do: tag what you see, flag issues, and justify your labels.
        </p>
      </div>

      {tasksWithModule.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <Tags className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-950 dark:text-white">No annotation tasks yet</p>
          <p className="text-xs text-slate-400 mt-1">Check back soon — new tasks are added regularly.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tasksWithModule.map(({ task, moduleTitle }) => {
            const isDone = !!stats.annotationSubmissions?.[task.id];
            return (
              <button
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    {moduleTitle}
                  </span>
                  {isDone && (
                    <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-150 dark:border-emerald-900/30 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      DONE
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">{task.title}</h3>
                {task.instructions && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {task.instructions}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {task.type === "video" ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    {task.type === "video" ? "Video" : "Image pair"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
