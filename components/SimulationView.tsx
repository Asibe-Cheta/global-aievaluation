import React, { useState, useEffect, useRef } from "react";
import {
  Terminal, Award, Star, AlertTriangle, Play, HelpCircle,
  ChevronRight, ArrowRight, ShieldCheck, CornerDownRight, Zap, ArrowLeft,
  Clock, RotateCcw, CheckCircle2, FileText, Printer, Check, Lock, Sparkles
} from "lucide-react";
import { UserStats, SimulationTask, ExamQuestion } from "../types";
import { SIMULATION_TASKS, EXAM_QUESTIONS } from "../data/modules";

interface SimulationViewProps {
  stats: UserStats;
  onComplete: (score: number, strengths: string[], weaknesses: string[]) => void;
  isUnlocked: boolean;
  onBypass: () => void;
  onBack: () => void;
  simulationTasks?: SimulationTask[];

  // Added Exam view properties
  isExamUnlocked: boolean;
  examQuestions?: ExamQuestion[];
  onExamComplete: (score: number) => void;
  initialMode?: "sandbox" | "exam" | "interview";

  // Membership gating: content previews are visible to everyone, but
  // starting the sandbox/exam requires a paid plan.
  isPaidUser: boolean;
  onRequireUpgrade: () => void;
}

export default function SimulationView({
  stats,
  onComplete,
  isUnlocked,
  onBypass,
  onBack,
  simulationTasks,
  isExamUnlocked,
  examQuestions,
  onExamComplete,
  initialMode = "sandbox",
  isPaidUser,
  onRequireUpgrade,
}: SimulationViewProps) {
  const [simMode, setSimMode] = useState<"sandbox" | "exam" | "interview">(initialMode || "sandbox");
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  
  const tasks = simulationTasks && simulationTasks.length > 0 ? simulationTasks : SIMULATION_TASKS;
  const questions = examQuestions && examQuestions.length > 0 ? examQuestions : EXAM_QUESTIONS;
  
  // Sync internal mode state when prop changes
  useEffect(() => {
    if (initialMode) {
      setSimMode(initialMode);
    }
  }, [initialMode]);

  // --- SANDBOX SIMULATOR STATE ---
  const [ratings, setRatings] = useState<Record<string, number>>({}); // taskId -> chosen rating
  const [flags, setFlags] = useState<Record<string, { hallucination: boolean; safety: boolean; formatting: boolean }>>({}); // taskId -> flags
  const [justifications, setJustifications] = useState<Record<string, string>>({}); // taskId -> text rationale
  
  const [isDone, setIsDone] = useState(false);
  const [finalScoreMeta, setFinalScoreMeta] = useState<{
    score: number;
    strengths: string[];
    weaknesses: string[];
  } | null>(null);

  // Timed sandbox exercises (maximum 25 minutes per task)
  const [sandboxTimerActive, setSandboxTimerActive] = useState(false);
  const [sandboxTimers, setSandboxTimers] = useState<Record<string, number>>({}); // taskId -> seconds
  const sandboxTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getTaskSeconds = (taskId: string) => {
    if (sandboxTimers[taskId] !== undefined) {
      return sandboxTimers[taskId];
    }
    return 1500; // 25:00 default
  };

  // --- TIMED EXAM STATE ---
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15:00 minutes
  const [timerActive, setTimerActive] = useState(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [examFinalScore, setExamFinalScore] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer effect for Exam
  useEffect(() => {
    if (timerActive && secondsRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && timerActive) {
      gradeExamAll();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerActive, secondsRemaining]);

  // Countdown timer effect for Sandbox tasks
  useEffect(() => {
    if (sandboxTimerActive && hasStarted && simMode === "sandbox" && !isDone && tasks[activeTaskIdx]) {
      const activeTaskId = tasks[activeTaskIdx].id;
      const currentSecs = getTaskSeconds(activeTaskId);
      
      sandboxTimerRef.current = setTimeout(() => {
        if (currentSecs > 0) {
          setSandboxTimers(prev => ({
            ...prev,
            [activeTaskId]: currentSecs - 1
          }));
        } else {
          // Time expired for this specific task
          alert(`Time is up for Exercise #${activeTaskIdx + 1}! Moving to next exercise.`);
          if (activeTaskIdx < tasks.length - 1) {
            setActiveTaskIdx(prev => prev + 1);
          } else {
            submitAllSimulation();
          }
        }
      }, 1000);
    }

    return () => {
      if (sandboxTimerRef.current) clearTimeout(sandboxTimerRef.current);
    };
  }, [sandboxTimerActive, hasStarted, simMode, activeTaskIdx, sandboxTimers, isDone, tasks]);

  const startSimulation = () => {
    setHasStarted(true);
    setSandboxTimerActive(true);
  };

  const handleRetakeSandbox = () => {
    setActiveTaskIdx(0);
    setRatings({});
    setFlags({});
    setJustifications({});
    setSandboxTimers({});
    setIsDone(false);
    setFinalScoreMeta(null);
    setHasStarted(true);
    setSandboxTimerActive(true);
  };

  const handleTaskRating = (taskId: string, stars: number) => {
    setRatings(prev => ({ ...prev, [taskId]: stars }));
  };

  const handleTaskFlagToggle = (taskId: string, type: "hallucination" | "safety" | "formatting") => {
    setFlags(prev => {
      const current = prev[taskId] || { hallucination: false, safety: false, formatting: false };
      return {
        ...prev,
        [taskId]: {
          ...current,
          [type]: !current[type]
        }
      };
    });
  };

  const submitAllSimulation = () => {
    setSandboxTimerActive(false);
    let rawPassed = 0;
    
    tasks.forEach(task => {
      const ratingInput = ratings[task.id] || 0;
      const commentInput = justifications[task.id] || "";
      const flagInput = flags[task.id] || { hallucination: false, safety: false, formatting: false };

      const taskIdealRating = task.idealRating !== undefined ? task.idealRating : (task.correctOptionIndex === 0 ? 5 : 2);
      const taskIdealFlags = task.idealFlags !== undefined ? task.idealFlags : {
        hallucination: task.type === "fact_checking",
        safety: task.type === "safety",
        formatting: task.type === "instruction_following"
      };

      const ratingCorrect = Math.abs(ratingInput - taskIdealRating) <= 1;
      const hallucinationCorrect = flagInput.hallucination === taskIdealFlags.hallucination;
      const safetyCorrect = flagInput.safety === taskIdealFlags.safety;
      
      const justificationLength = commentInput.trim().split(/\s+/).filter(Boolean).length;
      const justificationLengthPassed = justificationLength >= 15;

      let taskSuccessCount = 0;
      if (ratingCorrect) taskSuccessCount++;
      if (hallucinationCorrect) taskSuccessCount++;
      if (safetyCorrect) taskSuccessCount++;
      if (justificationLengthPassed) taskSuccessCount++;

      if (taskSuccessCount >= 3) {
        rawPassed++;
      }
    });

    const finalScore = Math.round((rawPassed / tasks.length) * 100);

    const strengthsArr = ["Rigorous detail auditing", "Excellent keyword semantic understanding"];
    const weaknessesArr = ["Slight rating inconsistency under ambiguous prompts"];

    if (finalScore >= 80) {
      strengthsArr.push("Exceptional structural alignment checking");
      strengthsArr.push("Strong safety guidelines compliance review");
    } else {
      weaknessesArr.push("Justification detail level below platform threshold (minimum 15 words rationale)");
      weaknessesArr.push("Under-sensitive to minor factual hallucinations");
    }

    setFinalScoreMeta({
      score: finalScore,
      strengths: strengthsArr,
      weaknesses: weaknessesArr
    });
    setIsDone(true);
  };

  const handleFinishAndSave = () => {
    if (finalScoreMeta) {
      onComplete(finalScoreMeta.score, finalScoreMeta.strengths, finalScoreMeta.weaknesses);
    }
  };

  // --- EXAM CONTROL LOGIC ---
  const startExam = () => {
    setSecondsRemaining(900); // 15 minutes
    setExamAnswers({});
    setActiveQIdx(0);
    setTimerActive(true);
    setHasStarted(true);
    setIsExamSubmitted(false);
    setExamFinalScore(null);
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isExamSubmitted) return;
    setExamAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const gradeExamAll = () => {
    setTimerActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    let correctCount = 0;
    questions.forEach(q => {
      if (examAnswers[q.id] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setExamFinalScore(score);
    setIsExamSubmitted(true);
  };

  const handleExamFinishSave = () => {
    if (examFinalScore !== null) {
      onExamComplete(examFinalScore);
    }
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // --- RENDER UNSTARTED/GATE MASTER SCREEN ---
  if (!hasStarted) {
    const isCurrentModeUnlocked = simMode === "sandbox" ? isUnlocked : simMode === "exam" ? isExamUnlocked : true;

    return (
      <div className="space-y-4 max-w-3xl mx-auto pl-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-150 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* MODE SWITCHER TAB BAR */}
        <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl w-full max-w-md mx-auto gap-1 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setSimMode("sandbox")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              simMode === "sandbox"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Workplace Sandbox Sim
          </button>
          <button
            onClick={() => setSimMode("exam")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              simMode === "exam"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-extrabold"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Timed Qualification Exam
          </button>
        </div>

        {!isPaidUser ? (
          /* Membership paywall preview: show real content, disable the
             interactive parts, and route "Start" to the upgrade flow
             instead of a hard redirect at the nav level. */
          simMode === "sandbox" ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-850 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Preview — Task 1 of {tasks.length}
                  </span>
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tasks[0]?.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-850 rounded-xl p-4">
                  {tasks[0]?.prompt}
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-2">Rating locked</span>
                </div>
              </div>
              <button
                onClick={onRequireUpgrade}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-3.5 text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Professional to Start Practicing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 opacity-90">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-850 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Preview — Question 1 of {questions.length}
                  </span>
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {questions[0]?.question}
                </p>
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {questions[0]?.options.map((option, idx) => (
                    <div
                      key={idx}
                      className="text-left p-4 rounded-xl border border-slate-150 dark:border-slate-800 text-xs bg-slate-50/60 dark:bg-slate-850/60 text-slate-400 dark:text-slate-500 flex items-center justify-between cursor-not-allowed"
                    >
                      <span>{option}</span>
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onRequireUpgrade}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-3.5 text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Professional to Start the Exam
              </button>
            </div>
          )
        ) : !isCurrentModeUnlocked ? (
          /* Render Gate/Lock Screen for the selected mode */
          simMode === "sandbox" ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-amber-150 text-amber-700 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto text-xl">
                <Terminal className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Workspace Simulation Locked</h2>
                <p className="text-xs text-slate-505 leading-relaxed max-w-md mx-auto">
                  Our simulators follow the rigid criteria of premium clients. Please complete the master syllabus lessons first to master basic taxonomy rules!
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl max-w-sm mx-auto text-left border border-slate-100">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-450">Syllabus Requirements</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 mt-1">
                  Complete the required lessons and quizzes first to establish baseline scoring and unlock simulation tasks.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={onBypass}
                  className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline py-2 cursor-pointer"
                >
                  Bypass Syllabus Locks (Simulate Sandbox Instantly)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-xl">
                <Award className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Professional Licensing Exam</h2>
                <p className="text-xs text-slate-505 leading-relaxed max-w-sm mx-auto">
                  This timed credential exam certifies you for real remote contracts in alignment and annotation. Complete all foundational lessons & labs to unlock.
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl max-w-sm mx-auto text-left border border-slate-100">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-450">Syllabus Check:</span>
                <p className="text-xs text-slate-600 dark:text-slate-350 mt-1">
                  Complete the required lessons, study materials, and submit the simulated workspace sandbox.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={onBypass}
                  className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline py-2 cursor-pointer"
                >
                  Syllabus Bypass (Unlock Global Ready AIEval Exam Mode Instantly)
                </button>
              </div>
            </div>
          )
        ) : (
          /* Render Intro screen for the selected mode */
          simMode === "sandbox" ? (
            <div id="sim-intro" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 relative overflow-hidden">
                <span className="bg-indigo-500 text-white font-bold text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Practice Arena
                </span>
                <h2 className="text-2xl font-black mt-4 tracking-tight leading-tight">AI Evaluation Remote Portal Sim</h2>
                <p className="text-xs text-indigo-200 mt-2 max-w-xl leading-relaxed">
                  Welcome to the live annotator simulator. This portal mimics the exact environments used by Outlier.ai, Scale AI, Alignerr, and DataAnnotation.tech.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">What to expect inside the console:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      {tasks.length} Workplace Tasks
                    </span>
                    <p className="text-slate-505 leading-normal">
                      Multi-prompt situations requiring ranking, factual validation, safety audits, and formatting validations.
                    </p>
                  </div>
                  <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Comparative Star Ratings
                    </span>
                    <p className="text-slate-505">
                      Rate model response outcomes from 1 Star (Useless/Hazardous) to 5 Stars (Fabulous/Completely accurate).
                    </p>
                  </div>
                  <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      Discrepancy Flags
                    </span>
                    <p className="text-slate-505">
                      Identify latent hallucinations, guidelines formatting violations, and structural safety breaches.
                    </p>
                  </div>
                  <div className="p-4 border border-slate-150 dark:border-slate-800 rounded-xl space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-indigo-650" />
                      Justification Critique
                    </span>
                    <p className="text-slate-500">
                      Compose detailed explanations explaining why a model failed particular clauses of the instructions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/40 dark:bg-amber-950/10 border border-amber-150/40 rounded-xl text-xs flex gap-2">
                <Clock className="text-amber-600 shrink-0 w-4 h-4 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-350">
                  <span className="font-bold text-amber-700 dark:text-amber-400">Timed Exercises:</span> Each simulation exercise/task inside this practice test is strictly timed at a <span className="font-bold">maximum of 25 minutes</span>. Make sure to audit, rate, and justify before the exercise countdown expires!
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={startSimulation}
                  className="bg-indigo-600 hover:bg-indigo-705 text-white font-bold rounded-xl px-6 py-3 text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Enter Portal Console
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6">
                <p className="text-[10px] bg-red-500 text-white px-2.5 py-0.5 rounded font-bold uppercase w-fit tracking-wide">
                  Timed Certification
                </p>
                <h2 className="text-xl sm:text-2xl font-black mt-4 leading-tight">AI Evaluation Qualification Licensing Exam</h2>
                <p className="text-xs text-indigo-200 mt-2 max-w-xl leading-relaxed">
                  Validate your mastery of safety reviews, factual error identification, RLHF response audits, and meticulous formatting compliance rules. Passing places you in the upper echelon of annotators.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150">
                  <Clock className="w-5 h-5 mx-auto text-red-500" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">15 Minutes</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Ticking Time Limit</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150">
                  <HelpCircle className="w-5 h-5 mx-auto text-indigo-500" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">{questions.length} Questions</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Syllabus Scenarios</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150">
                  <Award className="w-5 h-5 mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">80% Threshold</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase">Needs {Math.ceil(questions.length * 0.8)}/{questions.length} to Pass</p>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-slate-700 dark:text-slate-350 leading-relaxed">
                  <span className="font-bold">Important Notice:</span> Once started, leaving the page or clicking away will pause/cancel your progress. Ensure your connection is steady and stable. Answer carefully — negative keywords and contradictory evaluations carry heavy failure scores.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={startExam}
                  className="bg-indigo-650 hover:bg-indigo-705 text-white font-bold rounded-xl px-6 py-3 text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white animate-pulse" />
                  Launch Licensing Exam
                </button>
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  // --- RENDER COMPLETED SCORE SCREENS ---
  if (simMode === "sandbox" && isDone && finalScoreMeta) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto pl-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-150 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
            <Award className="w-8 h-8" />
          </div>
          
          <div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Simulation Graduated
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3">Annotation Transcript Report</h2>
            <p className="text-xs text-slate-505 mt-1">Diagnostic alignment report cards for freelance onboarding readiness</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Accuracy Rating</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                {finalScoreMeta.score}%
              </p>
              <div className="mt-2 text-xs text-slate-505">
                {finalScoreMeta.score >= 80 
                  ? "🏆 Elite Competency - Cleared for premium high-tier tasks ($30-45/hr)" 
                  : "⚠️ Basic Competency - Cleared for entry general annotation"}
              </div>
            </div>
            
            <div className="space-y-3 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-750 p-2 sm:pl-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Core Strengths Detected:</p>
                <ul className="text-xs text-slate-655 dark:text-slate-350 list-disc pl-4 space-y-0.5 mt-1">
                  {finalScoreMeta.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Improvement Suggestions:</p>
                <ul className="text-xs text-slate-655 dark:text-slate-350 list-disc pl-4 space-y-0.5 mt-1">
                  {finalScoreMeta.weaknesses.map((weak, i) => (
                    <li key={i}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {finalScoreMeta.score < 80 && (
              <button
                onClick={handleRetakeSandbox}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold rounded-xl px-5 py-3 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Simulation
              </button>
            )}
            <button
              onClick={handleFinishAndSave}
              className="bg-indigo-650 hover:bg-indigo-705 text-white font-bold rounded-xl px-6 py-3 text-xs shadow-md transition-colors cursor-pointer"
            >
              Post Scores to Global Ready AIEval Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (simMode === "exam" && isExamSubmitted && examFinalScore !== null) {
    const passed = examFinalScore >= 80;

    return (
      <div className="space-y-6 max-w-3xl mx-auto pl-1 pb-12 animate-fade-in">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-155 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        {passed ? (
          <div className="bg-white dark:bg-slate-900 border-4 border-double border-indigo-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 border-l-4 border-t-4 border-indigo-200 dark:border-slate-850 rounded-tl-3xl m-4 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-24 h-24 border-r-4 border-t-4 border-indigo-200 dark:border-slate-850 rounded-tr-3xl m-4 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 border-l-4 border-b-4 border-indigo-200 dark:border-slate-855 rounded-bl-3xl m-4 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-r-4 border-b-4 border-indigo-200 dark:border-slate-855 rounded-br-3xl m-4 pointer-events-none"></div>

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
                  Global Ready AIEval Credentials Division
                </span>
                <p className="text-3xl font-serif font-black text-slate-900 dark:text-white mt-2 leading-tight">
                  CERTIFICATE OF QUALIFICATION
                </p>
                <p className="text-xs text-slate-450 italic">
                  This certifies that competent core parameters have been completely satisfied
                </p>
              </div>

              <div className="py-2 border-b border-t border-slate-100 dark:border-slate-850">
                <p className="text-xs text-slate-400 uppercase tracking-widest">AWARDEE EVALUATOR</p>
                <p className="text-xl font-bold text-indigo-650 dark:text-white mt-1">Global Ready AIEval Scholar Learner</p>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-350 max-w-md mx-auto leading-relaxed">
                Has successfully cleared the standardized examination of the <i>AI Evaluation Foundations Curriculum</i> with a passing score of <span className="font-extrabold text-slate-850 dark:text-white">{examFinalScore}% Accuracy Grade</span>, verifying expert-level capability in RM/RLHF rating comparative criteria, safety taxonomy mitigation, and precision rationale justifications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs select-none">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CREDENTIAL VALUE</span>
                  <span className="font-semibold text-slate-855 dark:text-white mt-1 block">REGISTERED LICENSED EVALUATOR</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CREDENTIAL HASH TOKEN</span>
                  <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 mt-block select-all">AEA-QUAL-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-950 dark:bg-slate-150 dark:text-slate-900 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Credential
                </button>
                <button
                  onClick={handleExamFinishSave}
                  className="bg-indigo-600 hover:bg-indigo-705 text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-md transition-all cursor-pointer"
                >
                  Post Credentials To Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
            <div className="w-14 h-14 bg-red-100 text-red-655 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <p className="text-xs text-red-500 font-extrabold uppercase tracking-widest">
                Qualification Exam Status: Unsuccessful
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Accuracy Grade: {examFinalScore}%
              </h3>
              <p className="text-xs text-slate-505 mt-2 max-w-sm mx-auto leading-relaxed">
                You correctly answered <span className="font-bold">{Math.round((examFinalScore / 100) * questions.length)}</span> of {questions.length} questions. A rigid minimum of 80% ({Math.ceil(questions.length * 0.8)} questions) is required to certify remote compliance.
              </p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-xl max-w-md mx-auto text-left space-y-2 border border-slate-150">
              <span className="text-[9px] uppercase font-bold text-slate-400">Corrective Actions Reco:</span>
              <ul className="text-xs text-slate-655 dark:text-slate-350 list-disc pl-4 space-y-1 mt-1">
                <li>Study Lesson 4 "Hallucination Audits" closely — factuality has major weight in the grade pool.</li>
                <li>Go through the "Why Evaluators Fail" dedicated area to eliminate lazy justification logic.</li>
                <li>Practice with lesson labs again to secure baseline credentials before your next attempt.</li>
              </ul>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={startExam}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-5 py-2.5 text-xs cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Credential Exam
              </button>
              <button
                onClick={handleExamFinishSave}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold rounded-xl px-4 py-2 text-xs cursor-pointer"
              >
                Conclude Attempt
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDERS THE RUNNING TIMED EXAM CONSOLE MODULE ---
  if (simMode === "exam") {
    const activeQuestion = questions[activeQIdx];
    const userSelected = examAnswers[activeQuestion.id] !== undefined;

    return (
      <div className="space-y-4 animate-fade-in pl-1">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to exit the timed exam? Your current progress will not be saved or graded.")) {
                onBack();
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-405 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Timed Exam
          </button>
          <span className="text-[10px] bg-red-50 text-red-700 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wide">
            Timed Exam Active
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 1. Timer indicator Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm h-fit space-y-6">
            <div>
              <span className="text-[9px] text-slate-450 uppercase font-bold block">TIME LIMIT COUNTER</span>
              <div className="flex items-center gap-2 mt-2 font-mono text-2xl font-black text-slate-900 dark:text-white">
                <Clock className={`w-6 h-6 ${secondsRemaining < 120 ? "text-red-500 animate-pulse" : "text-slate-500"}`} />
                <span className={secondsRemaining < 120 ? "text-red-500 font-extrabold" : ""}>{formatTime(secondsRemaining)}</span>
              </div>
              {secondsRemaining < 120 && (
                <p className="text-[10px] text-red-500 font-bold mt-1 uppercase animate-pulse">Running out of time!</p>
              )}
            </div>

            {/* grids of questions */}
            <div className="space-y-2 border-t pt-4 border-slate-100 dark:border-slate-850">
              <p className="text-[10px] text-slate-450 font-bold uppercase">License Matrix Progress</p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.map((q, idx) => {
                  const answered = examAnswers[q.id] !== undefined;
                  const isCurr = idx === activeQIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQIdx(idx)}
                      className={`w-8 h-8 rounded-lg font-bold text-[11px] transition-all ${
                        isCurr
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                          : answered
                            ? "bg-indigo-50 text-indigo-750 dark:bg-indigo-950 dark:text-indigo-400"
                            : "bg-slate-50 text-slate-500 dark:bg-slate-850 hover:bg-slate-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={gradeExamAll}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer block text-center"
            >
              Submit Exam Token
            </button>
          </div>

          {/* 2. Primary multiple choice block panel */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <div>
                <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold uppercase">
                  Part {activeQuestion.part || 2} Evaluation Question
                </span>
                <h3 className="text-sm font-bold text-slate-550 uppercase mt-1">Foundations Credential Licensing</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Q{activeQIdx + 1} of {questions.length}</span>
            </div>

            {/* Question scenarios layout */}
            <div className="space-y-4 animate-fade-in">
              {activeQuestion.scenario && (
                <div className="p-4 bg-slate-50 dark:bg-slate-850 border rounded-xl text-xs italic text-slate-700 dark:text-slate-300">
                  <span className="font-extrabold uppercase text-[10px] text-slate-450 block mb-1">AUDITING SCENARIO CASE</span>
                  "{activeQuestion.scenario}"
                </div>
              )}

              {activeQuestion.media && activeQuestion.media.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-800">
                  {activeQuestion.media[0].type === "video" ? (
                    <video src={activeQuestion.media[0].url} controls className="w-full max-h-56 rounded-lg bg-black" />
                  ) : (
                    <audio src={activeQuestion.media[0].url} controls className="w-full" />
                  )}
                </div>
              )}

              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {activeQuestion.question}
              </p>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = examAnswers[activeQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(activeQuestion.id, idx)}
                      className={`text-left p-4 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-400 font-semibold scale-[1.01]"
                          : "bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-200 hover:border-slate-300 dark:border-slate-800"
                      } cursor-pointer`}
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 font-bold" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={() => {
                  if (activeQIdx > 0) setActiveQIdx(activeQIdx - 1);
                }}
                disabled={activeQIdx === 0}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 disabled:opacity-20 cursor-pointer"
              >
                &larr; Back Q
              </button>
              
              {activeQIdx < questions.length - 1 ? (
                <button
                  onClick={() => setActiveQIdx(activeQIdx + 1)}
                  className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl px-5 py-2 text-xs transition-colors cursor-pointer"
                >
                  Continue &rarr;
                </button>
              ) : (
                <button
                  onClick={gradeExamAll}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-lg px-6 py-2.5 text-xs shadow transition-colors cursor-pointer"
                >
                  Finish & Grade Credential Exam
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERS ACTIVE SANDBOX SIMULATION WORKSPACE ---
  // PORTAL WORKSPACE INTERFACE
  const activeTask = tasks[activeTaskIdx];
  const userRating = ratings[activeTask.id] || 0;
  const userFlags = flags[activeTask.id] || { hallucination: false, safety: false, formatting: false };
  const userJustification = justifications[activeTask.id] || "";

  // Progress metrics
  const completedCount = Object.keys(ratings).length;

  return (
    <div className="space-y-4 animate-fade-in pl-1">
      <button
        onClick={() => {
          if (confirm("Are you sure you want to exit the running simulator? Your current progress will be lost.")) {
            onBack();
          }
        }}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-650 dark:text-slate-400 dark:hover:text-rose-400 transition-colors uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Exit Simulator
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* 1. Left sidebar - Task Picker list */}
      <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm h-fit space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Active Simulator</p>
          <span className="font-extrabold text-xs text-slate-800 dark:text-white tracking-tight">ALACRITY WORKPLACE API</span>
        </div>
        
        <div className="space-y-1.5 flex flex-row lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-1 lg:gap-0">
          {tasks.map((task, idx) => {
            const hasStartedTask = ratings[task.id] !== undefined;
            const isActive = activeTaskIdx === idx;

            return (
              <button
                key={task.id}
                onClick={() => setActiveTaskIdx(idx)}
                className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between min-w-[130px] ${
                  isActive 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold"
                    : hasStartedTask
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/10 dark:text-emerald-350"
                      : "bg-slate-50 text-slate-600 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[10px] opacity-40 font-mono">0{idx + 1}</span>
                  <span className="truncate">{task.category || task.type}</span>
                </div>
                {hasStartedTask && (
                  <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold font-mono">
                     OK
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 text-slate-500 text-[10px] space-y-1">
          <p className="font-bold text-slate-800">Completion Status:</p>
          <p>{completedCount} of {tasks.length} tasks audited</p>
          <div className="w-full bg-slate-200 h-1.5 rounded overflow-hidden mt-1">
            <div 
              className="bg-indigo-650 h-full rounded transition-all duration-300"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Right primary workspace */}
      <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-850">
          <div>
            <span className="text-[9px] bg-indigo-550/10 text-indigo-750 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
              Task #{activeTaskIdx + 1} of {tasks.length} &bull; CATEGORY: {activeTask.category || activeTask.type}
            </span>
            <h3 className="text-lg font-extrabold text-slate-905 dark:text-white mt-1.5">
              Auditing Compliance: {activeTask.category || activeTask.type} Assessment
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-150/40 dark:border-amber-900/30">
              <Clock className={`w-4 h-4 ${getTaskSeconds(activeTask.id) < 120 ? "animate-pulse text-red-500" : ""}`} />
              <span className="font-mono text-xs font-extrabold">
                Exercise Timer: {formatTime(getTaskSeconds(activeTask.id))}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              <span className="font-bold">Project matching:</span> Outlier RLHF Pool - Generalist
            </div>
          </div>
        </div>

        {/* Task scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">User Prompt Contract</p>
            <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold mt-1 leading-relaxed">
              {activeTask.prompt}
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Model Output Answer Response</p>
            <pre className="text-xs text-slate-800 dark:text-slate-250 font-mono mt-1 p-2 bg-white dark:bg-slate-900 border rounded-lg whitespace-pre-wrap max-h-48 overflow-y-auto">
              {activeTask.response || activeTask.responseSingle || (activeTask.responses ? activeTask.responses.map(r => `${r.letter}: ${r.text}`).join('\n') : "")}
            </pre>
          </div>
        </div>

        {/* Evaluator Ratings Segment */}
        <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-6">
          <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-450 border-b pb-1.5">
            Evaluator Response Assessment Sheet
          </h4>

          {/* Star grading */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-white">
              Comparative rating score values (How accurate is the response?)
            </label>
            <p className="text-[10px] text-slate-400">1 Star = Completely failed/inaccurate/harmful, 5 Stars = Perfect coverage of all prompt instructions with zero hallucinations</p>
            <div className="flex gap-2 pt-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = userRating >= star;
                return (
                  <button
                    key={star}
                    onClick={() => handleTaskRating(activeTask.id, star)}
                    className="cursor-pointer"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        isSelected 
                          ? "text-amber-500 fill-amber-500 scale-105" 
                          : "text-slate-300 hover:text-amber-300"
                      } transition-all`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audit parameters checkbox options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 dark:text-white">
              Flag specific criteria exceptions or anomalies
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleTaskFlagToggle(activeTask.id, "hallucination")}
                className={`p-3 border rounded-xl text-xs text-left transition-all flex items-center justify-between ${
                  userFlags.hallucination 
                    ? "bg-rose-50 border-rose-450 text-rose-800 dark:bg-rose-950/20 dark:text-rose-450 font-bold" 
                    : "bg-white dark:bg-slate-900 border-slate-200"
                }`}
              >
                <span>Factual Hallucination</span>
                <input 
                  type="checkbox" 
                  checked={userFlags.hallucination} 
                  onChange={()=>{}}
                  className="pointer-events-none"
                />
              </button>

              <button
                onClick={() => handleTaskFlagToggle(activeTask.id, "safety")}
                className={`p-3 border rounded-xl text-xs text-left transition-all flex items-center justify-between ${
                  userFlags.safety 
                    ? "bg-amber-50 border-amber-450 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 font-bold" 
                    : "bg-white dark:bg-slate-900 border-slate-200"
                }`}
              >
                <span>Safety / Biases / Violence</span>
                <input 
                  type="checkbox" 
                  checked={userFlags.safety} 
                  onChange={()=>{}}
                  className="pointer-events-none"
                />
              </button>

              <button
                onClick={() => handleTaskFlagToggle(activeTask.id, "formatting")}
                className={`p-3 border rounded-xl text-xs text-left transition-all flex items-center justify-between ${
                  userFlags.formatting 
                    ? "bg-indigo-50 border-indigo-400 text-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-400 font-bold" 
                    : "bg-white dark:bg-slate-900 border-slate-200"
                }`}
              >
                <span>Formatting (Broken Tags)</span>
                <input 
                  type="checkbox" 
                  checked={userFlags.formatting} 
                  onChange={()=>{}}
                  className="pointer-events-none"
                />
              </button>
            </div>
          </div>

          {/* Commentary reasoning box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-white block">
              Provide professional commentary justification (Minimum 15 words)
            </label>
            <textarea
              value={userJustification}
              onChange={(e) => setJustifications(prev => ({ ...prev, [activeTask.id]: e.target.value }))}
              placeholder="Supply a highly cohesive rationale detailing exactly how and where the model output violated the formatting constraint or prompt rules..."
              className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            ></textarea>
            <p className="text-[10px] text-slate-400 text-right">
              Word count: {userJustification.trim().split(/\s+/).filter(Boolean).length} / 15
            </p>
          </div>
        </div>

        {/* Console stepping footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            onClick={() => {
              if (activeTaskIdx > 0) setActiveTaskIdx(activeTaskIdx - 1);
            }}
            disabled={activeTaskIdx === 0}
            className="text-xs font-bold text-slate-400 hover:text-slate-905 disabled:opacity-20 cursor-pointer"
          >
            &larr; Previous Task
          </button>

          {activeTaskIdx < tasks.length - 1 ? (
            <button
              onClick={() => setActiveTaskIdx(activeTaskIdx + 1)}
              disabled={userRating === 0 || userJustification.trim().split(/\s+/).filter(Boolean).length < 10}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                userRating > 0 && userJustification.trim().split(/\s+/).filter(Boolean).length >= 10
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Next Task &rarr;
            </button>
          ) : (
            <button
              disabled={completedCount < tasks.length}
              onClick={submitAllSimulation}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
                completedCount === tasks.length
                  ? "bg-indigo-600 hover:bg-indigo-705 text-white cursor-pointer"
                  : "bg-slate-100 text-slate-405 cursor-not-allowed"
              }`}
            >
              Submit Entire Simulated Transcript
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
