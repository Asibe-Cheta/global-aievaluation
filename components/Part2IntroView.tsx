import React from "react";
import { ArrowLeft, ChevronRight, Check, Lock, BookOpen } from "lucide-react";
import { hasAcademyAccess, type MembershipTier } from "../lib/access";

interface Part2IntroViewProps {
  onBack: () => void;
  onBegin?: () => void;
  completedLessons?: string[];
  onStartLesson?: (lessonId: string) => void;
  membershipTier?: MembershipTier;
}

export default function Part2IntroView({
  onBack,
  onBegin,
  completedLessons = [],
  onStartLesson,
  membershipTier = "free"
}: Part2IntroViewProps) {
  const locked = !hasAcademyAccess(membershipTier);
  
  const part2LessonIds = [
    "p2_intro",
    "p2_m1_l1",
    "p2_m1_l2",
    "p2_m1_l3",
    "p2_m1_l4",
    "p2_m1_l5",
    "p2_m1_l6",
    "p2_m1_l7"
  ];

  const completedCount = completedLessons.filter(id => part2LessonIds.includes(id)).length;
  const totalCount = part2LessonIds.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in pb-20">
      
      {/* Sleek, minimal back navigation */}
      <div className="mb-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Curriculum Tracks
        </button>
      </div>

      {/* Part 2 Track Header Card (Capturing Intro & Duration) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
              Curriculum Track Overview
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            Part 2: Professional AI Evaluation Skills
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Master the practical methodologies used by top AI labs. Learn how to analyze instructions, spot hallucinations, evaluate helpfulness, and draft professional calibration justifications.
          </p>

          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Lessons: </span>
              <span className="font-bold text-slate-800 dark:text-white">
                {completedCount} / {totalCount} complete
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Total Duration: </span>
              <span className="font-bold text-slate-800 dark:text-white">
                110 min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacious, Elegant Lesson Selector Cards */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Part 2 Learning Track Modules
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Complete the following modules to unlock higher certifications and simulations:
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Card 0: Module Introduction */}
          {(() => {
            const isCompleted = completedLessons.includes("p2_intro");
            const isActive = !isCompleted;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isActive 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Module Intro
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Welcome & Evaluation Framework
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Get a high-level welcome and structured overview of the seven core evaluation dimensions used across professional AI evaluation projects.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_intro") : onBegin?.()}
                  className="w-full md:w-auto py-3 px-6 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{isCompleted ? "Review Intro" : "Start Intro"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })()}

          {/* Lesson 1 Card */}
          {(() => {
            const isL1Completed = completedLessons.includes("p2_m1_l1");
            const isIntroCompleted = completedLessons.includes("p2_intro");
            const isL1Active = isIntroCompleted && !isL1Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL1Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 1
                    </span>
                    {isL1Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    How Professional AI Evaluators Review Responses
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Master the structured, dimension-based review workflow. Learn about the 7 evaluation metrics and how to draft clear rationales.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l1") : onBegin?.()}
                  className="w-full md:w-auto py-3 px-6 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{isL1Completed ? "Review Lesson" : "Start Lesson"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            );
          })()}

          {/* Lesson 2 Card */}
          {(() => {
            const isL2Completed = completedLessons.includes("p2_m1_l2");
            const isL1Completed = completedLessons.includes("p2_m1_l1");
            const isL2Active = isL1Completed && !isL2Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL2Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 2
                    </span>
                    {isL2Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Instruction Following Evaluation
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Deep dive into instruction following (the absolute highest-priority metric). Master explicit vs implicit criteria, and evaluate 5 real-world case studies.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l2") : onBegin?.()}
                  className={`w-full md:w-auto py-3 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    locked
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Unlock</span>
                    </>
                  ) : (
                    <>
                      <span>{isL2Completed ? "Review Lesson" : "Start Lesson"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Lesson 3 Card */}
          {(() => {
            const isL3Completed = completedLessons.includes("p2_m1_l3");
            const isL2Completed = completedLessons.includes("p2_m1_l2");
            const isL3Active = isL2Completed && !isL3Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL3Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 3
                    </span>
                    {isL3Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Accuracy & Factuality Evaluation
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Understand factual errors, hallucinations, and unsupported claims. Learn how professional AI evaluators verify accuracy across 5 key case studies.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l3") : onBegin?.()}
                  className={`w-full md:w-auto py-3 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    locked
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Unlock</span>
                    </>
                  ) : (
                    <>
                      <span>{isL3Completed ? "Review Lesson" : "Start Lesson"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Lesson 4 Card */}
          {(() => {
            const isL4Completed = completedLessons.includes("p2_m1_l4");
            const isL3Completed = completedLessons.includes("p2_m1_l3");
            const isL4Active = isL3Completed && !isL4Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL4Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 4
                    </span>
                    {isL4Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Completeness & Helpfulness Evaluation
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Distinguish between technically correct and genuinely useful responses. Master evaluation under career coaching, traveling, personal finance, wellness, and cooking assistants.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l4") : onBegin?.()}
                  className={`w-full md:w-auto py-3 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    locked
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Unlock</span>
                    </>
                  ) : (
                    <>
                      <span>{isL4Completed ? "Review Lesson" : "Start Lesson"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Lesson 5 Card */}
          {(() => {
            const isL5Completed = completedLessons.includes("p2_m1_l5");
            const isL4Completed = completedLessons.includes("p2_m1_l4");
            const isL5Active = isL4Completed && !isL5Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL5Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 5
                    </span>
                    {isL5Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Clarity, Tone & Audience Alignment
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Evaluate whether an AI response is easy to understand, matches the user's expected style and emotional tone, and perfectly speaks to the intended reader.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l5") : onBegin?.()}
                  className={`w-full md:w-auto py-3 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    locked
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Unlock</span>
                    </>
                  ) : (
                    <>
                      <span>{isL5Completed ? "Review Lesson" : "Start Lesson"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Lesson 6 Card */}
          {(() => {
            const isL6Completed = completedLessons.includes("p2_m1_l6");
            const isL5Completed = completedLessons.includes("p2_m1_l5");
            const isL6Active = isL5Completed && !isL6Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL6Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 6
                    </span>
                    {isL6Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Context Tracking & Information Retrieval Evaluation
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Evaluate whether an AI correctly retrieves and applies information from previous context, handles personalization, and distinguishes relevant vs irrelevant history.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l6") : onBegin?.()}
                  className={`w-full md:w-auto py-3 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    locked
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Unlock</span>
                    </>
                  ) : (
                    <>
                      <span>{isL6Completed ? "Review Lesson" : "Start Lesson"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Lesson 7 Card */}
          {(() => {
            const isL7Completed = completedLessons.includes("p2_m1_l7");
            const isL6Completed = completedLessons.includes("p2_m1_l6");
            const isL7Active = isL6Completed && !isL7Completed;
            return (
              <div className={`bg-white dark:bg-slate-900 rounded-[20px] p-6 sm:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs border-2 ${
                isL7Active 
                  ? "border-[#4F46E5] dark:border-[#6366F1] shadow-md shadow-indigo-50/50 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800"
              } hover:border-[#4F46E5] dark:hover:border-[#6366F1]`}>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Lesson 7
                    </span>
                    {isL7Completed && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Response Ranking & Preference Evaluation
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                    Compare multiple AI responses objectively, distinguish between major and minor quality differences, handle close tie decisions, and write calibration-quality ranking rationales.
                  </p>
                </div>
                <button
                  onClick={() => onStartLesson ? onStartLesson("p2_m1_l7") : onBegin?.()}
                  className={`w-full md:w-auto py-3 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    locked
                      ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                  }`}
                >
                  {locked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Upgrade to Unlock</span>
                    </>
                  ) : (
                    <>
                      <span>{isL7Completed ? "Review Lesson" : "Start Lesson"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
