import React, { useState } from "react";
import {
  ArrowLeft,
  Tags,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  XCircle,
  ChevronRight,
  HelpCircle,
  ShieldAlert,
  Lock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Module, UserStats, AnnotationTask, AnnotationSubmission } from "../types";
import { renderFormattedText } from "./LessonContentRenderer";

interface AnnotationViewProps {
  moduleCurriculum: Module[];
  stats: UserStats;
  onSubmit: (taskId: string, submission: AnnotationSubmission) => void;
  onBack: () => void;
  isPaidUser: boolean;
  onRequireUpgrade: () => void;
}

function TaskReview({
  task,
  moduleTitle,
  existing,
  onSubmit,
  onBack,
  isPaidUser,
  onRequireUpgrade,
}: {
  task: AnnotationTask;
  moduleTitle: string;
  existing?: AnnotationSubmission;
  onSubmit: (taskId: string, submission: AnnotationSubmission) => void;
  onBack: () => void;
  isPaidUser: boolean;
  onRequireUpgrade: () => void;
}) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | undefined>(
    existing?.selectedOptionIndex,
  );
  const [rationale, setRationale] = useState(existing?.rationale ?? "");
  const [isSubmitted, setIsSubmitted] = useState(!!existing);

  const hasChosen = selectedOptionIndex !== undefined;
  const isCorrect = selectedOptionIndex === task.correctOptionIndex;

  const handleSubmit = () => {
    if (selectedOptionIndex === undefined || !rationale.trim()) return;
    onSubmit(task.id, {
      selectedOptionIndex,
      rationale,
      submittedAt: new Date().toISOString(),
    });
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setSelectedOptionIndex(undefined);
    setRationale("");
    setIsSubmitted(false);
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
            {renderFormattedText(task.instructions)}
          </p>
        )}
      </div>

      <div className={`grid gap-4 ${task.media.length > 1 ? "sm:grid-cols-2" : "grid-cols-1 max-w-xl"}`}>
        {task.media.map((item, idx) => (
          <div
            key={item.path}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
          >
            {task.type === "video" ? (
              <video src={item.url} controls className="w-full rounded-xl bg-black max-h-72" />
            ) : task.type === "audio" ? (
              <audio src={item.url} controls className="w-full" />
            ) : (
              <img
                src={item.url}
                alt={`Annotation subject ${idx + 1}`}
                className="w-full rounded-xl object-cover max-h-72"
              />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {task.scenario && (
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
            <span className="text-[9px] bg-slate-200 dark:bg-slate-750 text-slate-650 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Context
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic mt-2">{renderFormattedText(task.scenario)}</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-550" />
            {renderFormattedText(task.question)}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {task.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              let optionBg =
                "bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-350";

              if (isSelected) {
                optionBg =
                  "bg-indigo-50/20 border-indigo-550 dark:bg-indigo-950/10 text-indigo-900 dark:text-indigo-400 font-medium";
              }
              if (isSubmitted) {
                if (idx === task.correctOptionIndex) {
                  optionBg =
                    "bg-emerald-50/30 border-emerald-500 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 font-semibold";
                } else if (isSelected && !isCorrect) {
                  optionBg = "bg-rose-50/30 border-rose-500 dark:bg-rose-950/20 text-rose-800 dark:text-rose-450";
                }
              }
              if (!isPaidUser) {
                optionBg =
                  "bg-slate-50/60 dark:bg-slate-850/60 border-slate-150 dark:border-slate-800 text-slate-400 dark:text-slate-500";
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted || !isPaidUser}
                  onClick={() => setSelectedOptionIndex(idx)}
                  className={`text-left p-4.5 rounded-xl border text-xs transition-all flex justify-between items-center ${optionBg} ${
                    !isSubmitted && isPaidUser ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <span>{opt}</span>
                  {!isPaidUser && <Lock className="w-3.5 h-3.5 shrink-0" />}
                  {isPaidUser && isSubmitted && idx === task.correctOptionIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  {isPaidUser && isSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {!isSubmitted && isPaidUser && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white">Your Rationale</p>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="Explain why you chose this answer..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {!isPaidUser ? (
          <button
            onClick={onRequireUpgrade}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Professional to Submit
          </button>
        ) : !isSubmitted ? (
          <button
            disabled={!hasChosen || !rationale.trim()}
            onClick={handleSubmit}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              hasChosen && rationale.trim()
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Submit Annotation
          </button>
        ) : (
          <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-450"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-450"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              )}
              <p className="text-xs font-extrabold uppercase tracking-wider">
                {isCorrect ? "Nice Job! That's Correct." : "Not Quite! Let's Learn Why."}
              </p>
              {!isCorrect && isPaidUser && (
                <button
                  onClick={handleRetake}
                  className="ml-auto shrink-0 flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retake
                </button>
              )}
            </div>

            {rationale && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Rationale</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">{rationale}</p>
              </div>
            )}

            {task.explanation && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-1">Why is this correct?</p>
                <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {renderFormattedText(task.explanation)}
                </p>
              </div>
            )}

            {task.reviewerNotes && (
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" />
                  Trainer Tip
                </p>
                <p className="text-xs italic text-amber-900 dark:text-amber-300 mt-1">{renderFormattedText(task.reviewerNotes)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnnotationView({
  moduleCurriculum,
  stats,
  onSubmit,
  onBack,
  isPaidUser,
  onRequireUpgrade,
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
        isPaidUser={isPaidUser}
        onRequireUpgrade={onRequireUpgrade}
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
          Review image, video, and audio content the way real AI-training platforms do: answer the question and justify your rationale.
        </p>
      </div>

      {!isPaidUser && (
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/30 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-800 dark:text-indigo-300">
            <Lock className="w-4 h-4 shrink-0" />
            <span>You can preview these tasks for free — upgrade to submit annotations and track your annotation skill score.</span>
          </div>
          <button
            onClick={onRequireUpgrade}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2 rounded-lg text-[11px] transition-colors cursor-pointer"
          >
            Upgrade
          </button>
        </div>
      )}

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
                    {renderFormattedText(task.instructions)}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {task.type === "video" ? (
                      <Video className="w-3 h-3" />
                    ) : task.type === "audio" ? (
                      <Music className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                    {task.type === "video" ? "Video" : task.type === "audio" ? "Audio" : "Image pair"}
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
