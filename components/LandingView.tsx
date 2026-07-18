"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight, ShieldCheck, DollarSign, Clock, Globe, Lock,
  Users, CheckCircle2, ChevronDown, ChevronUp, Star, ChevronLeft,
  Sparkles, Briefcase, Award, GraduationCap, Play, HelpCircle, Zap
} from "lucide-react";

interface LandingViewProps {
  onEnterPlatform: () => void;
}

export default function LandingView({ onEnterPlatform }: LandingViewProps) {
  // State for FAQ Accordions
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // State for Testimonials Slider
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // State for "What You'll Do" interactive tab
  const [activeTaskTab, setActiveTaskTab] = useState<"prompts" | "evaluation" | "verification" | "multimodal">("prompts");

  const testimonials = [
    {
      name: "Rajesh Sharma",
      location: "Mumbai, India",
      earnings: "Scale AI Qualified",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
      quote: "What started as extra cash on weekends turned into my full-time thing. Passing the Scale assessments was incredibly easy after finishing this prep curriculum."
    },
    {
      name: "Sarah Jenkins",
      location: "Austin, USA",
      earnings: "Alignerr Qualified",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
      quote: "Global Ready AIEval's practice tests helped me clear the Alignerr qualification exam on my very first attempt! I'm now earning $55/hr evaluating LLM code outputs."
    },
    {
      name: "Michael Chen",
      location: "Vancouver, Canada",
      earnings: "Outlier Qualified",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
      quote: "The safety-evaluation exercises here are incredibly realistic. The platform taught me the 'Extreme Skepticism' mindset needed to pass strict scale quality audits easily."
    }
  ];

  const faqs = [
    {
      question: "What equipment do I need?",
      answer: "All you need is a computer, laptop, or tablet with a reliable internet connection, and strong reading comprehension skills. No python programming or advanced math background is required."
    },
    {
      question: "How much can I earn?",
      answer: "Remote evaluators and annotators on premium platforms like DataAnnotation, Outlier, Alignerr, Scale AI, Mercor, Micro1, and Prolific earn between $15/hr to $100+/hr depending on the project, language skills, domain expertise, and test scores."
    },
    {
      question: "When and how do I get paid?",
      answer: "Most major annotation platforms distribute payments weekly via digital payout channels like PayPal or direct deposits. Global Ready AIEval trains you to pass their qualification exams to unlock these paid opportunities."
    },
    {
      question: "Is there a minimum time commitment?",
      answer: "No. You have absolute freedom to work as much or as little as you want, completely on your own schedule from anywhere in the world."
    },
    {
      question: "What types of tasks will I be doing?",
      answer: "You will write prompts to test AI capabilities, compare competing LLM outputs (pairwise evaluation), verify claims for accurate fact-checking, and audit responses for safety guidelines."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We do not sell or distribute your personal profile details. All your lesson progress and exam results are stored safely on your own local device."
    },
    {
      question: "Which countries are you available in?",
      answer: "We are available worldwide! Anyone with an internet connection and fluent English writing skills can complete our curriculum and start applying for remote evaluator positions."
    }
  ];

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-all duration-300">
      
      {/* 1. TOP UTILITY ANNOUNCEMENT BAR */}
      <div className="bg-[#4F46E5] text-white text-[11px] sm:text-xs py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-1.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Unlock $15–$100+/Hr Remote Jobs: Pass Outlier, DataAnnotation, Alignerr, and Scale AI Exams on Your 1st Try!</span>
      </div>

      {/* 2. NAVIGATION HEADER CONTAINER */}
      <header className="border-b border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/logos/global-logo.png"
              alt="Global Ready AIEval"
              width={28}
              height={28}
            />
            <span className="text-xl font-extrabold text-[#3B28CC] dark:text-indigo-400 tracking-tight">
              Global Ready AIEval
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
            <a href="#what-you-do" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">What You'll Do</a>
            <a href="#why-join" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Why Train With Us</a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a>
          </nav>

          <button 
            onClick={onEnterPlatform}
            className="bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Enter Global Ready AIEval</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. HERO SHOWCASE SECTION */}
      <section className="relative py-20 sm:py-24 px-6 overflow-hidden">
        {/* Ambient Gradient glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 text-[11px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-xs border border-[#E0E8FF] dark:border-indigo-900/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The #1 AI Data Annotator &amp; RLHF Training Simulator</span>
          </div>

          {/* Main Display Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Pass Qualification Exams. <br />
            Land a <span className="text-[#4F46E5] dark:text-indigo-400 relative inline-block">$15–$100/Hr Remote AI Job</span>
          </h1>

          {/* Subheading text */}
          <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Get hired on high-paying AI annotation platforms like <strong>DataAnnotation.tech</strong>, <strong>Outlier.ai</strong>, <strong>Alignerr</strong>, <strong>Scale AI</strong>, and <strong>Prolific</strong>. Master pairwise comparison, instruction-following, SFT justifications, and spot AI hallucinations instantly through interactive simulated mock assessments!
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onEnterPlatform}
              className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#3B28CC] text-white font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Access Qualification Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onEnterPlatform}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold px-8 py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View SEO Career Roadmap</span>
            </button>
          </div>

          {/* Safety Bullet labels */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-6 text-xs text-slate-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Realistic Outlier &amp; Scale Assessment Drills</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Step-by-Step Justification &amp; Feedback Guides</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>High-Converting Resume &amp; Profile Keywords</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY STATS BANNER */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-850 rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-[#4F46E5] dark:text-indigo-400">2,450+</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Hired Graduates</p>
          </div>
          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800/80 pl-2">
            <p className="text-3xl sm:text-4xl font-black text-[#4F46E5] dark:text-indigo-400">35,000+</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Simulations Completed</p>
          </div>
          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800/80 pl-2">
            <p className="text-3xl sm:text-4xl font-black text-[#4F46E5] dark:text-indigo-400">96.8%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Exam Pass Rate</p>
          </div>
          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800/80 pl-2">
            <p className="text-3xl sm:text-4xl font-black text-[#4F46E5] dark:text-indigo-400">$38.50</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Avg. Hourly Earnings</p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE "WHAT YOU'LL DO" MODULE */}
      <section id="what-you-do" className="bg-slate-100/50 dark:bg-slate-900/30 py-20 border-y border-slate-200/50 dark:border-slate-900 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              What You'll <span className="text-[#4F46E5] dark:text-indigo-455">Learn &amp; Practice</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              No tech background required! We break down the absolute essentials of AI testing and data annotation into friendly, bite-sized practice runs.
            </p>
          </div>

          {/* Interactive Navigation Switcher */}
          <div className="grid grid-cols-2 md:flex bg-slate-200/60 dark:bg-slate-850 p-1 rounded-2xl max-w-2xl mx-auto border border-slate-300/30 dark:border-slate-800 gap-1">
            <button 
              onClick={() => setActiveTaskTab("prompts")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTaskTab === "prompts" 
                  ? "bg-white dark:bg-slate-900 text-[#4F46E5] dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              1. Testing with Prompts
            </button>
            <button 
              onClick={() => setActiveTaskTab("evaluation")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTaskTab === "evaluation" 
                  ? "bg-white dark:bg-slate-900 text-[#4F46E5] dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              2. Data Annotation &amp; Rating
            </button>
            <button 
              onClick={() => setActiveTaskTab("verification")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTaskTab === "verification" 
                  ? "bg-white dark:bg-slate-900 text-[#4F46E5] dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              3. Checking for Facts
            </button>
            <button 
              onClick={() => setActiveTaskTab("multimodal")}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTaskTab === "multimodal" 
                  ? "bg-white dark:bg-slate-900 text-[#4F46E5] dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              4. Rating Images &amp; AI Slop
            </button>
          </div>

          {/* Tab content panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs">
            {activeTaskTab === "prompts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-black text-[#4F46E5] dark:text-indigo-400 tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md">
                    Domain A: Creative Prompting
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Testing AI with Creative Prompts</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Learn how to ask the AI clever questions to see if it follows instructions. You'll practice writing simple prompts with fun challenges (like writing a short letter without using the letter "e" or formatting a response) to test how smart the AI is.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-305">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Ask tricky questions using everyday language</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Set creative rules for the AI to follow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Have natural, guided conversations to spot errors</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-3">
                  <div className="border-b border-slate-200 dark:border-slate-850 pb-2">
                    <span className="text-indigo-600 dark:text-indigo-455 font-bold"># CREATIVE_PROMPT_PRACTICE:</span>
                  </div>
                  <p className="italic bg-white dark:bg-slate-900 p-3 rounded-lg border dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300">
                    "Write a 3-sentence summary of the solar system. You must NOT use any commas, and your first word must be 'Jupiter'."
                  </p>
                  <div className="text-right text-[10px] text-slate-400 font-bold">
                    [Creative Constraint Met Successfully]
                  </div>
                </div>
              </div>
            )}

            {activeTaskTab === "evaluation" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-black text-[#4F46E5] dark:text-indigo-400 tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md">
                    Domain B: Side-by-Side Annotation
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Comparing &amp; Annotating AI Responses</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    This is the heart of <strong>Data Annotation</strong>. You will look at two different answers written by the AI side-by-side, decide which one is better, and label (annotate) any mistakes. We'll show you exactly how to write short, simple comments explaining your score to bypass platform queues.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-305">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Choose the more helpful, natural-sounding answer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Mark errors, bad formatting, or repetitive text</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Write clear, simple justifications for your score</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">Response A (Ideal SFT)</span>
                      <span className="text-[10px] text-slate-400">Perfect structure, followed all constraints.</span>
                    </div>
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">PREFERRED</span>
                  </div>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs flex justify-between items-center opacity-70">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">Response B (Failed Draft)</span>
                      <span className="text-[10px] text-slate-400">Contained commas (broke the negative rule).</span>
                    </div>
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">REJECTED</span>
                  </div>
                </div>
              </div>
            )}

            {activeTaskTab === "verification" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-black text-[#4F46E5] dark:text-indigo-400 tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md">
                    Domain C: Fact &amp; Truth Checking
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Finding &amp; Flagging AI "Hallucinations"</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Sometimes AIs confidently make up completely fake facts (called "hallucinations"). You'll practice searching the web and checking trustworthy sources to make sure the AI's claims about history, science, dates, or pop culture are 100% true.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-305">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Check dates, names, numbers, and basic facts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Double-check links and sources against real search results</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Flag and label false information with ease</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Hallucination Flagged</span>
                  </div>
                  <p className="leading-relaxed text-slate-650 dark:text-slate-400">
                    "The model claimed React 19 was released in 2021. Real official documentation confirms React 19 was introduced in 2024, indicating a major temporal hallucination."
                  </p>
                </div>
              </div>
            )}

            {activeTaskTab === "multimodal" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-black text-[#4F46E5] dark:text-indigo-400 tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-md">
                    Domain D: Aesthetic &amp; Slop Auditing
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rating Images &amp; Cleaning AI Slop</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    AI platforms are often clogged with robotic text (like overusing the words <em>"delve"</em> or <em>"testament"</em>) and weirdly distorted images. You'll learn to grade image appeal, spot visual glitches, and replace clunky AI text with natural, human sentences.
                  </p>
                  <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-305">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Judge image aesthetics, lighting, and detail errors</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Spot and remove boring, repetitive "AI slop" copy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5]" />
                      <span>Simple, non-technical exercises based entirely on everyday intuition</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3">
                    <div className="text-[10px] uppercase font-bold text-[#4F46E5]">
                      # AI Slop Detection
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                      "Let us <span className="bg-rose-500/20 text-rose-700 px-1 rounded font-bold">delve</span> deep, as it is a <span className="bg-rose-500/20 text-rose-700 px-1 rounded font-bold">testament</span> to our..."
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recommended Human Fix: "Let's explore how..."</span>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-white block">Image Artifact Check</span>
                      <span className="text-[10px] text-slate-400">Flag physical errors (e.g., hands with 6 fingers).</span>
                    </div>
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">DEFECT FOUND</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 6. "WHY JOIN" VALUE PROPOSITIONS SECTION */}
      <section id="why-join" className="py-20 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Why Train with <span className="text-[#4F46E5] dark:text-indigo-400">Global Ready AIEval</span>?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            We provide the ultimate prep simulator to help you master AI data annotation. Here is why aspiring evaluators choose our academy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Benefit Card 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Master In-Demand Skills</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Learn prompt engineering, negative constraint styling, pairwise reasoning, and claim verification. These skills are essential to pass tests on premium platforms.
            </p>
          </div>

          {/* Benefit Card 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Interactive Sandbox Drills</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Get hands-on practice with high-fidelity pairwise simulators. Write real prompts and critique LLM responses with real-time feedback.
            </p>
          </div>

          {/* Benefit Card 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pass Qualification Exams</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Master the exact simple criteria evaluated by top remote networks like DataAnnotation, Outlier, Alignerr, Scale AI, Mercor, Micro1, and Prolific to bypass waitlists.
            </p>
          </div>

          {/* Benefit Card 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Learn From Mistakes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Receive instant detailed solutions, grading explanations, and model alignment rationales for every exercise you practice on.
            </p>
          </div>

          {/* Benefit Card 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Simulated Mock Exams</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Test your skills against timed mock exams that mimic the real, strict entry qualifications required by top tier AI firms.
            </p>
          </div>

          {/* Benefit Card 6 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personalized Readiness Index</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track your exact accuracy rates, justification analytical depth, and pace, and only apply for roles when your readiness reaches 100%.
            </p>
          </div>

          {/* Benefit Card 7: Full Width Direct Job Access Callout */}
          <div className="bg-[#4F46E5]/5 dark:bg-indigo-950/20 border border-[#4F46E5]/20 dark:border-indigo-900/40 rounded-2xl p-6 sm:p-8 space-y-4 md:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-indigo-500/50 transition-colors">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Get Direct Referrals From Insider Experts</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect with the best! Our platform is backed by a community of seasoned platform insiders who work with the top platforms and provide exclusive referral links to help you find active openings. Please note: these referrals may be considered by the target platform, but they do not bypass or directly influence the official qualification phase. A referral is simply a recommendation and does not guarantee a job offer—your success still depends entirely on your performance, which is why thorough practice and high training readiness are key to improving your chances!
              </p>
            </div>
            <button 
              onClick={onEnterPlatform}
              className="bg-[#4F46E5] text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 hover:bg-[#3B28CC] transition-all cursor-pointer self-stretch md:self-auto justify-center shrink-0"
            >
              <span>Explore Referral Links Inside</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>


      {/* 8. CAROUSEL TESTIMONIAL SLIDER SECTION */}
      <section className="py-20 max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Trusted Worldwide</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Hear From Our <span className="text-[#4F46E5] dark:text-indigo-400">Contributors</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real stories from people earning and advancing their alignment skills with Global Ready AIEval.
          </p>
        </div>

        {/* Testimonial card slider frame */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          
          {/* Quote bubble absolute icon */}
          <div className="absolute -top-4 left-6 bg-[#4F46E5] text-white p-2.5 rounded-2xl shadow-md">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M11.192 15.757c0-.907-.188-1.754-.565-2.54a5.72 5.72 0 0 1-1.495-2.22c-.3-.747-.45-1.533-.45-2.36 0-1.21.37-2.24 1.101-3.09.73-.85 1.782-1.28 3.141-1.28h.74v2.24h-.74c-.58 0-1.04.183-1.38.55-.34.367-.51.847-.51 1.44 0 .34.05.67.15 1 .1.33.22.65.36.96.14.3.3.61.47.93.18.32.35.64.51.96.16.32.28.66.36 1.02.08.36.12.74.12 1.14 0 1.22-.37 2.25-1.111 3.09-.74.84-1.782 1.26-3.12 1.26h-.74v-2.24h.74a1.455 1.455 0 0 0 1.38-.85zM4 15.757c0-.907-.188-1.754-.565-2.54a5.72 5.72 0 0 1-1.495-2.22c-.3-.747-.45-1.533-.45-2.36 0-1.21.37-2.24 1.101-3.09.73-.85 1.782-1.28 3.141-1.28h.74v2.24h-.74c-.58 0-1.04.183-1.38.55-.34.367-.51.847-.51 1.44 0 .34.05.67.15 1 .1.33.22.65.36.96.14.3.3.61.47.93.18.32.35.64.51.96.16.32.28.66.36 1.02.08.36.12.74.12 1.14 0 1.22-.37 2.25-1.111 3.09-.74.84-1.782 1.26-3.12 1.26h-.74v-2.24h.74a1.455 1.455 0 0 0 1.38-.85z"></path>
            </svg>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed italic">
              "{testimonials[activeTestimonial].quote}"
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-150">
                  <img 
                    src={testimonials[activeTestimonial].avatar} 
                    alt={testimonials[activeTestimonial].name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-semibold">{testimonials[activeTestimonial].location}</p>
                </div>
              </div>

              <div>
                <span className="inline-flex bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-450 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase">
                  {testimonials[activeTestimonial].earnings}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls arrows */}
          <div className="absolute right-4 bottom-4 flex gap-1.5">
            <button 
              onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bullet indicators */}
        <div className="flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveTestimonial(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeTestimonial === i ? "w-8 bg-[#4F46E5]" : "w-2 bg-slate-300 dark:bg-slate-800"
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      <section id="faq" className="bg-slate-100/50 dark:bg-slate-900/30 py-20 border-t border-slate-200/50 dark:border-slate-900 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Frequently Asked <span className="text-[#4F46E5] dark:text-indigo-400">Questions</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Everything you need to know about working with annotation and evaluation platforms.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full py-4.5 px-6 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-200">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-850 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 10. FINAL BOTTOM HERO CALL-TO-ACTION (CTA) */}
      <section className="py-20 sm:py-24 px-6 text-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1 bg-[#EEF2FF] dark:bg-indigo-950/50 text-[#4F46E5] dark:text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <span>GET CERTIFIED &amp; LAND THE JOB</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Ready to Unlock <span className="text-[#4F46E5] dark:text-indigo-400">$15–$100/Hour AI Data Annotation Contracts</span>?
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Don't let strict platform waitlists keep you from flexible remote income. Join 2,450+ certified specialists who aced Outlier, DataAnnotation, and Alignerr tests using our simulator. No tech background required!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button 
              onClick={onEnterPlatform}
              className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#3B28CC] text-white font-black px-8 py-4.5 rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Hired: Start Free Training</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onEnterPlatform}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-extrabold px-8 py-4.5 rounded-2xl text-sm transition-all cursor-pointer"
            >
              <span>Explore High-Paying Jobs</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 py-12 px-6 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/images/logos/global-logo.png"
              alt="Global Ready AIEval"
              width={20}
              height={20}
            />
            <span className="font-extrabold text-[#3B28CC] dark:text-indigo-455">Global Ready AIEval</span>
            <span>&bull;</span>
            <span>Training Elite Evaluators Worldwide</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <a href="#what-you-do" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">What You Do</a>
            <a href="#why-join" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Why Join</a>
            <a href="#faq" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">FAQ</a>
          </div>

          <p>&copy; 2026 Global Ready AIEval. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
