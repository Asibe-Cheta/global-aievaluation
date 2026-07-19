"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { createLesson, updateLesson, type LessonFormInput } from "@/lib/actions/admin-lessons";
import type { AdminLessonRow } from "@/lib/admin/queries";
import StringListEditor from "../../../StringListEditor";
import SkillBoostsEditor from "../../../SkillBoostsEditor";
import ExamplesEditor from "./ExamplesEditor";
import MiniCaseStudiesEditor from "./MiniCaseStudiesEditor";
import PracticeLabEditor from "./PracticeLabEditor";
import QuizEditor from "./QuizEditor";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";
const sectionLabelClass =
  "text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight block mb-2";

export default function LessonForm({
  moduleId,
  lesson,
}: {
  moduleId: string;
  lesson?: AdminLessonRow;
}) {
  const router = useRouter();
  const isEdit = !!lesson;

  const [id, setId] = useState(lesson?.id ?? "");
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [duration, setDuration] = useState(lesson?.duration ?? "");
  const [objectives, setObjectives] = useState<string[]>(lesson?.objectives ?? []);
  const [content, setContent] = useState<string[]>(lesson?.content ?? []);
  const [examples, setExamples] = useState(lesson?.examples ?? []);
  const [miniCaseStudies, setMiniCaseStudies] = useState(lesson?.mini_case_studies ?? []);
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>(
    lesson?.reflection_questions ?? [],
  );
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(lesson?.key_takeaways ?? []);
  const [practiceLab, setPracticeLab] = useState(lesson?.practice_lab ?? []);
  const [quiz, setQuiz] = useState(lesson?.quiz ?? []);
  const [skillBoosts, setSkillBoosts] = useState<Record<string, number>>(
    lesson?.skill_boosts ?? {},
  );
  const [sortOrder, setSortOrder] = useState(String(lesson?.sort_order ?? 0));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const input: LessonFormInput = {
      moduleId,
      title,
      description,
      duration,
      objectives,
      content,
      examples,
      miniCaseStudies,
      reflectionQuestions,
      keyTakeaways,
      practiceLab,
      quiz,
      skillBoosts,
      sortOrder: Number(sortOrder) || 0,
    };

    const result = isEdit
      ? await updateLesson(lesson!.id, input)
      : await createLesson(id, input);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug / ID</label>
          <input
            className={inputClass}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. m1_l7"
            disabled={isEdit}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input
            className={inputClass}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 15 min"
          />
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

      <div>
        <label className={sectionLabelClass}>Objectives</label>
        <StringListEditor items={objectives} onChange={setObjectives} rows={1} />
      </div>

      <div>
        <label className={sectionLabelClass}>Content Blocks</label>
        <StringListEditor
          items={content}
          onChange={setContent}
          rows={4}
          placeholder="Lecture paragraph text..."
        />
      </div>

      <div>
        <label className={sectionLabelClass}>Examples</label>
        <ExamplesEditor examples={examples} onChange={setExamples} />
      </div>

      <div>
        <label className={sectionLabelClass}>Mini Case Studies</label>
        <MiniCaseStudiesEditor caseStudies={miniCaseStudies} onChange={setMiniCaseStudies} />
      </div>

      <div>
        <label className={sectionLabelClass}>Reflection Questions</label>
        <StringListEditor items={reflectionQuestions} onChange={setReflectionQuestions} rows={1} />
      </div>

      <div>
        <label className={sectionLabelClass}>Key Takeaways</label>
        <StringListEditor items={keyTakeaways} onChange={setKeyTakeaways} rows={1} />
      </div>

      <div>
        <label className={sectionLabelClass}>Practice Lab</label>
        <PracticeLabEditor tasks={practiceLab} onChange={setPracticeLab} />
      </div>

      <div>
        <label className={sectionLabelClass}>Quiz</label>
        <QuizEditor quiz={quiz} onChange={setQuiz} />
      </div>

      <div>
        <label className={sectionLabelClass}>Skill Boosts on First Completion</label>
        <SkillBoostsEditor value={skillBoosts} onChange={setSkillBoosts} />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-850 sticky bottom-0 bg-white dark:bg-slate-900 py-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Lesson"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/modules/${moduleId}/lessons`)}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
