"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Trophy,
  TrendingUp,
  User,
  Gauge,
  Zap,
  Play,
  ArrowRight,
  ShieldAlert,
  ListChecks,
  Flame,
  CornerDownRight,
  AlertTriangle,
  Menu,
  X,
  Moon,
  Sun,
  Briefcase,
  Sparkles,
  BookCheck,
  ShieldAlert as FailWarning,
  ArrowLeft,
  Settings,
  LayoutGrid,
  Lock,
  MessageSquare,
  Shield,
} from "lucide-react";

import { UserStats, Rank, Module, Lesson, Achievement } from "./types";
import type { JobOpportunity } from "./data/jobs";
import { syncUserProgress } from "./lib/actions/user-progress";

// Subcomponents
import DashboardView from "./components/DashboardView";
import LessonView from "./components/LessonView";
import SimulationView from "./components/SimulationView";
import ReadinessView from "./components/ReadinessView";
import FailReasonsView from "./components/FailReasonsView";
import ProfileView from "./components/ProfileView";
import JobsView from "./components/JobsView";
import InterviewSimulator from "./components/InterviewSimulator";
import Part2IntroView from "./components/Part2IntroView";
import Part2IntroLessonView from "./components/Part2IntroLessonView";
import Part2Lesson1View from "./components/Part2Lesson1View";
import Part2Lesson2View from "./components/Part2Lesson2View";
import Part2Lesson3View from "./components/Part2Lesson3View";
import Part2Lesson4View from "./components/Part2Lesson4View";
import Part2Lesson5View from "./components/Part2Lesson5View";
import Part2Lesson6View from "./components/Part2Lesson6View";
import Part2Lesson7View from "./components/Part2Lesson7View";
import MembershipView from "./components/MembershipView";
import AcceleratorHubView from "./components/AcceleratorHubView";

interface AppProps {
  userId: string;
  moduleCurriculum: Module[];
  achievements: Achievement[];
  jobs: JobOpportunity[];
  initialStats: UserStats;
}

export default function App({
  userId,
  moduleCurriculum,
  achievements,
  jobs,
  initialStats,
}: AppProps) {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>("m1");
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [simViewInitialMode, setSimViewInitialMode] = useState<
    "sandbox" | "exam" | "interview"
  >("sandbox");

  const activeModule = useMemo(() => {
    return (
      moduleCurriculum.find((m) => m.id === activeModuleId) ||
      moduleCurriculum[0]
    );
  }, [activeModuleId, moduleCurriculum]);

  const activeModuleDuration = useMemo(() => {
    let totalMin = 0;
    activeModule.lessons.forEach((l) => {
      const mins = parseInt(l.duration, 10);
      if (!isNaN(mins)) {
        totalMin += mins;
      }
    });
    if (totalMin >= 60) {
      const hrs = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      if (mins > 0) {
        return `${hrs} Hour${hrs > 1 ? "s" : ""} ${mins} Minutes expected`;
      }
      return `${hrs} Hour${hrs > 1 ? "s" : ""} expected`;
    }
    return `${totalMin} Minutes expected`;
  }, [activeModule]);

  // Responsive drawer toggle state for mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Sync with system preferences default or manual toggle
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("ae-academy-theme");
    return saved === "dark";
  });

  // Master local persistence state
  const [stats, setStats] = useState<UserStats>(initialStats);

  // Lock bypass option for review testing
  const [bypassLocks, setBypassLocks] = useState(false);

  // Apply dark class to body
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("ae-academy-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("ae-academy-theme", "light");
    }
  }, [isDarkMode]);

  // Persist progress/profile updates to Supabase automatically
  useEffect(() => {
    syncUserProgress(stats).catch((err) => {
      console.error("Failed to sync progress", err);
    });
  }, [stats]);

  // Dynamically compute average readiness score index
  const overallReadinessScore = useMemo(() => {
    const values = Object.values(stats.skills) as number[];
    if (values.length === 0) return 0;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(avg);
  }, [stats.skills]);

  // Dynamically compute Rank based on completed metrics
  const activeRank = useMemo(() => {
    const completedLessonsCount = stats.completedLessons.length;
    const hasPassedExam = stats.passedExams.length > 0;
    const hasFinishedSim = stats.completedSimulations.length > 0;

    if (completedLessonsCount >= 5 && hasPassedExam && hasFinishedSim) {
      return "Senior Aligned Specialist";
    }
    if (completedLessonsCount >= 5 && hasPassedExam) {
      return "Junior Evaluator Practitioner";
    }
    if (hasPassedExam) {
      return "Certified Candidate";
    }
    if (completedLessonsCount >= 3) {
      return "Apprentice Annotator";
    }
    return "Trainee Evaluator";
  }, [stats.completedLessons, stats.passedExams, stats.completedSimulations]);

  // Handle Lesson selection trigger
  const handleStartLesson = (lessonId: string) => {
    if (
      stats.membershipTier === "starter" &&
      lessonId !== "l1" &&
      lessonId !== "p2_intro" &&
      lessonId !== "p2_m1_l1"
    ) {
      setActiveTab("membership");
      setActiveLessonId(null);
      setMobileMenuOpen(false);
      return;
    }
    setActiveLessonId(lessonId);
    setMobileMenuOpen(false);
  };

  const handleLessonBack = () => {
    setActiveLessonId(null);
  };

  // Complete a Lesson: awards XP, increases skills score organically, sets completion flags
  const handleLessonComplete = (
    quizScore: number,
    practiceMeta: Record<string, any>,
    nextLessonId?: string,
  ) => {
    if (!activeLessonId) return;

    setStats((prev) => {
      const isAlreadyCompleted = prev.completedLessons.includes(activeLessonId);
      const newCompleted = isAlreadyCompleted
        ? prev.completedLessons
        : [...prev.completedLessons, activeLessonId];

      // Dynamic skill upgrade offsets based on quiz completion grade
      const xpEarned = isAlreadyCompleted ? 20 : 120; // smaller bonus for review repetition
      const updatedSkills = { ...prev.skills };

      if (!isAlreadyCompleted) {
        // Boost skills depending on lesson theme
        if (activeLessonId === "p2_m1_l1") {
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 12,
          );
          updatedSkills.factChecking = Math.min(
            100,
            updatedSkills.factChecking + 10,
          );
          updatedSkills.instructionFollowing = Math.min(
            100,
            updatedSkills.instructionFollowing + 12,
          );
        } else if (activeLessonId === "p2_m1_l2") {
          updatedSkills.instructionFollowing = Math.min(
            100,
            updatedSkills.instructionFollowing + 15,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 10,
          );
        } else if (activeLessonId === "p2_m1_l3") {
          updatedSkills.factChecking = Math.min(
            100,
            updatedSkills.factChecking + 15,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 10,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 5,
          );
        } else if (activeLessonId === "p2_m1_l4") {
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 15,
          );
          updatedSkills.instructionFollowing = Math.min(
            100,
            updatedSkills.instructionFollowing + 10,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.reasoning = Math.min(100, updatedSkills.reasoning + 5);
        } else if (activeLessonId === "p2_m1_l5") {
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 15,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 10,
          );
          updatedSkills.instructionFollowing = Math.min(
            100,
            updatedSkills.instructionFollowing + 10,
          );
          updatedSkills.reasoning = Math.min(100, updatedSkills.reasoning + 5);
        } else if (activeLessonId === "p2_m1_l6") {
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 15,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.reasoning = Math.min(100, updatedSkills.reasoning + 10);
          updatedSkills.factChecking = Math.min(
            100,
            updatedSkills.factChecking + 5,
          );
        } else if (activeLessonId === "p2_m1_l7") {
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 20,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.reasoning = Math.min(100, updatedSkills.reasoning + 10);
        } else if (
          activeLessonId === "les_foundations" ||
          activeLessonId === "l1"
        ) {
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 8,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 6,
          );
        } else if (
          activeLessonId === "les_ranking" ||
          activeLessonId === "l2"
        ) {
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 12,
          );
          updatedSkills.reasoning = Math.min(100, updatedSkills.reasoning + 8);
        } else if (activeLessonId === "les_safety" || activeLessonId === "l3") {
          updatedSkills.safetyReview = Math.min(
            100,
            updatedSkills.safetyReview + 15,
          );
        } else if (
          activeLessonId === "les_hallucinations" ||
          activeLessonId === "l4"
        ) {
          updatedSkills.factChecking = Math.min(
            100,
            updatedSkills.factChecking + 14,
          );
        } else if (
          activeLessonId === "les_instruction_following" ||
          activeLessonId === "l5"
        ) {
          updatedSkills.instructionFollowing = Math.min(
            100,
            updatedSkills.instructionFollowing + 12,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 5,
          );
        } else if (activeLessonId === "m4_l1") {
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 12,
          );
          updatedSkills.reasoning = Math.min(100, updatedSkills.reasoning + 8);
        } else if (activeLessonId === "m5_l1") {
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 10,
          );
        } else if (activeLessonId === "m2_l1") {
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 10,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 10,
          );
        } else if (activeLessonId === "m3_l1") {
          updatedSkills.factChecking = Math.min(
            100,
            updatedSkills.factChecking + 12,
          );
          updatedSkills.promptEvaluation = Math.min(
            100,
            updatedSkills.promptEvaluation + 8,
          );
        } else if (activeLessonId === "m3_l2") {
          updatedSkills.instructionFollowing = Math.min(
            100,
            updatedSkills.instructionFollowing + 12,
          );
          updatedSkills.annotation = Math.min(
            100,
            updatedSkills.annotation + 10,
          );
        } else if (activeLessonId === "l6") {
          updatedSkills.annotation = Math.min(
            100,
            updatedSkills.annotation + 8,
          );
          updatedSkills.responseRanking = Math.min(
            100,
            updatedSkills.responseRanking + 6,
          );
          updatedSkills.factChecking = Math.min(
            100,
            updatedSkills.factChecking + 6,
          );
          updatedSkills.safetyReview = Math.min(
            100,
            updatedSkills.safetyReview + 6,
          );
        }
      }

      // Increment active streak count by 1 on completion
      const newStreak = isAlreadyCompleted
        ? prev.streakCount
        : prev.streakCount + 1;

      return {
        ...prev,
        completedLessons: newCompleted,
        xp: prev.xp + xpEarned,
        skills: updatedSkills,
        streakCount: newStreak,
        practiceSubmissions: {
          ...prev.practiceSubmissions,
          ...practiceMeta,
        },
        lastActiveDate: new Date().toISOString(),
      };
    });

    // Take user back to dashboard or modules view on complete
    if (nextLessonId) {
      setActiveLessonId(nextLessonId);
    } else {
      setActiveLessonId(null);
      setActiveTab("dashboard");
    }
    alert(
      "🎉 Master Syllabus Lesson Cleared! +120 XP Credential Points and skill metrics expanded!",
    );
  };

  // Handlers for completing higher level Simulations and Exam Qualifications
  const handleSimulationComplete = (
    score: number,
    strengths: string[],
    weaknesses: string[],
  ) => {
    setStats((prev) => {
      const simId =
        activeModuleId === "m2"
          ? "sim_m2_qual"
          : activeModuleId === "m3"
            ? "sim_m3_qual"
            : activeModuleId === "m4"
              ? "sim_m4_qual"
              : "sim_workspace_foundations";
      const isAlreadyCompleted = prev.completedSimulations.includes(simId);
      const newSim = isAlreadyCompleted
        ? prev.completedSimulations
        : [...prev.completedSimulations, simId];

      const newSkills = { ...prev.skills };
      if (!isAlreadyCompleted && score >= 70) {
        if (activeModuleId === "m2") {
          newSkills.factChecking = Math.min(100, newSkills.factChecking + 12);
          newSkills.promptEvaluation = Math.min(
            100,
            newSkills.promptEvaluation + 10,
          );
        } else if (activeModuleId === "m3") {
          newSkills.instructionFollowing = Math.min(
            100,
            newSkills.instructionFollowing + 15,
          );
          newSkills.annotation = Math.min(100, newSkills.annotation + 12);
        } else if (activeModuleId === "m4") {
          newSkills.responseRanking = Math.min(
            100,
            newSkills.responseRanking + 15,
          );
          newSkills.reasoning = Math.min(100, newSkills.reasoning + 12);
        } else {
          newSkills.factChecking = Math.min(100, newSkills.factChecking + 10);
          newSkills.safetyReview = Math.min(100, newSkills.safetyReview + 8);
          newSkills.annotation = Math.min(100, newSkills.annotation + 15);
        }
      }

      return {
        ...prev,
        completedSimulations: newSim,
        xp: prev.xp + (isAlreadyCompleted ? 50 : 300),
        skills: newSkills,
        lastActiveDate: new Date().toISOString(),
      };
    });

    setActiveTab("dashboard");
    alert(
      `🎯 Simulated Workspace Finished with Accuracy of ${score}%! Vetted transcript loaded into readiness center.`,
    );
  };

  const handleExamComplete = (score: number) => {
    const passed = score >= 80;

    setStats((prev) => {
      const examId =
        activeModuleId === "m2"
          ? "exam_m2_qual"
          : activeModuleId === "m3"
            ? "exam_m3_qual"
            : activeModuleId === "m4"
              ? "exam_m4_qual"
              : "exam_foundations_qual";
      const isAlreadyPassed = prev.passedExams.includes(examId);
      const newExams =
        passed && !isAlreadyPassed
          ? [...prev.passedExams, examId]
          : prev.passedExams;

      const newSkills = { ...prev.skills };
      if (passed && !isAlreadyPassed) {
        // Upgrade overall capabilities on licensure pass
        Object.keys(newSkills).forEach((k) => {
          const sKey = k as keyof typeof newSkills;
          newSkills[sKey] = Math.min(100, Math.round(newSkills[sKey] * 1.15));
        });
      }

      return {
        ...prev,
        passedExams: newExams,
        xp: prev.xp + (passed ? 500 : 50), // major credential milestone points
        skills: newSkills,
        lastActiveDate: new Date().toISOString(),
      };
    });

    setActiveTab("dashboard");
    if (passed) {
      if (activeModuleId === "m2") {
        alert(
          `🏆 Lesson 2 AI Training & Data Quality Specialization Cleared! Vetted as Data Alignment Expert.`,
        );
      } else if (activeModuleId === "m3") {
        alert(
          `🏆 Lesson 3 Supervised Fine-Tuning (SFT) Curation Credentials Cleared! Vetted as SFT Golden Dataset Curation Specialist.`,
        );
      } else if (activeModuleId === "m4") {
        alert(
          `🏆 Lesson 4 Reinforcement Learning from Human Feedback (RLHF) Credentials Cleared! Vetted as RLHF Alignment Expert.`,
        );
      } else {
        alert(
          `🏆 Certified Professional Qualification Cleared! License Key AEA-QUAL activated. Outlier generalist matching activated!`,
        );
      }
    }
  };

  const isSimUnlocked =
    bypassLocks ||
    (activeModuleId === "m1"
      ? stats.completedLessons.filter(
          (id) => id.startsWith("l") && !id.includes("_"),
        ).length >= 3
      : activeModuleId === "m2"
        ? stats.completedLessons.includes("m2_l1")
        : activeModuleId === "m3"
          ? stats.completedLessons.includes("m3_l1")
          : activeModuleId === "m4"
            ? stats.completedLessons.includes("m4_l1")
            : false);

  const isExamUnlocked =
    bypassLocks ||
    (activeModuleId === "m1"
      ? stats.completedLessons.filter(
          (id) => id.startsWith("l") && !id.includes("_"),
        ).length >= 5 &&
        stats.completedSimulations.includes("sim_workspace_foundations")
      : activeModuleId === "m2"
        ? stats.completedLessons.includes("m2_l1") &&
          stats.completedSimulations.includes("sim_m2_qual")
        : activeModuleId === "m3"
          ? stats.completedLessons.includes("m3_l2") &&
            stats.completedSimulations.includes("sim_m3_qual")
          : activeModuleId === "m4"
            ? stats.completedLessons.includes("m4_l1") &&
              stats.completedSimulations.includes("sim_m4_qual")
            : false);

  const getAvatarConfig = (avatarId?: string) => {
    const PRESET_AVATARS = [
      {
        id: "avatar-1",
        label: "Quantum Purple",
        bg: "from-purple-500 to-indigo-600",
        initial: "QP",
      },
      {
        id: "avatar-2",
        label: "Neon Cyberpunk",
        bg: "from-pink-500 to-rose-600",
        initial: "NC",
      },
      {
        id: "avatar-3",
        label: "Emerald Analyst",
        bg: "from-emerald-400 to-teal-600",
        initial: "EA",
      },
      {
        id: "avatar-4",
        label: "Oceanic SFT Expert",
        bg: "from-cyan-400 to-blue-600",
        initial: "OS",
      },
      {
        id: "avatar-5",
        label: "Golden Aligner",
        bg: "from-amber-400 to-orange-600",
        initial: "GA",
      },
      {
        id: "avatar-6",
        label: "Zenith Slate",
        bg: "from-slate-700 to-slate-900",
        initial: "ZS",
      },
    ];
    return PRESET_AVATARS.find((a) => a.id === avatarId) || PRESET_AVATARS[0];
  };

  const activeAvatar = getAvatarConfig(stats.avatarUrl);

  useEffect(() => {
    if (stats.settings?.pacingMode === "speedrun") {
      setBypassLocks(true);
    } else if (stats.settings?.pacingMode === "standard") {
      setBypassLocks(false);
    }
  }, [stats.settings?.pacingMode]);

  return (
    <div
      id="app-root-container"
      className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex transition-all duration-300"
    >
      {/* ================= SIDEBAR MODULE (PERSISTENT ON DESKTOP) ================= */}
      <aside
        id="sidebar-navigation"
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 fixed lg:static h-screen z-50 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          id="sidebar-top-section"
          className="flex-1 min-h-0 p-5 space-y-6 overflow-y-auto"
        >
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/images/logos/global-logo.png"
                alt="Global Ready AIEval"
                width={22}
                height={22}
                className="shrink-0"
              />
              <span className="text-lg font-extrabold text-[#3B28CC] dark:text-indigo-400 tracking-tight flex items-center">
                Global Ready AIEval
              </span>
            </div>
            {/* Close Mobile sidebar */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation links */}
          <nav className="space-y-1">
            <button
              id="tab-btn-dashboard"
              onClick={() => {
                setActiveTab("dashboard");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "dashboard" && !activeLessonId
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Dashboard
            </button>

            <button
              id="tab-btn-modules"
              onClick={() => {
                setActiveTab("modules");
                setActivePartId(null);
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "modules" || activeLessonId !== null
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Learn
            </button>

            <button
              id="tab-btn-simulations"
              onClick={() => {
                setActiveTab("simulations");
                setSimViewInitialMode("sandbox");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === "simulations"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4" />
                Real World Practice Tests
              </div>
              {!isSimUnlocked && (
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              )}
            </button>

            <button
              id="tab-btn-interview"
              onClick={() => {
                setActiveTab("interview");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === "interview"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-455" />
                AI Interview Simulator
              </div>
            </button>

            <button
              id="tab-btn-readiness"
              onClick={() => {
                setActiveTab("readiness");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer ${
                activeTab === "readiness"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <Gauge className="w-4 h-4" />
              Readiness Scores
            </button>

            <button
              id="tab-btn-fail-reasons"
              onClick={() => {
                setActiveTab("fail_reasons");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer relative ${
                activeTab === "fail_reasons"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <FailWarning className="w-4 h-4 shrink-0" />
              Why Evaluators Fail
            </button>

            <button
              id="tab-btn-jobs"
              onClick={() => {
                setActiveTab("jobs");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === "jobs"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 shrink-0" />
                Explore Opportunities
              </div>
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-md font-bold shrink-0">
                Jobs
              </span>
            </button>

            <button
              id="tab-btn-membership"
              onClick={() => {
                setActiveTab("membership");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === "membership"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
                Membership Tiers
              </div>
              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Upgrade
              </span>
            </button>

            <button
              id="tab-btn-accelerator"
              onClick={() => {
                setActiveTab("accelerator");
                setActiveLessonId(null);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === "accelerator"
                  ? "bg-[#4F46E5] text-white shadow-sm font-bold"
                  : "text-slate-600 hover:text-indigo-655 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                Career Accelerator Hub
              </div>
              {stats.membershipTier !== "career_accelerator" && (
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              )}
            </button>
          </nav>
        </div>

        {/* Profile details at bottom of Sidebar */}
        <div
          id="sidebar-bottom-block"
          className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2"
        >
          {/* Relocated Notification Button */}
          <button
            id="sidebar-notifications-btn"
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer text-slate-650 hover:text-indigo-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850"
            title="Notifications"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>Alerts & Notifications</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
          </button>

          <div
            onClick={() => {
              setActiveTab("profile");
              setActiveLessonId(null);
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer min-w-0"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
                alt="Alex Johnson"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate">
                {stats.displayName || "Alex Johnson"}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-none">
                {activeRank}
              </p>
              {/* Membership Tier badge */}
              <div className="mt-1.5 flex">
                {stats.membershipTier === "career_accelerator" ? (
                  <span className="bg-amber-100 dark:bg-amber-950/45 text-amber-700 dark:text-amber-450 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                    <Award className="w-2.5 h-2.5 text-amber-500 shrink-0" />{" "}
                    Accelerator
                  </span>
                ) : stats.membershipTier === "professional" ? (
                  <span className="bg-indigo-100 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-indigo-500 shrink-0" />{" "}
                    Professional
                  </span>
                ) : (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-slate-400 shrink-0" />{" "}
                    Starter
                  </span>
                )}
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hover:text-slate-705 dark:hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Screen masking overlay for responsive mobile sidebar drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        ></div>
      )}

      {/* ================= PRIMARY MASTER LAYOUT BLOCK ================= */}
      <main
        id="primary-content-scroller"
        className="flex-1 flex flex-col min-w-0 overflow-y-auto"
      >
        {/* ================= MAIN TOP STATUS CONTROLLER BAR ================= */}
        <header
          id="overall-app-header"
          className="bg-white dark:bg-slate-900 border-b border-indigo-50/50 dark:border-slate-850 h-16 shrink-0 sticky top-0 z-30 flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-3">
            {/* Hamburger trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeLessonId
                  ? "Theoretical Lesson & Workspace"
                  : activeTab === "dashboard"
                    ? "Global Ready AIEval Dashboard"
                    : activeTab === "modules"
                      ? "Learning Syllabus"
                      : activeTab === "simulations"
                        ? "Real World Practice Tests"
                        : activeTab === "interview"
                          ? "AI Interview Simulator"
                          : activeTab === "membership"
                            ? "Membership Tiers"
                            : activeTab === "accelerator"
                              ? "Career Accelerator Hub"
                              : activeTab === "readiness"
                                ? "Readiness Scores"
                                : activeTab === "fail_reasons"
                                  ? "Why Evaluators Fail"
                                  : activeTab === "jobs"
                                    ? "Explore Opportunities"
                                    : activeTab === "profile"
                                      ? "Account Settings"
                                      : "Global Ready AIEval"}
              </h1>
            </div>
          </div>

          {/* Clean right header - notifications relocated to bottom-left sidebar */}
          <div className="flex items-center gap-3.5"></div>
        </header>

        {/* ================= PRIMARY MASTER RENDERING PANEL ================= */}
        <div
          id="scrollable-content-canvas"
          className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6"
        >
          {/* Active Lesson Frame */}
          {activeLessonId !== null ? (
            (() => {
              // INTERCEPT LOCKED LESSONS FOR STARTER TIER
              if (
                stats.membershipTier === "starter" &&
                activeLessonId !== "l1" &&
                activeLessonId !== "p2_intro" &&
                activeLessonId !== "p2_m1_l1"
              ) {
                let lockedLessonTitle = "Advanced Class";
                let lockedLessonDesc =
                  "This professional lesson contains advanced curriculum content, interactive practice exercises, and scoring parameters.";

                if (activeLessonId.startsWith("p2_")) {
                  if (activeLessonId === "p2_m1_l2") {
                    lockedLessonTitle =
                      "Part 2, Lesson 2: Instruction Following Evaluation";
                    lockedLessonDesc =
                      "Master the absolute highest-priority metric: evaluating explicit and implicit constraints across 5 real-world case studies.";
                  } else if (activeLessonId === "p2_m1_l3") {
                    lockedLessonTitle =
                      "Part 2, Lesson 3: Accuracy & Factuality Evaluation";
                    lockedLessonDesc =
                      "Master how professional AI evaluators identify factual errors, hallucinations, and unsupported claims across 5 complex case studies.";
                  } else if (activeLessonId === "p2_m1_l4") {
                    lockedLessonTitle =
                      "Part 2, Lesson 4: Completeness & Helpfulness Evaluation";
                    lockedLessonDesc =
                      "Distinguish between technically correct and genuinely useful responses under real-world domain assistance.";
                  } else if (activeLessonId === "p2_m1_l5") {
                    lockedLessonTitle =
                      "Part 2, Lesson 5: Clarity, Tone & Audience Alignment";
                    lockedLessonDesc =
                      "Evaluate whether an AI response is easy to understand, matches expected formatting, and speaks perfectly to the intended reader.";
                  } else if (activeLessonId === "p2_m1_l6") {
                    lockedLessonTitle =
                      "Part 2, Lesson 6: Context Tracking & IR Evaluation";
                    lockedLessonDesc =
                      "Check if an AI correctly references and retrieves information from previous conversations and filters out noise.";
                  } else if (activeLessonId === "p2_m1_l7") {
                    lockedLessonTitle =
                      "Part 2, Lesson 7: Response Ranking & Preference Evaluation";
                    lockedLessonDesc =
                      "Compare multiple outputs objectively, resolve close-tie decisions, and draft calibration-quality justifications.";
                  }
                } else {
                  const p1Lesson = moduleCurriculum[0].lessons.find(
                    (l) => l.id === activeLessonId,
                  );
                  if (p1Lesson) {
                    lockedLessonTitle = `Part 1, Lesson ${p1Lesson.id.replace("l", "")}: ${p1Lesson.title}`;
                    lockedLessonDesc =
                      p1Lesson.description ||
                      "Master core RLHF and instruction formatting skills with interactive case studies.";
                  }
                }

                return (
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-lg text-center max-w-3xl mx-auto space-y-6 relative overflow-hidden my-6">
                    <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-50/15 dark:bg-indigo-950/10 rounded-full blur-2xl"></div>
                    <div className="inline-flex p-4.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
                      <Lock className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">
                        Starter Tier Limit Reached
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {lockedLessonTitle}
                      </h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                      {lockedLessonDesc}
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-850/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 max-w-xl mx-auto text-left space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />{" "}
                        Professional Plan Unlocks:
                      </h4>
                      <ul className="text-xs text-slate-600 dark:text-slate-350 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">✓</span>
                          <span>
                            Complete access to all{" "}
                            <strong>12 professional lessons</strong> with
                            interactive grading
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">✓</span>
                          <span>
                            <strong>AI Interview Simulator</strong> with voice
                            practice and platform-specific modes
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">✓</span>
                          <span>
                            Comprehensive skills profiling &amp; verified
                            performance readiness transcripts
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                      <button
                        onClick={() => {
                          setActiveTab("membership");
                          setActiveLessonId(null);
                        }}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                        Upgrade to Professional (€19.99/mo)
                      </button>
                      <button
                        onClick={handleLessonBack}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        Back to Syllabus
                      </button>
                    </div>
                  </div>
                );
              }

              if (activeLessonId === "p2_intro") {
                return (
                  <Part2IntroLessonView
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(50, {}, "p2_m1_l1")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l1") {
                return (
                  <Part2Lesson1View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(100, {}, "p2_m1_l2")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l2") {
                return (
                  <Part2Lesson2View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(120, {}, "p2_m1_l3")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l3") {
                return (
                  <Part2Lesson3View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(120, {}, "p2_m1_l4")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l4") {
                return (
                  <Part2Lesson4View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(120, {}, "p2_m1_l5")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l5") {
                return (
                  <Part2Lesson5View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(120, {}, "p2_m1_l6")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l6") {
                return (
                  <Part2Lesson6View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(120, {}, "p2_m1_l7")}
                  />
                );
              }

              if (activeLessonId === "p2_m1_l7") {
                return (
                  <Part2Lesson7View
                    onBack={handleLessonBack}
                    onComplete={(xp) => handleLessonComplete(120, {})}
                  />
                );
              }

              const activeLesson = moduleCurriculum.flatMap(
                (m) => m.lessons,
              ).find((l) => l.id === activeLessonId);
              if (!activeLesson) return <p>Selected Lesson is missing.</p>;

              return (
                <LessonView
                  lesson={activeLesson}
                  stats={stats}
                  onBack={handleLessonBack}
                  onComplete={handleLessonComplete}
                />
              );
            })()
          ) : (
            /* RENDERS INDIVIDUAL MASTER PANEL SYSTEM */
            <>
              {activeTab === "dashboard" && (
                <DashboardView
                  stats={stats}
                  currentRank={activeRank as any}
                  overallReadiness={overallReadinessScore}
                  activeModule={activeModule}
                  setActiveTab={setActiveTab}
                  startLesson={handleStartLesson}
                  activeModuleId={activeModuleId}
                  setActiveModuleId={setActiveModuleId}
                  setActivePartId={setActivePartId}
                />
              )}

              {activeTab === "modules" &&
                (() => {
                  const part1Lessons = moduleCurriculum.flatMap(
                    (m) => m.lessons,
                  ).map((l) => l.id);
                  const part1CompletedCount = stats.completedLessons.filter(
                    (id) => part1Lessons.includes(id),
                  ).length;
                  const part1TotalCount = part1Lessons.length; // 11
                  const part1Percent = Math.min(
                    100,
                    Math.round((part1CompletedCount / part1TotalCount) * 100),
                  );

                  const part2Lessons = [
                    "p2_intro",
                    "p2_m1_l1",
                    "p2_m1_l2",
                    "p2_m1_l3",
                    "p2_m1_l4",
                    "p2_m1_l5",
                    "p2_m1_l6",
                    "p2_m1_l7",
                  ];
                  const part2CompletedCount = stats.completedLessons.filter(
                    (id) => part2Lessons.includes(id),
                  ).length;
                  const part2TotalCount = part2Lessons.length;
                  const part2Percent = Math.min(
                    100,
                    Math.round((part2CompletedCount / part2TotalCount) * 100),
                  );

                  const PARTS = [
                    {
                      id: "part1",
                      title: "Part 1: AI Evaluation Foundations & RLHF Core",
                      description:
                        "Master human-in-the-loop training, pairwise evaluations, fact-checking, and negative constraint compliance across 6 comprehensive modules.",
                      modulesCount: 6,
                      lessonsCount: part1TotalCount,
                      isUnlocked: true,
                    },
                    {
                      id: "part2",
                      title: "Part 2: Professional AI Evaluation Skills",
                      description:
                        "Learn how professional AI evaluators review responses, use structured workflows, and evaluate key dimensions.",
                      modulesCount: 1,
                      lessonsCount: part2TotalCount,
                      isUnlocked: true,
                    },
                    {
                      id: "part3",
                      title: "Part 3: RLHF Optimization & Reward Modeling",
                      description:
                        "Master advanced pairwise comparative algorithms, RLHF reward optimization, and drafting long, analytical justifications that clear lead QA manual audits.",
                      modulesCount: 4,
                      lessonsCount: 5,
                      isUnlocked: false,
                    },
                    {
                      id: "part4",
                      title: "Part 4: Expert Red-Teaming & Safety Guardrails",
                      description:
                        "Stress-test security boundaries using jailbreaks, identify medical and financial liabilities, audit privacy protection rules, and run adversarial evaluations.",
                      modulesCount: 3,
                      lessonsCount: 3,
                      isUnlocked: false,
                    },
                  ];

                  if (activePartId === null) {
                    return (
                      <div className="space-y-6 animate-fade-in pl-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                              Curriculum Syllabus Tracks
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Select a structured learning track to begin
                              mastering human-in-the-loop AI training and
                              qualifications.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab("dashboard")}
                            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-905 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer self-start md:self-center"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                          </button>
                        </div>

                        <hr className="border-slate-100 dark:border-slate-850" />

                        {/* Grid of Parts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {PARTS.map((part) => {
                            const isPart1 = part.id === "part1";
                            const isPart2 = part.id === "part2";
                            const progressPercent = isPart1
                              ? part1Percent
                              : isPart2
                                ? part2Percent
                                : 0;
                            const completedCount = isPart1
                              ? part1CompletedCount
                              : isPart2
                                ? part2CompletedCount
                                : 0;
                            const totalCount = part.lessonsCount;

                            // Determine active/next lesson ID for direct launching
                            let nextLessonId = "";
                            if (isPart1) {
                              const nextPart1Lesson =
                                moduleCurriculum.flatMap(
                                  (m) => m.lessons,
                                ).find(
                                  (l) => !stats.completedLessons.includes(l.id),
                                ) || moduleCurriculum[0].lessons[0];
                              nextLessonId = nextPart1Lesson.id;
                            } else if (isPart2) {
                              nextLessonId = !stats.completedLessons.includes(
                                "p2_intro",
                              )
                                ? "p2_intro"
                                : !stats.completedLessons.includes("p2_m1_l1")
                                  ? "p2_m1_l1"
                                  : !stats.completedLessons.includes("p2_m1_l2")
                                    ? "p2_m1_l2"
                                  : !stats.completedLessons.includes("p2_m1_l3")
                                    ? "p2_m1_l3"
                                    : !stats.completedLessons.includes(
                                          "p2_m1_l4",
                                        )
                                      ? "p2_m1_l4"
                                      : !stats.completedLessons.includes(
                                            "p2_m1_l5",
                                          )
                                        ? "p2_m1_l5"
                                        : !stats.completedLessons.includes(
                                              "p2_m1_l6",
                                            )
                                          ? "p2_m1_l6"
                                          : "p2_m1_l7";
                            }

                            return (
                              <div
                                key={part.id}
                                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 transition-all ${
                                  part.isUnlocked
                                    ? "hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md"
                                    : "opacity-75 relative overflow-hidden"
                                }`}
                              >
                                {!part.isUnlocked && (
                                  <div className="absolute top-3 right-3 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                                    <Lock className="w-3 h-3" /> Coming Soon
                                  </div>
                                )}

                                <div className="space-y-3">
                                  <span
                                    className={`inline-flex items-center text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider leading-none ${
                                      part.isUnlocked
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                    }`}
                                  >
                                    {part.id.toUpperCase()}
                                  </span>

                                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {part.title}
                                  </h3>

                                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {part.description}
                                  </p>

                                  {/* Info tags */}
                                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-405 font-mono">
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                      <span>{part.modulesCount} Modules</span>
                                    </div>
                                    <span>&bull;</span>
                                    <div>
                                      <span>{part.lessonsCount} Lessons</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Progress block */}
                                <div className="space-y-4 pt-2">
                                  {part.isUnlocked && (
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-450 dark:text-slate-500 font-semibold">
                                          Overall Progress
                                        </span>
                                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                                          {progressPercent}% ({completedCount}/
                                          {totalCount} Completed)
                                        </span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                                          style={{
                                            width: `${progressPercent}%`,
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}

                                  {part.isUnlocked ? (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                                      <button
                                        onClick={() => setActivePartId(part.id)}
                                        className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                                      >
                                        <span>View Track Modules</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (
                                            stats.membershipTier === "starter" &&
                                            nextLessonId !== "l1" &&
                                            nextLessonId !== "p2_intro" &&
                                            nextLessonId !== "p2_m1_l1"
                                          ) {
                                            setActivePartId(part.id);
                                          } else {
                                            handleStartLesson(nextLessonId);
                                          }
                                        }}
                                        className="flex-1 py-3 px-4 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-sm whitespace-nowrap"
                                      >
                                        <span>
                                          {isPart2 &&
                                          nextLessonId === "p2_m1_l2"
                                            ? "Start Lesson 2 (Case Studies)"
                                            : isPart2 &&
                                                nextLessonId === "p2_m1_l3"
                                              ? "Start Lesson 3 (Accuracy)"
                                              : isPart2 &&
                                                  nextLessonId === "p2_m1_l4"
                                                ? "Start Lesson 4 (Completeness)"
                                                : isPart2 &&
                                                    nextLessonId === "p2_m1_l5"
                                                  ? "Start Lesson 5 (Clarity, Tone)"
                                                  : isPart2 &&
                                                      nextLessonId === "p2_m1_l6"
                                                    ? "Start Lesson 6 (Context Tracking)"
                                                    : isPart2 &&
                                                        nextLessonId === "p2_m1_l7"
                                                      ? "Start Lesson 7 (Response Ranking)"
                                                      : isPart2 &&
                                                          stats.completedLessons.includes(
                                                            "p2_m1_l7",
                                                          )
                                                        ? "Review Lesson"
                                                        : "Start Active Lesson"}
                                        </span>
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      disabled
                                      className="w-full py-3 px-4 bg-slate-50 text-slate-400 dark:bg-slate-855 dark:text-slate-600 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-not-allowed"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Track Locked</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (activePartId === "part2") {
                    return (
                      <Part2IntroView
                        onBack={() => setActivePartId(null)}
                        onBegin={() => handleStartLesson("p2_m1_l1")}
                        completedLessons={stats.completedLessons}
                        onStartLesson={(lessonId) =>
                          handleStartLesson(lessonId)
                        }
                        membershipTier={stats.membershipTier}
                      />
                    );
                  }

                  // If activePartId === "part1", render modules list as before
                  return (
                    <div className="space-y-4 animate-fade-in pl-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <button
                          onClick={() => setActivePartId(null)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-905 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Curriculum Parts
                        </button>
                        {/* Track Switcher */}
                        <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl w-full md:max-w-md gap-1 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                          {moduleCurriculum.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setActiveModuleId(m.id)}
                              className={`flex-1 min-w-[70px] py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                activeModuleId === m.id
                                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                              }`}
                            >
                              {m.title.split(":")[0].trim()}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Module header card */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {activeModule.title}
                        </h2>
                        <p className="text-xs text-slate-450 mt-1 max-w-xl">
                          {activeModule.description}
                        </p>

                        <div className="mt-4 flex gap-4 text-xs font-mono">
                          <div>
                            <span className="text-slate-405">Lessons: </span>
                            <span className="font-bold text-slate-850 dark:text-white">
                              {
                                activeModule.lessons.filter((l) =>
                                  stats.completedLessons.includes(l.id),
                                ).length
                              }{" "}
                              / {activeModule.lessons.length} complete
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-405">
                              Total Duration:{" "}
                            </span>
                            <span className="font-bold text-slate-850 dark:text-white">
                              {activeModuleDuration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Complete syllabus lessons listed vertically */}
                      <div className="space-y-4">
                        {activeModule.lessons.map((lesson, idx) => {
                          const completed = stats.completedLessons.includes(
                            lesson.id,
                          );
                          const isNextUnlocked =
                            idx === 0 ||
                            stats.completedLessons.includes(
                              activeModule.lessons[idx - 1].id,
                            );
                          const isLock = !completed && !isNextUnlocked;

                          return (
                            <div
                              key={lesson.id}
                              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                                isLock
                                  ? "opacity-60"
                                  : "hover:border-indigo-400 hover:scale-[1.002]"
                              }`}
                            >
                              <div className="flex gap-4 items-start min-w-0">
                                {completed ? (
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400 text-xs font-bold font-mono border shrink-0">
                                    {idx + 1}
                                  </div>
                                )}

                                <div className="space-y-1 min-w-0">
                                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                    {lesson.title}
                                    {completed && (
                                      <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        Passed
                                      </span>
                                    )}
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-normal truncate">
                                    {lesson.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                                    <span>Duration: {lesson.duration}</span>
                                    <span>&bull;</span>
                                    <span>
                                      {lesson.practiceLab.length} Practice
                                      annotations
                                    </span>
                                    <span>&bull;</span>
                                    <span>
                                      {lesson.miniCaseStudies.length} Expert
                                      Case studies
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                                {stats.membershipTier === "starter" &&
                                lesson.id !== "l1" ? (
                                  <button
                                    onClick={() => handleStartLesson(lesson.id)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Upgrade to Unlock</span>
                                  </button>
                                ) : completed ? (
                                  <button
                                    onClick={() => handleStartLesson(lesson.id)}
                                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                                  >
                                    Review Class Notes
                                  </button>
                                ) : isNextUnlocked || bypassLocks ? (
                                  <button
                                    onClick={() => handleStartLesson(lesson.id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-white" />
                                    Start Learning Track
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-350 dark:text-slate-650 flex items-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5" />{" "}
                                    Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

              {activeTab === "simulations" && (
                <SimulationView
                  stats={stats}
                  onComplete={handleSimulationComplete}
                  isUnlocked={isSimUnlocked}
                  onBypass={() => setBypassLocks(true)}
                  onBack={() => setActiveTab("dashboard")}
                  simulationTasks={activeModule.simulationTasks}
                  isExamUnlocked={isExamUnlocked}
                  examQuestions={activeModule.examQuestions}
                  onExamComplete={handleExamComplete}
                  initialMode={simViewInitialMode}
                />
              )}

              {activeTab === "interview" && (
                <div className="space-y-4 max-w-5xl mx-auto pl-1 animate-fade-in">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer font-sans"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                  {stats.membershipTier === "starter" ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 border-2 border-slate-200 dark:border-slate-800 shadow-lg text-center max-w-3xl mx-auto space-y-6 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl"></div>
                      <div className="inline-flex p-4.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        AI Interview Simulator Locked
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Practice realistic platform-specific interviews with
                        voice-AI grading for platforms like{" "}
                        <strong>
                          Mercor, Micro1, Scale AI, Outlier, Alignerr,
                          Invisible,
                        </strong>{" "}
                        and <strong>General AI Evaluator</strong>. Upgrade to{" "}
                        <strong>Professional</strong> to unlock unlimited
                        attempts, scenario-based questions, adaptive
                        questioning, and your complete readiness score!
                      </p>
                      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                        <button
                          onClick={() => setActiveTab("membership")}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Upgrade to Professional
                        </button>
                        <button
                          onClick={() => setActiveTab("dashboard")}
                          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Explore Dashboard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <InterviewSimulator
                      stats={stats}
                      onComplete={handleSimulationComplete}
                      onBack={() => setActiveTab("dashboard")}
                    />
                  )}
                </div>
              )}

              {activeTab === "membership" && (
                <MembershipView
                  stats={stats}
                  setStats={setStats}
                  onBack={() => setActiveTab("dashboard")}
                  onNavigateToTab={(tabId) => setActiveTab(tabId)}
                />
              )}

              {activeTab === "accelerator" && (
                <AcceleratorHubView
                  stats={stats}
                  onUpgradeClick={() => setActiveTab("membership")}
                  onBack={() => setActiveTab("dashboard")}
                />
              )}

              {activeTab === "readiness" && (
                <ReadinessView
                  stats={stats}
                  overallScore={overallReadinessScore}
                  onBack={() => setActiveTab("dashboard")}
                />
              )}

              {activeTab === "fail_reasons" && (
                <FailReasonsView
                  stats={stats}
                  onBack={() => setActiveTab("dashboard")}
                />
              )}

              {activeTab === "jobs" && (
                <JobsView
                  stats={stats}
                  jobs={jobs}
                  onBack={() => setActiveTab("dashboard")}
                  setActiveTab={setActiveTab}
                  setSimSubMode={setSimViewInitialMode}
                />
              )}

              {activeTab === "profile" && (
                <div className="space-y-4 max-w-4xl mx-auto pl-1">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-455 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                  </button>
                  <ProfileView
                    stats={stats}
                    setStats={setStats}
                    activeRank={activeRank}
                    overallReadiness={overallReadinessScore}
                    setActiveTab={setActiveTab}
                    moduleCurriculum={moduleCurriculum}
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
