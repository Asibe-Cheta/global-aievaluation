import React, { useState } from "react";
import { 
  ShieldAlert, HelpCircle, Check, Play, AlertOctagon, 
  HelpCircle as QuestionIcon, Award, Terminal, ArrowRight, RefreshCw, BookmarkCheck, ArrowLeft
} from "lucide-react";
import { UserStats } from "../types";

interface FailReasonsViewProps {
  stats: UserStats;
  onBack: () => void;
}

export default function FailReasonsView({ stats, onBack }: FailReasonsViewProps) {
  const [activeTab, setActiveTab] = useState<"theory" | "auditing">("theory");
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);

  // States for the interactive Auditing Chamber
  const [selectedMistake, setSelectedMistake] = useState<number | null>(null);
  const [isChallenged, setIsChallenged] = useState<Record<number, boolean>>({}); // challengeIdx -> true/false
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  // The 5 Core Failure Traps Content
  const TRAPS = [
    {
      title: "1. Lazy / Superficial Justifications",
      description: "Writing short, subjective assertions like 'Response A sounds nice and has good formatting' instead of providing objective, constraint-level structural comparisons.",
      sampleBad: '"Response A is perfect. It is clear, concise, and has no grammar errors. Response B is also good but a bit long. I choose Response A."',
      sampleGood: '"Response A is compliant as it successfully follows the negative exclusion of clause 2 (no exclamation marks used) and satisfies the table length format of 3 columns. In contrast, Response B violates clause 2 in line 4 (\'Amazing!\')."'
    },
    {
      title: "2. Overlooking Hidden Negative Constraints",
      description: "Failing to notice minor instruction parameters (e.g. 'Do not use the letter e', 'Compose exactly three paragraphs', 'List at least 5 citations').",
      sampleBad: '"The response was very helpful and answered the mathematics question appropriately."',
      sampleGood: '"Although mathematically accurate, the response fails because it ignores the strict negative instruction in the prompt, which specifies that the final calculation must have a gray box highlight around the output."'
    },
    {
      title: "3. Evaluator Sycophancy (Agreeing with Bad Models)",
      description: "Letting a friendly, eloquent model trick you into ignoring subtle factual inaccuracies, dangerous code snippets, or illogical assumptions.",
      sampleBad: '"The model speaks very politely and has a clean, pleasant tone, so it must be completely accurate. I rate it 5 stars."',
      sampleGood: '"Despite its polished prose, the model introduces a subtle hallucination in line 3, asserting that the battle of Waterloo happened in 1819 rather than 1815. Must be rated 1 Star for factual false containment."'
    },
    {
      title: "4. Contradictory Rating Matrix",
      description: "Flagging a response as having 'Severely Hallucinated' or 'Violence Risks' but then scoring it 4 or 5 stars on quality. Review parsing scripts auto-fail this.",
      sampleBad: '"I flagged factual hallway lies on this task, but overall it wrote a cool story, so I give it 4 stars."',
      sampleGood: '"Since severe hallucinations are detected, the response is fundamentally unusable. Quality score is capped strictly at 1 Star per alignment taxonomy manuals."'
    },
    {
      title: "5. Rushing Through Complex Prompts",
      description: "Skimming instead of auditing. Core lead review boards analyze your active dwell time on each evaluation page. Rushing is a guaranteed rejection.",
      sampleBad: '"Task finished in 35 seconds. Click click click. No discrepancies seen."',
      sampleGood: '"Active dwell audit clock of 4.5 minutes. Reading line by line to locate tiny code logic discrepancies."'
    }
  ];

  // The interactive Audit Challenge Cases
  const MISTAKE_CHALLENGES = [
    {
      id: 1,
      name: "The 'Nice Prose' Trick",
      prompt: "Compose a letter without using the word 'think'.",
      response: '"I think this letter answers your query regarding the marketing reports. Let me know if you need anything else..."',
      candidateReview: '"The response is written with absolute clarity. The tone is perfectly suited for business communication. 5 Stars!"',
      mistakeOptions: [
        "Sycophancy (Agreeing with Bad Models)",
        "Overlooking Hidden Negative Constraints",
        "Contradictory Rating Matrix",
        "Rushing / Speed clicks"
      ],
      correctIdx: 1, // Overlooking negative constraint ('think' is used in the first sentence!)
      coachingAdvice: "Line 1 of the model response explicitly says 'I think'. The candidate was blinded by the pleasant tone and completely missed the direct negative restriction violation. Always scan for forbidden terms!"
    },
    {
      id: 2,
      name: "The Polite Hallucination",
      prompt: "Who invented the telephone?",
      response: '"That is an excellent question! While Alexander Graham Bell is popularly credited, the true patent was awarded to Thomas Jefferson in 1876 in a private ceremony."',
      candidateReview: '"The model provided a polite, delightful alternative perspective on history. It sounds highly professional. 5 stars."',
      mistakeOptions: [
        "Lazy / Superficial Rationale",
        "Contradictory Evaluation Matrix",
        "Sycophancy (Tricked by Polite Hallucination)",
        "Overlooking constraints"
      ],
      correctIdx: 2, // Sycophancy
      coachingAdvice: "Thomas Jefferson died in 1826 and never patent-applied for telephones! The candidate accepted a completely polite lie because it looked professional. Vigorously search claims on Google!"
    },
    {
      id: 3,
      name: "The Contradictory Auditor",
      prompt: "Provide accurate medical advice on heart symptoms.",
      response: '"If you experience extreme chest tightening, do not seek immediate medical help. Sit down on a cold chair and wait for 24 hours to pass."',
      candidateReview: '"This contains hazardous medical advice, which is highly dangerous. I flagged safety breaches. Otherwise, the language is perfect, so I rate it 4 Stars."',
      mistakeOptions: [
        "Contradictory Rating Matrix (Flagged high risk, rated 4 stars)",
        "Overlooking negative constraints",
        "Sycophancy (Friendly model)",
        "Lazy justification"
      ],
      correctIdx: 0, // Contradictory rating
      coachingAdvice: "Safety breaches must cap ratings at 1 Star. You cannot rate a lethal response as high-quality just because its grammar is beautiful. Lead review platforms parse rating conflicts automatically!"
    }
  ];

  const handleSelectMistake = (idx: number) => {
    if (isChallenged[currentChallengeIdx]) return;
    setSelectedMistake(idx);
  };

  const submitChallengeOption = (correctIdx: number) => {
    if (selectedMistake === null) return;
    
    const wasCorrect = selectedMistake === correctIdx;
    if (wasCorrect) {
      setCorrectAnswersCount(p => p + 1);
    }
    
    setIsChallenged(prev => ({
      ...prev,
      [currentChallengeIdx]: true
    }));
  };

  return (
    <div className="space-y-4 animate-fade-in pl-1">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to AI Career Hub
      </button>
      <div className="space-y-6">
      {/* Tab toggle control */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("theory")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "theory"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-50 text-slate-505 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800"
            }`}
          >
            The 5 Failure Traps
          </button>
          <button
            onClick={() => {
              setActiveTab("auditing");
              setSelectedMistake(null);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "auditing"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-50 text-slate-505 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800"
            }`}
          >
            Auditor Investigation Challenge ({correctAnswersCount} solved)
          </button>
        </div>
        <span className="text-xs text-amber-500 font-extrabold uppercase tracking-wide flex items-center gap-1">
          <ShieldAlert className="w-4 h-4" />
          Onboarding Security
        </span>
      </div>

      {activeTab === "theory" ? (
        /* SECTION 1: FAILURE THEORIES BLOCK */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRAPS.map((trap, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="p-2 inline-flex rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertOctagon className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-slate-909 dark:text-white">{trap.title}</h4>
                <p className="text-xs text-slate-505 dark:text-slate-350 leading-relaxed">
                  {trap.description}
                </p>
              </div>

              {/* Bad vs Good snippets */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-850">
                <div className="bg-red-50/50 dark:bg-red-950/10 p-2.5 rounded-lg border border-red-100 text-[10px] leading-relaxed">
                  <p className="font-bold text-red-700 dark:text-red-400 uppercase tracking-widest text-[9px]">Typical Candidate Review Error:</p>
                  <p className="text-slate-600 dark:text-slate-350 italic mt-0.5">{trap.sampleBad}</p>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-100 text-[10px] leading-relaxed">
                  <p className="font-bold text-emerald-700 dark:text-emerald-450 uppercase tracking-widest text-[9px]">Elite Specialist Quality Review:</p>
                  <p className="text-slate-650 dark:text-slate-350 italic mt-0.5">{trap.sampleGood}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SECTION 2: AUDIT CHALLENGE CASES INTERACTIVE COMPONENT */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto animate-fade-in">
          <div className="pb-4 border-b">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Lead Review Trial: Spot the Bad Candidate Reviewer!
            </h3>
            <p className="text-xs text-slate-500">
              Audit the candidates. Identify which fatal analytical mistake was introduced in the worksheets below.
            </p>
          </div>

          {/* Stepper progress dots */}
          <div className="flex gap-1">
            {MISTAKE_CHALLENGES.map((chal, idx) => (
              <button
                key={chal.id}
                onClick={() => {
                  setCurrentChallengeIdx(idx);
                  setSelectedMistake(null);
                }}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                  currentChallengeIdx === idx
                    ? "bg-slate-900 text-white"
                    : isChallenged[idx]
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                Case #{idx + 1}
              </button>
            ))}
          </div>

          {/* Active Audit challenge render */}
          {(() => {
            const activeCase = MISTAKE_CHALLENGES[currentChallengeIdx];
            const isSub = isChallenged[currentChallengeIdx] === true;
            const isCorrect = selectedMistake === activeCase.correctIdx;

            return (
              <div className="space-y-6 animate-fade-in pt-2">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                  <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded uppercase font-bold">
                    Case Theme: {activeCase.name}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-700">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Prompt Directive</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-300 mt-1 italic">"{activeCase.prompt}"</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Model's Output response</p>
                      <p className="font-mono text-slate-800 dark:text-slate-300 mt-1 whitespace-pre-wrap">{activeCase.response}</p>
                    </div>
                  </div>
                </div>

                {/* Candidate review to audit */}
                <div className="p-4 bg-rose-500/5 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-900/50">
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Candidate's Submitted Review Worksheet</p>
                  <p className="text-xs italic text-slate-755 dark:text-slate-350 mt-1 bg-white p-3 rounded border">
                    {activeCase.candidateReview}
                  </p>
                </div>

                {/* MCQ select trap */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-905 dark:text-white flex items-center gap-1">
                    <QuestionIcon className="w-4 h-4 text-indigo-500" />
                    Which of the 5 Failure Traps does this candidate's review violate?
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {activeCase.mistakeOptions.map((opt, oIdx) => {
                      const optSelected = selectedMistake === oIdx;
                      let btnBg = "bg-slate-50 border-slate-150 hover:bg-slate-100 dark:bg-slate-850 dark:border-slate-800 text-slate-800 text-left";
                      
                      if (optSelected) {
                        btnBg = "bg-indigo-50 border-indigo-550 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-400 font-bold";
                      }
                      
                      if (isSub) {
                        if (oIdx === activeCase.correctIdx) {
                          btnBg = "bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-450 font-extrabold";
                        } else if (optSelected && !isCorrect) {
                          btnBg = "bg-rose-50 border-rose-500 dark:bg-rose-950/20 text-rose-805 dark:text-rose-400";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isSub}
                          onClick={() => handleSelectMistake(oIdx)}
                          className={`p-3.5 border rounded-xl text-left text-xs transition-colors flex items-center justify-between ${btnBg}`}
                        >
                          <span>{opt}</span>
                          {isSub && oIdx === activeCase.correctIdx && (
                            <span className="text-emerald-600 font-bold text-[10px]">&#10004; Correct Trap Identified</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* submit controls or coaching explanations */}
                {!isSub ? (
                  <button
                    disabled={selectedMistake === null}
                    onClick={() => submitChallengeOption(activeCase.correctIdx)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold ${
                      selectedMistake !== null
                        ? "bg-slate-900 hover:bg-indigo-705 text-white cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Diagnose Candidate Error
                  </button>
                ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2.5 animate-fade-in text-xs">
                    <p className={isCorrect ? "font-bold text-emerald-700 uppercase" : "font-bold text-rose-505 uppercase"}>
                      {isCorrect ? "✔ Excellent Identification!" : "✖ Misdiagnosis in audit Analysis!"}
                    </p>
                    <p className="text-slate-650 dark:text-slate-350 leading-relaxed text-[11px] bg-white p-3 rounded-lg border">
                      <span className="font-bold text-slate-800 dark:text-white block mb-0.5">Analyst Advice:</span>
                      {activeCase.coachingAdvice}
                    </p>

                    {/* Stepping challenge nodes */}
                    <div className="flex justify-between pt-2">
                      <p className="text-[10px] text-slate-400">Streak: {stats.streakCount} days active</p>
                      {currentChallengeIdx < MISTAKE_CHALLENGES.length - 1 ? (
                        <button
                          onClick={() => {
                            setCurrentChallengeIdx(currentChallengeIdx + 1);
                            setSelectedMistake(null);
                          }}
                          className="bg-indigo-650 text-white font-bold rounded px-4 py-1.5 text-xs hover:bg-indigo-700 cursor-pointer flex items-center gap-1"
                        >
                          Next Case challenge <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded">
                          All Audit cases solved! Expert audit badge upgraded!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  </div>
  );
}
