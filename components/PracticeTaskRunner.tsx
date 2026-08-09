"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, Lock, Sparkles, ChevronRight,
} from "lucide-react";
import type { PracticeTask, PracticeTaskSubmission, UserStats } from "@/types";
import { renderFormattedText } from "./LessonContentRenderer";

function ContentBlock({
  label,
  block,
}: {
  label: string;
  block?: { text: string; media: { type: "image" | "video" | "audio"; url: string }[] };
}) {
  if (!block || (!block.text && (!block.media || block.media.length === 0))) return null;
  const media = block.media?.[0];

  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">{label}</span>
      {block.text && (
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {renderFormattedText(block.text)}
        </p>
      )}
      {media && (
        <div className="rounded-xl overflow-hidden border border-slate-150 dark:border-slate-800 max-w-md">
          {media.type === "image" ? (
            <img src={media.url} alt="" className="w-full object-contain max-h-72" />
          ) : media.type === "video" ? (
            <video src={media.url} controls className="w-full max-h-72 bg-black" />
          ) : (
            <audio src={media.url} controls className="w-full" />
          )}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  existing,
  onSubmit,
}: {
  task: PracticeTask;
  existing?: PracticeTaskSubmission;
  onSubmit: (submission: PracticeTaskSubmission) => void;
}) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | undefined>(
    existing?.selectedOptionIndex,
  );
  const [writtenAnswer, setWrittenAnswer] = useState(existing?.writtenAnswer ?? "");
  const [submitted, setSubmitted] = useState(!!existing);
  const [secondsRemaining, setSecondsRemaining] = useState(task.timeLimitSeconds ?? 0);

  useEffect(() => {
    if (!task.timed || submitted || !task.timeLimitSeconds) return;
    if (secondsRemaining <= 0) return;
    const t = setTimeout(() => setSecondsRemaining((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [task.timed, task.timeLimitSeconds, secondsRemaining, submitted]);

  const needsChoice = task.responseMode !== "written";
  const needsWritten = task.responseMode !== "choice";
  const canSubmit =
    (!needsChoice || selectedOptionIndex !== undefined) &&
    (!needsWritten || writtenAnswer.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const submission: PracticeTaskSubmission = {
      selectedOptionIndex,
      writtenAnswer: needsWritten ? writtenAnswer : undefined,
      submittedAt: new Date().toISOString(),
    };
    setSubmitted(true);
    onSubmit(submission);
  };

  const isCorrect =
    selectedOptionIndex !== undefined && task.options[selectedOptionIndex]?.isCorrect;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      {task.timed && task.timeLimitSeconds && !submitted && (
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-150">
            <Clock className="w-3.5 h-3.5" /> {formatTime(secondsRemaining)}
          </span>
        </div>
      )}

      <ContentBlock label="Guideline" block={task.guideline} />
      <ContentBlock label="Item" block={task.item} />
      <ContentBlock label={task.responseB ? "Response A" : "Response"} block={task.responseA} />
      {task.responseB && <ContentBlock label="Response B" block={task.responseB} />}

      <div>
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1.5">Question</span>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{task.question}</p>
      </div>

      {needsChoice && (
        <div className="space-y-2">
          {task.options.map((opt, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const showResult = submitted;
            return (
              <button
                key={idx}
                type="button"
                disabled={submitted}
                onClick={() => setSelectedOptionIndex(idx)}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                  showResult && opt.isCorrect
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
                    : showResult && isSelected && !opt.isCorrect
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
                      : isSelected
                        ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-slate-900 dark:text-white"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-indigo-300"
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      )}

      {needsWritten && (
        <div>
          <textarea
            disabled={submitted}
            value={writtenAnswer}
            onChange={(e) => setWrittenAnswer(e.target.value)}
            rows={4}
            placeholder="Write your answer..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
          />
        </div>
      )}

      {!submitted ? (
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
            canSubmit
              ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      ) : (
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
          {needsChoice && (
            <p className={`text-xs font-bold flex items-center gap-1.5 ${isCorrect ? "text-emerald-600" : "text-rose-500"}`}>
              {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {isCorrect ? "Correct" : "Not quite"}
            </p>
          )}
          {task.modelAnswer && (
            <div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Model Answer</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{task.modelAnswer}</p>
            </div>
          )}
          {task.explanation && (
            <div>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Explanation</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{task.explanation}</p>
            </div>
          )}
          {task.reviewerNotes && (
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Reviewer Notes</span>
              <p className="text-xs text-slate-700 dark:text-slate-300">{task.reviewerNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticeTaskRunner({
  tasks,
  existingSubmissions,
  onSubmit,
  onBack,
  isPaidUser,
  onRequireUpgrade,
  filter,
}: {
  tasks: PracticeTask[];
  existingSubmissions: Record<string, PracticeTaskSubmission>;
  onSubmit: (taskId: string, submission: PracticeTaskSubmission) => void;
  onBack: () => void;
  isPaidUser: boolean;
  onRequireUpgrade: () => void;
  filter: "timed" | "untimed";
}) {
  const filtered = tasks.filter((t) => (filter === "timed" ? t.timed : !t.timed));

  if (!isPaidUser) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-lg text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex p-4.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {filter === "timed" ? "Exam Practice" : "Real World Practice"} Locked
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Upgrade to Professional or Career Accelerator to unlock the full practice-task bank.
        </p>
        <button
          onClick={onRequireUpgrade}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pl-1 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {filter === "timed" ? "Exam Practice" : "Real World Practice"}
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          {filter === "timed"
            ? "Timed evaluation tasks under exam conditions."
            : "Untimed evaluation and annotation tasks with feedback as you go."}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-450">
          No practice tasks available yet.
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              existing={existingSubmissions[task.id]}
              onSubmit={(submission) => onSubmit(task.id, submission)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
