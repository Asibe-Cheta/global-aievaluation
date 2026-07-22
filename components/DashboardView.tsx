import React from "react";
import {
  BookOpen, Play, BadgeCheck, Zap, Target, Lock, Clock, ChevronRight, ArrowRight, Gauge, ShieldAlert
} from "lucide-react";
import { UserStats, Rank, Module } from "../types";

interface DashboardViewProps {
  stats: UserStats;
  currentRank: Rank;
  overallReadiness: number;
  activeModule: Module;
  moduleCurriculum: Module[];
  setActiveTab: (tab: string) => void;
  startLesson: (lessonId: string) => void;
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  setActivePartId?: (partId: string | null) => void;
}

export default function DashboardView({
  stats,
  currentRank,
  overallReadiness,
  activeModule,
  moduleCurriculum,
  setActiveTab,
  startLesson,
  activeModuleId,
  setActiveModuleId,
  setActivePartId
}: DashboardViewProps) {

  // Calculate completed metrics for overall curriculum
  const completedCount = stats.completedLessons.length;
  const totalLessons = moduleCurriculum.flatMap(m => m.lessons).length;
  const overallProgressPercent = totalLessons > 0
    ? Math.min(100, Math.round((completedCount / totalLessons) * 100))
    : 0;

  // A brand-new profile's display_name defaults to the email's local part
  // (see handle_new_user() in supabase/migrations/0001_init.sql) — that's not
  // a real name, so don't greet the user with their raw email handle.
  const emailLocalPart = stats.email?.split("@")[0];
  const hasRealName = !!stats.displayName && stats.displayName !== emailLocalPart;
  const firstName = hasRealName ? stats.displayName!.split(" ")[0] : null;

  // Part 2 Metrics
  const part2Lessons = ["p2_intro", "p2_m1_l1", "p2_m1_l2", "p2_m1_l3", "p2_m1_l4", "p2_m1_l5", "p2_m1_l6", "p2_m1_l7"];
  const part2CompletedCount = stats.completedLessons.filter(id => part2Lessons.includes(id)).length;
  const part2Percent = Math.min(100, Math.round((part2CompletedCount / part2Lessons.length) * 100));
  const activePart2LessonId = !stats.completedLessons.includes("p2_intro")
    ? "p2_intro"
    : !stats.completedLessons.includes("p2_m1_l1") 
      ? "p2_m1_l1" 
      : !stats.completedLessons.includes("p2_m1_l2")
        ? "p2_m1_l2"
        : !stats.completedLessons.includes("p2_m1_l3")
          ? "p2_m1_l3"
          : !stats.completedLessons.includes("p2_m1_l4")
            ? "p2_m1_l4"
            : !stats.completedLessons.includes("p2_m1_l5")
              ? "p2_m1_l5"
              : !stats.completedLessons.includes("p2_m1_l6")
                ? "p2_m1_l6"
                : "p2_m1_l7";

  // Find recommended next lesson
  // We go through Level 1 lessons first
  const nextLesson = activeModule.lessons.find(l => !stats.completedLessons.includes(l.id)) || activeModule.lessons[0];

  // Helper to map actual module lessons to custom screenshot labels beautifully
  const getLessonDisplayDetails = (lessonId: string, originalTitle: string, originalDuration: string, index: number) => {
    if (lessonId === "l1") {
      return {
        title: "How AI Trainers Get Paid to Improve AI",
        duration: "15m",
        numStr: "01"
      };
    }
    if (lessonId === "l2") {
      return {
        title: "AI Learning Fundamentals",
        duration: "25m",
        numStr: "02"
      };
    }
    if (lessonId === "l3") {
      return {
        title: "Post-Submission Lifecycle",
        duration: "15m",
        numStr: "03"
      };
    }
    if (lessonId === "l4") {
      return {
        title: "Advanced Hallucination Detection",
        duration: "40m",
        numStr: "04"
      };
    }
    return {
      title: originalTitle,
      duration: originalDuration.replace(" min", "m"),
      numStr: String(index + 1).padStart(2, "0")
    };
  };

  // Determine resume lesson display title and descriptions to match screenshot perfectly
  const resumeLessonDisplayTitle = nextLesson.id === "l2" ? "Lesson 2: AI Learning" : `Lesson ${activeModule.lessons.indexOf(nextLesson) + 1}: ${nextLesson.title}`;
  const resumeLessonDescription = nextLesson.id === "l2"
    ? "Master the core mechanics of artificial intelligence training, Reinforcement Learning from Human Feedback (RLHF)."
    : nextLesson.description || "In-depth training modules designed to prep you for the qualification exams.";

  // Determine subsequent lesson for "Next: ..." preview text
  const nextIndex = activeModule.lessons.indexOf(nextLesson);
  const subsequentLesson = activeModule.lessons[nextIndex + 1];
  const subsequentText = nextLesson.id === "l2"
    ? "Next: Post-Submission (15 min)"
    : subsequentLesson 
      ? `Next: ${subsequentLesson.title} (${subsequentLesson.duration})`
      : "Next: Qualification Exam";

  return (
    <div id="dashboard-view" className="space-y-6 animate-fade-in pl-1">
      
      {/* 1. Minimalist Welcoming Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here is your training progress for today.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setActiveTab("readiness")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5" />
            Readiness Scores
          </button>
          <button
            onClick={() => setActiveTab("fail_reasons")}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Why Evaluators Fail
          </button>
        </div>
      </div>

      {/* 2. Dual Metrics Grid Rows */}
      <div id="stats-grid" className="grid grid-cols-1 gap-4">
        
        {/* Metric Card 1: Overall Progress */}
        <div className="bg-white dark:bg-slate-900 border border-[#DCE4FF] dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col justify-center relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F2F5FF] dark:bg-indigo-950/30 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block leading-none mb-1">
                  Overall Progress
                </span>
                <span className="text-lg font-extrabold text-[#4F46E5] dark:text-indigo-400 block leading-none">
                  {overallProgressPercent}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-450 dark:text-slate-400 block font-medium">
                {completedCount}/{totalLessons} Lessons
              </span>
            </div>
          </div>
          
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-[#4F46E5] dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Resume Learning Feature Card */}
      <div className="bg-[#F2F5FF] dark:bg-slate-900/60 border border-[#DCE4FF] dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Subtle Decorative gears in the background */}
        <div className="absolute right-0 top-0 bottom-0 w-32 h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden flex items-center justify-center">
          <svg className="w-24 h-24 text-slate-900 dark:text-white fill-current animate-spin" style={{ animationDuration: "20s" }} viewBox="0 0 24 24">
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
          </svg>
        </div>

        <div className="space-y-3 relative z-10">
          <span className="inline-flex items-center bg-[#E5ECFF] text-[#3F51B5] dark:bg-indigo-950 dark:text-indigo-300 text-[10px] uppercase font-extrabold px-3 py-1 rounded-full tracking-wider leading-none">
            Resume Learning
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {resumeLessonDisplayTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            {resumeLessonDescription}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-center self-start sm:self-center shrink-0 relative z-10 mt-2 sm:mt-0">
          <button 
            onClick={() => startLesson(nextLesson.id)}
            className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold py-3 px-6 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Continue</span>
          </button>
          <p className="text-[11px] text-slate-450 dark:text-slate-500 font-semibold mt-2.5">
            {subsequentText}
          </p>
        </div>
      </div>

      {/* Subscription Tier — slim status banner, not competing with the learning CTA above */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shrink-0 ${
            stats.membershipTier === "career_accelerator"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
              : stats.membershipTier === "professional"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                : "bg-slate-150 text-slate-700 dark:bg-slate-800 dark:text-slate-350"
          }`}>
            {stats.membershipTier ? stats.membershipTier.replace("_", " ") : "starter"} plan
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {stats.membershipTier === "career_accelerator"
              ? "Full access unlocked, including the Career Accelerator Hub."
              : stats.membershipTier === "professional"
                ? "Upgrade to Career Accelerator for human expert coaching."
                : "Upgrade to unlock the AI Interview Simulator and practice platforms."}
          </span>
        </div>

        <button
          onClick={() => setActiveTab(stats.membershipTier === "career_accelerator" ? "accelerator" : "membership")}
          className="shrink-0 py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span>{stats.membershipTier === "career_accelerator" ? "Open Accelerator Hub" : "Upgrade Plan"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. Syllabus Overview Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Curriculum Syllabus Parts
          </h2>
          <button 
            onClick={() => {
              setActivePartId?.(null);
              setActiveTab("modules");
            }}
            className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:underline cursor-pointer transition-colors"
          >
            Expand Curriculum
          </button>
        </div>

        <hr className="border-slate-100 dark:border-slate-850 my-4" />

        {/* Horizontal Syllabus Parts List */}
        <div className="space-y-4">
          {/* Part 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider leading-none bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                  PART 1
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-405 font-mono">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                    6 Modules
                  </span>
                  <span>&bull;</span>
                  <span>11 Lessons</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                AI Evaluation Foundations & RLHF Core
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                Master human-in-the-loop training, pairwise evaluations, fact-checking, and negative constraint compliance across 6 comprehensive modules.
              </p>
            </div>

            {/* Browse action — the quick-continue path already lives in the Resume Learning card above */}
            <div className="flex items-center lg:justify-end shrink-0 w-full sm:w-auto">
              <button
                onClick={() => {
                  setActivePartId?.("part1");
                  setActiveTab("modules");
                }}
                className="w-full sm:w-auto py-2 px-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 shrink-0 whitespace-nowrap"
              >
                View Track
              </button>
            </div>
          </div>

          {/* Part 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all">
            <div className="absolute top-3 right-3 lg:static bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider self-start lg:self-auto">
              Active Track
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider leading-none bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                  PART 2
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-405 font-mono">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                    1 Module
                  </span>
                  <span>&bull;</span>
                  <span>2 Lessons</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Professional AI Evaluation Skills
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                Learn how professional AI evaluators review responses, use structured workflows, and evaluate key dimensions.
              </p>
            </div>

            {/* Progress and Button */}
            <div className="flex flex-col sm:flex-row sm:items-center lg:justify-end gap-4 shrink-0 w-full sm:w-auto lg:w-[350px]">
              <div className="space-y-1 flex-1 sm:max-w-[150px] w-full">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-450 dark:text-slate-500 font-semibold">
                    Part 2 Progress
                  </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {part2Percent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${part2Percent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setActivePartId?.("part2");
                    setActiveTab("modules");
                  }}
                  className="w-full sm:w-auto py-2 px-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 shrink-0 whitespace-nowrap"
                >
                  View Track
                </button>
                <button
                  onClick={() => {
                    if (stats.membershipTier === "starter" && activePart2LessonId !== "p2_m1_l1") {
                      setActivePartId?.("part2");
                      setActiveTab("modules");
                    } else {
                      startLesson(activePart2LessonId);
                    }
                  }}
                  className="w-full sm:w-auto py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm transition-all whitespace-nowrap"
                >
                  <span>
                    {!stats.completedLessons.includes("p2_m1_l1") 
                      ? "Start Lesson 1" 
                      : !stats.completedLessons.includes("p2_m1_l2")
                        ? "Start Lesson 2"
                        : !stats.completedLessons.includes("p2_m1_l3")
                          ? "Start Lesson 3"
                          : !stats.completedLessons.includes("p2_m1_l4")
                            ? "Start Lesson 4"
                            : !stats.completedLessons.includes("p2_m1_l5")
                              ? "Start Lesson 5"
                              : !stats.completedLessons.includes("p2_m1_l6")
                                ? "Start Lesson 6"
                                : !stats.completedLessons.includes("p2_m1_l7")
                                  ? "Start Lesson 7"
                                  : "Review Lesson 1"
                    }
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Part 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 opacity-75 relative overflow-hidden">
            <div className="absolute top-3 right-3 lg:static bg-slate-100 dark:bg-slate-800/80 lg:bg-transparent text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider self-start lg:self-auto">
              <Lock className="w-2.5 h-2.5 lg:hidden" /> Coming Soon
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider leading-none bg-slate-100 text-slate-400 dark:bg-slate-805 dark:text-slate-500">
                  PART 3
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-405 font-mono">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    4 Modules
                  </span>
                  <span>&bull;</span>
                  <span>5 Lessons</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                RLHF Optimization & Reward Modeling
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                Master advanced pairwise comparative algorithms, RLHF reward optimization, and drafting long, analytical justifications that clear lead QA manual audits.
              </p>
            </div>

            <div className="flex items-center lg:justify-end gap-4 shrink-0 w-full sm:w-auto lg:w-[280px]">
              <button
                disabled
                className="w-full lg:w-auto py-2 px-4 bg-slate-50 text-slate-400 dark:bg-slate-855 dark:text-slate-650 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Track Locked</span>
              </button>
            </div>
          </div>

          {/* Part 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 opacity-75 relative overflow-hidden">
            <div className="absolute top-3 right-3 lg:static bg-slate-100 dark:bg-slate-800/80 lg:bg-transparent text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider self-start lg:self-auto">
              <Lock className="w-2.5 h-2.5 lg:hidden" /> Coming Soon
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full tracking-wider leading-none bg-slate-100 text-slate-400 dark:bg-slate-805 dark:text-slate-500">
                  PART 4
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-405 font-mono">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400" />
                    3 Modules
                  </span>
                  <span>&bull;</span>
                  <span>3 Lessons</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Expert Red-Teaming & Safety Guardrails
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                Stress-test security boundaries using jailbreaks, identify medical and financial liabilities, audit privacy protection rules, and run adversarial evaluations.
              </p>
            </div>

            <div className="flex items-center lg:justify-end gap-4 shrink-0 w-full sm:w-auto lg:w-[280px]">
              <button
                disabled
                className="w-full lg:w-auto py-2 px-4 bg-slate-50 text-slate-400 dark:bg-slate-855 dark:text-slate-650 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Track Locked</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
