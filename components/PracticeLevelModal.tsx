"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

type Level = "beginner" | "intermediate" | "expert";

const LEVELS: { value: Level; label: string; desc: string }[] = [
  {
    value: "beginner",
    label: "Beginner Level",
    desc: "Guided, easier tasks designed to build foundational skills.",
  },
  {
    value: "intermediate",
    label: "Intermediate Level",
    desc: "Realistic job-style tasks with moderate difficulty.",
  },
  {
    value: "expert",
    label: "Expert Level",
    desc: "Advanced assessment-style challenges with higher difficulty.",
  },
];

export default function PracticeLevelModal({
  domainLabel,
  isLevelUnlocked,
  onStart,
  onClose,
}: {
  domainLabel: string;
  isLevelUnlocked: (level: Level) => boolean;
  onStart: (level: Level) => void;
  onClose: () => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-lg w-full p-6 space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {domainLabel}
            </p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Select Practice Level
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose the level that matches your current skill and confidence.
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {LEVELS.map((level) => {
            const unlocked = isLevelUnlocked(level.value);
            const isSelected = selectedLevel === level.value;
            return (
              <button
                key={level.value}
                type="button"
                disabled={!unlocked}
                onClick={() => setSelectedLevel(level.value)}
                className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                  !unlocked
                    ? "border-slate-150 dark:border-slate-850 opacity-50 cursor-not-allowed"
                    : isSelected
                      ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 cursor-pointer"
                      : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 cursor-pointer"
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{level.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{level.desc}</p>
                </div>
                {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onStart(selectedLevel)}
            disabled={!isLevelUnlocked(selectedLevel)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Start Practice
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
