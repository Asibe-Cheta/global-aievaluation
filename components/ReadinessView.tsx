import React from "react";
import { 
  Gauge, TrendingUp, Sparkles, CheckCircle,
  ChevronRight, Compass, ShieldAlert, Award, ArrowLeft
} from "lucide-react";
import { UserStats } from "../types";

interface ReadinessViewProps {
  stats: UserStats;
  overallScore: number;
  onBack: () => void;
}

export default function ReadinessView({ stats, overallScore, onBack }: ReadinessViewProps) {
  
  // Custom explanations and coaching tips for each competency parameter
  const competencies = [
    { 
      name: "Prompt Evaluation & Constraint Matching", 
      score: stats.skills.promptEvaluation, 
      desc: "Ability to map negative exclusions and conditional logic guidelines in instructions.",
      key: "promptEvaluation"
    },
    { 
      name: "Response Contrast Ranking", 
      score: stats.skills.responseRanking, 
      desc: "Determining distinct compliance gradients between two high-quality model outputs.",
      key: "responseRanking"
    },
    { 
      name: "Factual Veracity & Hallucination Audit", 
      score: stats.skills.factChecking, 
      desc: "Skepticism to cross-check claims against external evidence structures and identify subtle lies.",
      key: "factChecking"
    },
    { 
      name: "Safety Taxonomy & Harms Review", 
      score: stats.skills.safetyReview, 
      desc: "Cataloging toxic instructions, jailbreaks, PII exposures, or weaponization vectors.",
      key: "safetyReview"
    },
    { 
      name: "Annotation & Descriptive Taxonomy", 
      score: stats.skills.annotation, 
      desc: "Assigning precise tag nodes and metadata spans with alignment guidelines consistency.",
      key: "annotation"
    },
    { 
      name: "Detailed Commentary Justification", 
      score: stats.skills.reasoning, 
      desc: "Composing pristine analytical arguments detailing which directive clause was explicitly broken.",
      key: "reasoning"
    },
    { 
      name: "Strict Directive Compliance Tracking", 
      score: stats.skills.instructionFollowing, 
      desc: "Ensuring output adheres to formal length, negative keywords, headers and formatting constraint systems.",
      key: "instructionFollowing"
    }
  ];

  // Helper for coaching advice based on score brackets
  const getCoachingText = (score: number) => {
    if (score >= 80) {
      return {
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100",
        label: "ELITE ALIGNED",
        tip: "Outstanding. You meet expert senior reviewer compliance specs. Approved to operate as lead auditor."
      };
    }
    if (score >= 65) {
      return {
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100",
        label: "PRACTITIONER STANDING",
        tip: "Satisfactory. Core parameters are valid. Study custom 'Why Evaluators Fail' trap case lists to touch 80%."
      };
    }
    return {
      color: "text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 border-rose-100",
      label: "REMEDIAL WARNING",
      tip: "Substandard. Run Lesson Case Studies again & write longer rationales in labs to acquire licensing status."
    };
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LHS Circular Score gauge & Career matches */}
      <div className="space-y-6">
        {/* Core Readiness circular dial */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center space-y-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-extrabold flex items-center justify-center gap-1">
            <Gauge className="w-4 h-4 text-indigo-650" />
            Core Global Ready AIEval Readiness Index
          </p>
          
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Simple premium circular dial with CSS svg gradient */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="72" cy="72" r="60" 
                className="stroke-slate-100 dark:stroke-slate-800" 
                strokeWidth="11" 
                fill="transparent" 
              />
              <circle 
                cx="72" cy="72" r="60" 
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-700" 
                strokeWidth="11" 
                fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - overallScore / 100)}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-905 dark:text-white">{overallScore}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Onboarding Index</span>
            </div>
          </div>

          <div className="pt-2">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${
              overallScore >= 80 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {overallScore >= 80 ? "PRE-QUALIFIED ELITE" : "DEVELOPING COMPETENCY"}
            </span>
            <p className="text-[11px] text-slate-450 mt-3 leading-relaxed">
              Calculated dynamically as the organic average of your lesson labs, qualification quizzes, and simulators.
            </p>
          </div>
        </div>

      </div>

      {/* RHS Detailed skills bars listing */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Competency Breakdown & Diagnostic Audit</h3>
          <p className="text-xs text-slate-500">Continuous review parameters required by contract agencies</p>
        </div>

        <div className="space-y-5">
          {competencies.map((comp, i) => {
            const coaching = getCoachingText(comp.score);
            return (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{comp.name}</span>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{comp.desc}</p>
                  </div>
                  <span className="font-bold text-slate-950 dark:text-white shrink-0 ml-4 font-mono">{comp.score}%</span>
                </div>
                
                {/* Visual Progress Slider bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      comp.score >= 80 
                        ? "bg-emerald-500" 
                        : comp.score >= 65 
                          ? "bg-amber-400" 
                          : "bg-rose-500"
                    }`}
                    style={{ width: `${comp.score}%` }}
                  ></div>
                </div>

                {/* Local expert coaching tag line */}
                <div className={`p-2.5 rounded-lg border text-[10px] leading-relaxed ${coaching.color}`}>
                  <span className="font-extrabold tracking-wider mr-1.5 uppercase shrink-0 text-[9px]">{coaching.label}:</span>
                  {coaching.tip}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  );
}
