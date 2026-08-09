import React, { useState } from "react";
import { 
  Lock, Calendar, Users, Star, ArrowLeft, Send, CheckCircle, 
  Sparkles, Award, FileText, Linkedin, MessageSquare, Clock, ArrowRight, Video, ChevronRight
} from "lucide-react";
import { UserStats } from "../types";

interface AcceleratorHubViewProps {
  stats: UserStats;
  onUpgradeClick: () => void;
  onBack?: () => void;
}

export default function AcceleratorHubView({ stats, onUpgradeClick, onBack }: AcceleratorHubViewProps) {
  const isUnlocked = stats.membershipTier === "career_accelerator";
  
  // Interactive mock states for unlocked accelerator hub
  const [cvSubmitted, setCvSubmitted] = useState(false);
  const [cvText, setCvText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinSubmitted, setLinkedinSubmitted] = useState(false);
  const [rationaleSubmitted, setRationaleSubmitted] = useState(false);
  const [rationaleText, setRationaleText] = useState("");
  const [selectedOfficeHoursSlot, setSelectedOfficeHoursSlot] = useState<string | null>(null);

  // Mock schedule data for live masterminds
  const MASTERMIND_EVENTS = [
    {
      id: "ev1",
      title: "Weekly Mastermind: Scaling Up RLHF Annotations",
      presenter: "John Doe (CEO) & Invited Guests from Scale AI",
      date: "Thursday, July 2, 2026",
      time: "10:00 AM - 11:30 AM (Pacific Time)",
      type: "Mastermind",
      attendeesCount: 42
    },
    {
      id: "ev2",
      title: "Platform AMA & Hiring Trends: Navigating Alignerr & Outlier",
      presenter: "Sarah Jenkins (Lead Expert Recruiter at Invisible)",
      date: "Tuesday, July 7, 2026",
      time: "2:00 PM - 3:00 PM (Pacific Time)",
      type: "Q&A",
      attendeesCount: 29
    },
    {
      id: "ev3",
      title: "Mock Hiring Day: Live Scenario Calibration and Scoring Tests",
      presenter: "John Doe & Senior Evaluator Judges",
      date: "Saturday, July 11, 2026",
      time: "9:00 AM - 1:00 PM (Pacific Time)",
      type: "Mock Hiring",
      attendeesCount: 55
    }
  ];

  // Locked View layout (for Starter or Professional tiers)
  if (!isUnlocked) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in pb-24">
        {/* Header navigation */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AI Career Hub
          </button>
          
          <span className="text-xs font-mono text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            Locked Feature (Career Accelerator Tier)
          </span>
        </div>

        {/* Lock Screen Card */}
        <div className="relative bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-12 border-2 border-amber-500/30 dark:border-amber-500/20 shadow-lg overflow-hidden text-center max-w-3xl mx-auto">
          {/* Subtle gold gradients */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-0 bottom-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Locked Icon Header */}
          <div className="inline-flex p-4.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-full text-amber-500 mb-6 relative">
            <Lock className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
            Unlock Expert Career Support & Private Community
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-8">
            The **Career Accelerator Hub** is reserved exclusively for Tier 3 members. Upgrade today to unlock personalized 1-on-1 human feedback and join peer mastermind sessions.
          </p>

          {/* Locked Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-10">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-mono">
                <Users className="w-4 h-4 text-amber-500" /> Premium Community
              </span>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans mt-1">
                Access private networking groups, weekly mastermind sessions, and direct Q&A calls with John and industry experts.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-mono">
                <FileText className="w-4 h-4 text-amber-500" /> Personalized CV Review
              </span>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans mt-1">
                Submit your CV/Resume for granular written reviews, markup, and structural editing from expert coaches.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-mono">
                <Linkedin className="w-4 h-4 text-amber-500" /> LinkedIn Optimization
              </span>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans mt-1">
                Get written auditing of your LinkedIn profile keywords and structure to force recruiters to find you.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-1.5">
              <span className="flex items-center gap-2 text-xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider font-mono">
                <Award className="w-4 h-4 text-amber-500" /> Calibration Feedback
              </span>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-sans mt-1">
                Struggling with exam rationales? Submit your reasoning calibrations and have senior evaluators grade them.
              </p>
            </div>
          </div>

          {/* Upgrade Call To Action */}
          <div className="space-y-4 max-w-md mx-auto">
            <button
              onClick={onUpgradeClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4.5 h-4.5 text-white" />
              Upgrade to Career Accelerator
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 font-mono">
              Includes full access to the AI Interview Simulator + premium support + personal CV audits.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Unlocked View layout (for Career Accelerator members)
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in pb-24 space-y-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-850 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 font-mono flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" />
            Elite Member Workspace
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Career Accelerator Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
            Welcome to your premium coaching environment. Here you can attend weekly live masterminds, request human audits, and book office hours.
          </p>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          AI Career Hub
        </button>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Community & Masterminds Schedule (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Community quick links */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-950 dark:from-slate-900 dark:to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-850">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-md">
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                  Active Community
                </span>
                <h3 className="text-xl font-bold tracking-tight">Private Accelerator Discord Server</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Join other Accelerator members, share test questions, collaborate on rationales, and get platform hiring alerts first.
                </p>
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <a
                  href="#discord"
                  onClick={(e) => { e.preventDefault(); alert("Welcome to the Private Academy Discord! Link copied to clipboard."); }}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  Connect Discord Account
                </a>
                <a
                  href="#telegram"
                  onClick={(e) => { e.preventDefault(); alert("Subscribed to instant priority hiring alerts channel on Telegram."); }}
                  className="px-5 py-3 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700/50 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Hiring Alerts Telegram
                </a>
              </div>
            </div>
          </div>

          {/* Masterminds events schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-slate-850 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0 mb-0 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Live Masterminds & Experts Q&A Schedule
              </h3>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                3 Events Scheduled
              </span>
            </div>

            <div className="space-y-4">
              {MASTERMIND_EVENTS.map((event) => (
                <div 
                  key={event.id}
                  className="p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-500/20 dark:hover:border-amber-500/20 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        event.type === "Mastermind" 
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                          : event.type === "Q&A"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {event.attendeesCount} peers attending
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-850 dark:text-white my-0 leading-snug">
                      {event.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 my-0">
                      Host: <span className="font-semibold">{event.presenter}</span>
                    </p>
                  </div>

                  <div className="shrink-0 space-y-2 text-right w-full sm:w-auto">
                    <div className="text-xs text-slate-600 dark:text-slate-350">
                      <p className="font-bold my-0">{event.date}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{event.time}</p>
                    </div>

                    <button
                      onClick={() => alert(`Registration confirmed! Link to join call on Zoom has been sent to ${stats.email}.`)}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Register Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rationale feedback portal */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-slate-850 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0 mb-0 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              1-on-1 Evaluation Rationale Auditing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed my-0">
              Struggling with complex prompt evaluation, ranking justifications, or fact-checking justifications? Submit a scenario rationale here and John or senior coaches will critique your writing with detailed structural feedback within 24 hours.
            </p>

            {rationaleSubmitted ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 py-8">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <h4 className="text-sm font-bold my-0">Rationale Submitted for Expert Audit</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400 max-w-md my-0 leading-relaxed">
                  Excellent work! A senior calibration coach will review your submitted reasoning and email a detailed rubric markup report to your active address within 24 hours.
                </p>
                <button
                  onClick={() => { setRationaleSubmitted(false); setRationaleText(""); }}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer mt-3"
                >
                  Submit Another Rationale
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-750 dark:text-slate-350 font-mono uppercase tracking-wider">
                    Paste the task prompt & response, followed by your rationale:
                  </label>
                  <textarea
                    rows={4}
                    value={rationaleText}
                    onChange={(e) => setRationaleText(e.target.value)}
                    placeholder="e.g. Prompt: 'Evaluate why response A is better than B...'\nMy Rationale: 'Response A is more helpful because it contains accurate formatting...'"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-amber-500 font-sans leading-relaxed"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!rationaleText.trim()) {
                        alert("Please paste some details before submitting.");
                        return;
                      }
                      setRationaleSubmitted(true);
                    }}
                    className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit for Expert Rationale Review
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: CV & LinkedIn Auditing & Office Hours Scheduling */}
        <div className="space-y-8">
          
          {/* CV Written Audit */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-slate-850 space-y-5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0 mb-0 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              Professional CV Markup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed my-0">
              Get an in-depth human review of your resume. Paste your current CV details below to get direct written audits and improvement mockups.
            </p>

            {cvSubmitted ? (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-400 rounded-2xl text-center space-y-2 py-6">
                <CheckCircle className="w-8 h-8 text-indigo-500 mx-auto" />
                <h4 className="text-xs font-bold my-0">CV Details Received</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed my-0">
                  Awesome! John's expert CV team will mark up your structure, highlight keyword updates, and send a comprehensive review report to you.
                </p>
                <button
                  onClick={() => { setCvSubmitted(false); setCvText(""); }}
                  className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Reset Form
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={4}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste CV text or outline current experience (e.g., job titles, skills)..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 font-sans"
                />
                <button
                  onClick={() => {
                    if (!cvText.trim()) {
                      alert("Please paste some CV text first.");
                      return;
                    }
                    setCvSubmitted(true);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit CV for Audit
                </button>
              </div>
            )}
          </div>

          {/* LinkedIn Profile Review */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-slate-850 space-y-5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0 mb-0 flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-indigo-500" />
              LinkedIn Audit & SEO Optimize
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed my-0">
              Submit your profile URL to align your headlines, project summaries, and certifications to the highest paying AI evaluation jobs.
            </p>

            {linkedinSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl text-center space-y-2 py-6">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold my-0">LinkedIn URL Logged</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed my-0">
                  Great! Our LinkedIn branding expert will review your profile SEO tags and email you custom copywriting for your profile.
                </p>
                <button
                  onClick={() => { setLinkedinSubmitted(false); setLinkedinUrl(""); }}
                  className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Reset Form
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-indigo-500 font-sans"
                />
                <button
                  onClick={() => {
                    if (!linkedinUrl.trim()) {
                      alert("Please provide your LinkedIn profile URL first.");
                      return;
                    }
                    setLinkedinSubmitted(true);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit LinkedIn URL
                </button>
              </div>
            )}
          </div>

          {/* Expert Office Hours Slots */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-150 dark:border-slate-850 space-y-5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0 mb-0 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              1-on-1 Office Hours with Experts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed my-0">
              Book a personal, 15-minute consulting slot on Zoom with John or invited platform evaluation managers. Ask anything, review complex exams, or map career strategies.
            </p>

            <div className="space-y-2">
              {[
                { id: "sl1", desc: "Mon, July 6 at 10:15 AM with John", status: "Available" },
                { id: "sl2", desc: "Wed, July 8 at 3:00 PM with John", status: "Available" },
                { id: "sl3", desc: "Fri, July 10 at 11:30 AM with Aligner Lead", status: "Available" }
              ].map((slot) => {
                const isSelected = selectedOfficeHoursSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedOfficeHoursSlot(null);
                      } else {
                        setSelectedOfficeHoursSlot(slot.id);
                        alert(`Confirmed! You have booked: "${slot.desc}". A calendar invite has been sent to your registered email (${stats.email}) with the Zoom credentials.`);
                      }
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 hover:border-amber-500/30 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{slot.desc}</span>
                    <span className={`text-[10px] font-bold ${isSelected ? "text-emerald-500" : "text-amber-500"}`}>
                      {isSelected ? "Booked!" : "Book Slot"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
