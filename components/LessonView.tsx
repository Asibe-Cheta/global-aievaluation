import React, { useState } from "react";
import { 
  ArrowLeft, ArrowRight, Check, CheckCircle2, XCircle, 
  HelpCircle, RefreshCw, Send, Terminal, Key, ShieldAlert, BadgeCheck, AlertCircle
} from "lucide-react";
import { Lesson, UserStats, MiniCaseStudy, CaseStudyMediaItem } from "../types";

interface LessonViewProps {
  lesson: Lesson;
  stats: UserStats;
  onBack: () => void;
  onComplete: (quizScore: number, practicePerformance: Record<string, any>) => void;
}

export default function LessonView({ lesson, stats, onBack, onComplete }: LessonViewProps) {
  const [currentSection, setCurrentSection] = useState<"lecture" | "cases">("lecture");

  // Section 2 / 3: Lecture page scrolling
  const [readIndex, setReadIndex] = useState(0);

  // Section 4: Mini Case Studies State
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedCaseAnswers, setSelectedCaseAnswers] = useState<Record<string, number>>({}); // caseId -> chosenIndex
  const [caseSubmitted, setCaseSubmitted] = useState<Record<string, boolean>>({}); // caseId -> true
  const [caseRationales, setCaseRationales] = useState<Record<string, string>>({}); // caseId -> rationale text
  const [showWrapUp, setShowWrapUp] = useState(false);

  // General Case Studies score count
  const completedCaseCount = Object.keys(caseSubmitted).filter(k => k.startsWith(lesson.id)).length;

  // Handler for Mini Case Study choices
  const handleCaseSelect = (caseStudy: MiniCaseStudy, optionIdx: number) => {
    if (caseSubmitted[caseStudy.id]) return;
    setSelectedCaseAnswers(prev => ({ ...prev, [caseStudy.id]: optionIdx }));
  };

  const submitCaseAnswer = (caseStudy: MiniCaseStudy) => {
    if (selectedCaseAnswers[caseStudy.id] === undefined) return;
    if (!caseRationales[caseStudy.id]?.trim()) return;
    setCaseSubmitted(prev => ({ ...prev, [caseStudy.id]: true }));
  };

  const retakeCaseAnswer = (caseStudy: MiniCaseStudy) => {
    setCaseSubmitted(prev => {
      const next = { ...prev };
      delete next[caseStudy.id];
      return next;
    });
    setSelectedCaseAnswers(prev => {
      const next = { ...prev };
      delete next[caseStudy.id];
      return next;
    });
    setCaseRationales(prev => {
      const next = { ...prev };
      delete next[caseStudy.id];
      return next;
    });
  };

  const isCasesDone = lesson.miniCaseStudies.every(cs => caseSubmitted[cs.id]);

  const handleFinishLesson = () => {
    onComplete(100, { [`case_rationales_${lesson.id}`]: caseRationales });
  };

  const renderFormattedText = (text: string) => {
    if (!text.includes('**')) return <span>{text}</span>;
    const parts = text.split('**');
    return (
      <span>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} className="font-extrabold text-slate-900 dark:text-white">{part}</strong>;
          }
          return part;
        })}
      </span>
    );
  };

  // Markdown-style headings: "## Subheading" or "### Smaller Subheading" on
  // their own line, either as a whole content block or a line within one.
  const headingMatch = (line: string): { level: 2 | 3; text: string } | null => {
    const m = line.match(/^(#{2,3})\s+(.*)/);
    if (!m) return null;
    return { level: m[1].length === 2 ? 2 : 3, text: m[2] };
  };

  const renderHeading = (level: 2 | 3, text: string, key: number | string) =>
    level === 2 ? (
      <h3 key={key} className="text-base font-extrabold text-slate-900 dark:text-white pt-2">
        {renderFormattedText(text)}
      </h3>
    ) : (
      <h4 key={key} className="text-sm font-extrabold text-slate-800 dark:text-slate-100 pt-1">
        {renderFormattedText(text)}
      </h4>
    );

  const renderBlockMedia = (media: CaseStudyMediaItem | undefined, key: number | string) => {
    if (!media) return null;
    if (media.type === "image") {
      return (
        <img
          key={key}
          src={media.url}
          alt=""
          className="rounded-xl max-h-80 w-auto object-contain"
        />
      );
    }
    if (media.type === "video") {
      return (
        <video
          key={key}
          src={media.url}
          controls
          className="rounded-xl max-h-80 w-auto bg-black"
        />
      );
    }
    return <audio key={key} src={media.url} controls className="w-full max-w-md" />;
  };

  const renderParagraph = (p: string, pIndex: number, media?: CaseStudyMediaItem) => {
    if (!p.includes('\n')) {
      const asHeading = headingMatch(p.trim());
      if (asHeading) {
        return (
          <React.Fragment key={pIndex}>
            {renderHeading(asHeading.level, asHeading.text, `${pIndex}-h`)}
            {renderBlockMedia(media, `${pIndex}-m`)}
          </React.Fragment>
        );
      }
      return (
        <div key={pIndex} className="space-y-3">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">
            {renderFormattedText(p)}
          </p>
          {renderBlockMedia(media, `${pIndex}-m`)}
        </div>
      );
    }

    const lines = p.split('\n');
    return (
      <div key={pIndex} className="space-y-2.5 my-3">
        {lines.map((line, lIndex) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIndex} className="h-2" />;

          const asHeading = headingMatch(trimmed);
          if (asHeading) return renderHeading(asHeading.level, asHeading.text, lIndex);

          // Check for bullet list (e.g. • or - or *)
          const bulletMatch = trimmed.match(/^([•\-\*])\s*(.*)/);
          if (bulletMatch) {
            return (
              <div key={lIndex} className="flex items-start gap-2.5 pl-4 animate-fade-in">
                <span className="text-[#4F46E5] dark:text-indigo-400 font-extrabold select-none mt-0.5 shrink-0 text-base leading-none">•</span>
                <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-350 flex-1">
                  {renderFormattedText(bulletMatch[2])}
                </span>
              </div>
            );
          }

          // Check for numbered list (e.g. 1. 2.)
          const numberMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numberMatch) {
            return (
              <div key={lIndex} className="flex items-start gap-2.5 pl-4 animate-fade-in">
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-md min-w-[20px] text-center select-none shrink-0 mt-0.5 leading-none">
                  {numberMatch[1]}
                </span>
                <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-350 flex-1">
                  {renderFormattedText(numberMatch[2])}
                </span>
              </div>
            );
          }

          return (
            <p key={lIndex} className="text-sm leading-relaxed text-slate-700 dark:text-slate-350">
              {renderFormattedText(line)}
            </p>
          );
        })}
        {renderBlockMedia(media, `${pIndex}-m`)}
      </div>
    );
  };

  return (
    <div id="lesson-interactive-workspace" className="space-y-6 max-w-5xl mx-auto pl-1 pb-12 animate-fade-in">
      {/* Header back button & Status Tracker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-[#DCE4FF] dark:border-slate-800 p-3 rounded-2xl shadow-xs">
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 hover:text-[#4F46E5] dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Syllabus
        </button>
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[10px] text-slate-400 font-bold mr-1.5 uppercase tracking-wider shrink-0">Progress:</span>
          <button 
            onClick={() => setCurrentSection("lecture")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 ${
              currentSection === "lecture" 
                ? "bg-[#4F46E5] text-white shadow-xs" 
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            1. Lectures
          </button>
          <button 
            onClick={() => setCurrentSection("cases")}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all shrink-0 relative ${
              currentSection === "cases" 
                ? "bg-[#4F46E5] text-white shadow-xs" 
                : "bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 hover:bg-slate-100"
            }`}
          >
            2. Case Studies
            <span className="ml-1 text-[9px] opacity-75">({completedCaseCount}/5)</span>
            {isCasesDone && <span className="absolute -top-1 -right-1 text-emerald-500 font-bold text-[9px] bg-white rounded-full">✓</span>}
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE STEPS */}
       {/* STEP 1: LECTURES */}
      {currentSection === "lecture" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Primary reading deck */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {lesson.title}
              </h2>
            </div>

            {/* Lecture paragraph scroller */}
            <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed text-slate-700 dark:text-slate-350 space-y-4">
              {lesson.content.map((block, i) => renderParagraph(block.text, i, block.media?.[0]))}
            </div>

            {/* Progress buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex justify-end">
              <button 
                onClick={() => setCurrentSection("cases")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                Proceed to Mini Case Studies
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MINI CASE STUDIES */}
      {currentSection === "cases" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {!showWrapUp && (
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-855">
            <div>
              <p className="text-xs text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
                Part 2: Real Examples & Practice
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Practice with real scenarios ({completedCaseCount} of 5 done)
              </h3>
            </div>
            {/* Case selector stepper dot indicator */}
            <div className="flex gap-1.5">
              {lesson.miniCaseStudies.map((cs, idx) => (
                <button
                  key={cs.id}
                  onClick={() => setCaseIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                    caseIndex === idx 
                      ? "bg-indigo-600 text-white" 
                      : caseSubmitted[cs.id]
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-350"
                        : "bg-slate-50 text-slate-500 dark:bg-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Render Active Case details */}
          {!showWrapUp && (() => {
            const activeCase = lesson.miniCaseStudies[caseIndex];
            const hasChosen = selectedCaseAnswers[activeCase.id] !== undefined;
            const isSub = caseSubmitted[activeCase.id] === true;
            const isCorrect = selectedCaseAnswers[activeCase.id] === activeCase.correctOptionIndex;

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Scenario details split cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-2">
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-750 text-slate-650 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Special Rules to Follow
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic">{activeCase.scenario}</p>
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-450 uppercase font-bold">User's Question:</p>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{activeCase.prompt}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-850 space-y-2">
                    <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-750 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      AI's Answer
                    </span>
                    <pre className="text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg max-h-48 overflow-y-auto mt-1">
                      {activeCase.response}
                    </pre>
                  </div>
                </div>

                {activeCase.media && activeCase.media.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeCase.media.map((m) => (
                      <div key={m.path} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                        {m.type === "video" ? (
                          <video src={m.url} controls className="w-full rounded-lg bg-black max-h-56" />
                        ) : (
                          <audio src={m.url} controls className="w-full" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* MCQ Question segment */}
                <div id="case-study-mcq" className="space-y-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-550" />
                    {activeCase.question}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {activeCase.options.map((opt, idx) => {
                      const isSelected = selectedCaseAnswers[activeCase.id] === idx;
                      let optionBg = "bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 border-slate-150 dark:border-slate-800 text-slate-800 dark:text-slate-350";
                      
                      if (isSelected) {
                        optionBg = "bg-indigo-50/20 border-indigo-550 dark:bg-indigo-950/10 text-indigo-900 dark:text-indigo-400 font-medium";
                      }
                      if (isSub) {
                        if (idx === activeCase.correctOptionIndex) {
                          optionBg = "bg-emerald-50/30 border-emerald-500 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 font-semibold";
                        } else if (isSelected && !isCorrect) {
                          optionBg = "bg-rose-50/30 border-rose-500 dark:bg-rose-950/20 text-rose-800 dark:text-rose-450";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isSub}
                          onClick={() => handleCaseSelect(activeCase, idx)}
                          className={`text-left p-4.5 rounded-xl border text-xs transition-all flex justify-between items-center ${optionBg} ${
                            !isSub ? "cursor-pointer" : "cursor-default"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSub && idx === activeCase.correctOptionIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {isSub && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rationale — required before submitting, to practice justifying the choice */}
                {!isSub && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Your Rationale
                    </p>
                    <textarea
                      placeholder="Explain why you chose this answer..."
                      value={caseRationales[activeCase.id] || ""}
                      onChange={(e) => setCaseRationales(prev => ({ ...prev, [activeCase.id]: e.target.value }))}
                      className="w-full h-20 p-3 border border-slate-200 dark:border-slate-750 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                )}
                {isSub && caseRationales[activeCase.id] && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Rationale</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{caseRationales[activeCase.id]}</p>
                  </div>
                )}

                {/* Submissions button details */}
                {!isSub ? (
                  <button
                    disabled={!hasChosen || !caseRationales[activeCase.id]?.trim()}
                    onClick={() => submitCaseAnswer(activeCase)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      hasChosen && caseRationales[activeCase.id]?.trim()
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4 animate-fade-in">
                    {/* Exercise Feedback Panel */}
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      isCorrect 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-450" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-450"
                    }`}>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider">
                          {isCorrect ? "Nice Job! That's Correct." : "Not Quite! Let's Learn Why."}
                        </p>
                        <p className="text-xs mt-1 opacity-90">
                          {isCorrect
                            ? "Great job! You spotted the correct answer perfectly."
                            : "Don't worry! Mistakes are part of learning. Let's see why this answer is the right one."}
                        </p>
                      </div>
                      {!isCorrect && (
                        <button
                          onClick={() => retakeCaseAnswer(activeCase)}
                          className="ml-auto shrink-0 flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retake
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl border text-xs ${
                        isCorrect 
                          ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/10" 
                          : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/10"
                      }`}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Answer</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-350">
                          {activeCase.options[selectedCaseAnswers[activeCase.id]]}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-xl text-xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Correct Answer</span>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                          {activeCase.options[activeCase.correctOptionIndex]}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-1">Why is this correct?</p>
                      <p className="text-xs text-slate-750 dark:text-slate-350 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {activeCase.explanation}
                      </p>
                    </div>

                    {activeCase.reviewerNotes && (
                      <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4" />
                          Trainer Tip
                        </p>
                        <p className="text-xs italic text-amber-900 dark:text-amber-300 mt-1">
                          {activeCase.reviewerNotes}
                        </p>
                      </div>
                    )}
                    {/* Stepping controls */}
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => {
                          if (caseIndex > 0) {
                            setCaseIndex(caseIndex - 1);
                          }
                        }}
                        disabled={caseIndex === 0}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
                      >
                        &larr; Prev Case
                      </button>
                      
                      {caseIndex < lesson.miniCaseStudies.length - 1 ? (
                        <button
                          onClick={() => setCaseIndex(caseIndex + 1)}
                          className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg px-4 py-1.5 text-xs transition-colors cursor-pointer"
                        >
                          Next Case study &rarr;
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowWrapUp(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-4 py-1.5 text-xs transition-colors cursor-pointer"
                        >
                          Complete Case Studies Block
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Wrap-up: shown once all case studies are submitted */}
          {showWrapUp && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <p className="text-xs text-indigo-650 dark:text-indigo-400 font-extrabold uppercase tracking-widest">
                  Case Studies Complete
                </p>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Nice work — here's what to remember
                </h3>
              </div>

              <div className="bg-indigo-550/10 border border-indigo-550/20 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 leading-snug">
                  Key Takeaways
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {lesson.keyTakeaways.map((take, i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className="text-indigo-600 font-bold leading-none">&#10004;</span>
                      <span className="text-slate-700 dark:text-slate-350">{take}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setShowWrapUp(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  &larr; Back to Case Studies
                </button>
                <button
                  onClick={handleFinishLesson}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  Finish Lesson & Save Progress
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
