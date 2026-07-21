import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, Sliders, ShieldCheck, Terminal, Award, Sparkles, Brain, 
  Send, RefreshCw, Eye, Download, User, Cpu, BookOpen, ShieldAlert,
  ChevronRight, ArrowRight, CornerDownRight, Clock, CheckCircle2,
  AlertTriangle, RotateCcw, Check, ArrowLeft, BarChart2, Star,
  TrendingUp, ThumbsUp, ThumbsDown, Info, ChevronDown, ChevronUp,
  Volume2, VolumeX, Mic, MicOff, Upload, FileText
} from "lucide-react";
import { UserStats } from "../types";

interface InterviewSimulatorProps {
  stats: UserStats;
  onComplete: (score: number, strengths: string[], weaknesses: string[]) => void;
  onBack: () => void;
}

interface InterviewQuestion {
  id: string;
  phase: number;
  phaseName: string;
  weight: string;
  question: string;
  idealKeywords: string[];
  sampleExcellentAnswer: string;
  challengeQuestion: string;
  challengeKeywords: string[];
  sampleExcellentChallengeAnswer: string;
}

const PLATFORMS = [
  { 
    id: "mercor", 
    name: "Mercor", 
    style: "Highly analytical, fast-paced, reasoning-first questions with tough calibration follow-ups.", 
    focus: "Reasoning & Coding Speed", 
    difficulty: "Expert",
    color: "border-purple-200 dark:border-purple-900 bg-purple-50/10 dark:bg-purple-950/10 text-purple-600 dark:text-purple-400"
  },
  { 
    id: "micro1", 
    name: "Micro1", 
    style: "Highly structured, rubric-driven. Checks prompt-conformance, accuracy, and calibration standards.", 
    focus: "Instruction Compliance & Rubrics", 
    difficulty: "Medium",
    color: "border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-950/10 text-blue-600 dark:text-blue-400"
  },
  { 
    id: "scale", 
    name: "Scale AI", 
    style: "Precision data annotation. Evaluates pairwise preference, metadata checks, and accuracy auditing.", 
    focus: "Factual Precision & Taxonomy", 
    difficulty: "Advanced",
    color: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/10 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400"
  },
  { 
    id: "outlier", 
    name: "Outlier", 
    style: "Long-context reasoning, multi-step analysis, critical thinking evaluations, and long-essay justifications.", 
    focus: "Context Tracking & Essay Rationales", 
    difficulty: "Advanced",
    color: "border-orange-200 dark:border-orange-900 bg-orange-50/10 dark:bg-orange-950/10 text-orange-600 dark:text-orange-400"
  },
  { 
    id: "alignerr", 
    name: "Alignerr", 
    style: "Instruction following, logic puzzles, linguistic nuances, and multi-turn conversational edge cases.", 
    focus: "Logical Constraints & Nuances", 
    difficulty: "Expert",
    color: "border-pink-200 dark:border-pink-900 bg-pink-50/10 dark:bg-pink-950/10 text-pink-600 dark:text-pink-400"
  },
  { 
    id: "invisible", 
    name: "Invisible", 
    style: "Process-driven workflow tracking, rigorous style-guides, strict formatting rules, and editorial quality.", 
    focus: "Process Adherence & Editorial Rules", 
    difficulty: "Medium-Hard",
    color: "border-cyan-200 dark:border-cyan-900 bg-cyan-50/10 dark:bg-cyan-950/10 text-cyan-600 dark:text-cyan-400"
  },
  { 
    id: "general", 
    name: "General AI Evaluator", 
    style: "Balanced generalist interview covering motives, basic theory, scenario calibration, and live annotation.", 
    focus: "SFT & Pairwise Foundations", 
    difficulty: "Medium",
    color: "border-indigo-200 dark:border-indigo-900 bg-indigo-50/10 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400"
  }
];

const ROLES = [
  { id: "evaluator", name: "AI Evaluator", level: "Entry-Intermediate", description: "Compares pairs of responses, evaluates relative helpfulness, truthfulness, and safety." },
  { id: "reviewer", name: "RLHF Reviewer", level: "Intermediate", description: "Audits evaluator annotations and writes correction text to improve dataset quality." },
  { id: "annotator", name: "Data Annotator", level: "Entry Level", description: "Performs labeling, tags named entities, and marks factual hallucinations." },
  { id: "engineer", name: "Prompt Engineer", level: "Advanced", description: "Designs system instructions, template workflows, and red-teams persona prompt templates." },
  { id: "safety", name: "Safety Evaluator", level: "Expert", description: "Red-teams responses, audits medical/financial/legal liabilities, and tests jailbreak defenses." },
  { id: "image", name: "Image Evaluator", level: "Intermediate", description: "Compares text-to-image outcomes, auditing proportions, color harmony, and text rendering." },
  { id: "reasoning", name: "Reasoning Evaluator", level: "Expert", description: "Audits math proofs, step-by-step logic, and chain-of-thought code execution outputs." },
  { id: "trainer", name: "Generalist AI Trainer", level: "Entry-Intermediate", description: "Generates high-quality diverse prompts and demonstrates ideal responses for SFT." },
  { id: "domain", name: "Domain Expert", level: "Advanced-Expert", description: "Conducts specialist validation in Biology, Chemistry, Advanced Math, or Humanities." },
  { id: "coding", name: "Coding Evaluator", level: "Advanced", description: "Audits script execution, analyzes runtime complexity, and writes strict code unit tests." }
];

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: "p1_q1",
    phase: 1,
    phaseName: "Resume & Experience Validation",
    weight: "15%",
    question: "Welcome to your virtual assessment. I have parsed your onboarding profile. To kick off, walk me through your background. Which previous professional experiences or personal attributes best prepare you to handle strict formatting compliance, high-volume text analysis, and demanding remote deadlines?",
    idealKeywords: ["experience", "detail", "attention", "quality", "writing", "evaluation", "meticulous", "deadline", "remote"],
    sampleExcellentAnswer: "My background in quality review has trained me to approach data with rigorous precision. I am accustomed to reviewing documents against detailed rubrics under tight deadlines. This analytical workflow directly maps to the demands of AI evaluation, where keeping track of multi-step prompt requirements and detecting subtle compliance shifts separates elite performance from general output.",
    challengeQuestion: "Fascinating. Attention to detail is indeed a major differentiator. In multi-turn chat annotation, suppose a user updates their formatting preferences halfway through the conversation, creating an explicit contradiction with the initial instructions. How do you decide which instructions to hold the model accountable for?",
    challengeKeywords: ["latest", "recent", "priority", "contradiction", "context tracking", "update", "state"],
    sampleExcellentChallengeAnswer: "In multi-turn conversations, I always prioritize the most recent instruction provided by the user. While the model must remember historical context, the latest user input overrides prior preferences. I would evaluate the model based on its compliance with this updated state, and explicitly document this context-shift in my evaluation rationale."
  },
  {
    id: "p2_q1",
    phase: 2,
    phaseName: "AI Knowledge Assessment",
    weight: "15%",
    question: "Excellent. Let's move to Phase 2: Technical AI Prep. Explain RLHF (Reinforcement Learning from Human Feedback) in simple terms to a non-technical stakeholder, and describe how it fundamentally differs from Supervised Fine-Tuning (SFT). Why is human feedback so critical in this process?",
    idealKeywords: ["rlhf", "sft", "human feedback", "reward model", "fine-tuning", "policy", "preferences", "alignment", "safety"],
    sampleExcellentAnswer: "SFT is like teaching an AI student by showing them perfect examples to copy (labeled demonstration data). RLHF is like letting the AI generate several drafts, having human evaluators rate which drafts are best (pairwise preferences), and using those ratings to train a 'Reward Model' that acts as an automated teacher to guide the AI toward helpful, aligned, and safe behaviors.",
    challengeQuestion: "You've captured SFT vs RLHF well. But consider this critical bottleneck: what happens if human evaluators themselves are not calibrated, leading to noisy or contradictory preference data? How does this impact the Reward Model, and what steps can we take as evaluators to prevent it?",
    challengeKeywords: ["noisy", "calibration", "rubric", "consistency", "agreement", "guidelines", "bias"],
    sampleExcellentChallengeAnswer: "Uncalibrated human data creates contradictory labels, which degrades the Reward Model's capability to learn a clean reward signal, causing model alignment to fluctuate. As evaluators, we prevent this by strictly adhering to the objective project rubric rather than personal bias, discussing borderline cases during calibration reviews, and thoroughly documenting our rationales with concrete prompt evidence."
  },
  {
    id: "p3_q1",
    phase: 3,
    phaseName: "Scenario-Based Interview",
    weight: "35%",
    question: "Very thorough. Let's enter Phase 3: Work Scenarios. Suppose you are evaluating a coding prompt requesting a highly optimized script. Model A generates a highly efficient, perfect script but completely misses a minor logging format requirement. Model B follows all instructions perfectly (including the logging formatting) but writes a highly suboptimal, slow O(N^2) algorithm. How would you rank these, and how would you professionally justify your decision?",
    idealKeywords: ["instruction following", "negative constraint", "functional", "correctness", "efficiency", "compromise", "guideline", "partial compliance", "suboptimal"],
    sampleExcellentAnswer: "I would rank Model B higher if strict 'Instruction Following' is the primary metric of the rubric, as a failure to comply with a prompt constraint is a major issue. However, in functional coding, a highly inefficient script is practically useless. I would rate Model B as 'Fully Compliant but substandard efficiency' and Model A as 'Partially Compliant but high utility.' I would rank Model B higher under strict constraint rubrics, but document both issues clearly so the developers can optimize Model B's code.",
    challengeQuestion: "That trade-off is central to RLHF calibration. Suppose the company's internal directive for this specific project is 'absolute customer trust and functional reliability over strict instruction compliance'. Would this directive change your ranking, and how would you professionally defend it in a calibration meeting?",
    challengeKeywords: ["trust", "reliability", "utility", "change", "priority", "performance", "rationalize", "evidence"],
    sampleExcellentChallengeAnswer: "Yes, under an 'absolute customer trust and functional reliability' directive, I would reverse my ranking to favor Model A. A highly suboptimal O(N^2) algorithm risks server timeouts and crashes, violating functional reliability. I would defend ranking Model A higher by arguing that while it missed a minor logging constraint, its core utility is pristine, making it far safer for customer trust than Model B's slow performance."
  },
  {
    id: "p4_q1",
    phase: 4,
    phaseName: "Live AI Evaluation",
    weight: "25%",
    question: "Outstanding response. Let's move to Phase 4: Live AI Evaluation. For this exercise, I have loaded a Spanish translation task with a negative constraint. Review the prompt, translations, and negative constraints below. Submit your preference ratings, flags, and a professional rationale. Be prepared to defend your decisions.",
    idealKeywords: ["present tense", "verbs", "negative constraint", "Model B", "Model A", "tense violation", "bulleted", "bold", "translation"],
    sampleExcellentAnswer: "Model B is superior because it fully complies with the negative constraint to 'only use verbs in the present tense' (using 'madruga' and 'consigue'). Model A completely failed this constraint by using past and future tenses ('madrugó', 'atrapará'), which constitutes a major instruction following failure, despite having a more common literal phrasing. Model B also satisfies all formatting instructions perfectly.",
    challengeQuestion: "You selected Model B. However, a calibration reviewer argues: 'Model A should be ranked higher because its translation is much more common and natural in standard Spanish literature, and minor grammar constraints shouldn't override fluid prose.' How would you professionally refute this argument?",
    challengeKeywords: ["negative constraint", "constraint compliance", "guideline", "refute", "rubric", "accuracy", "strict"],
    sampleExcellentChallengeAnswer: "I would respectfully disagree with the reviewer. In professional alignment evaluation, negative constraints are non-negotiable filters. Allowing a model to bypass negative constraints simply because of 'prose flow' trains the model to be untrustworthy when handling critical security, safety, or formatting instructions. Model B proves that present tense compliance is fully achievable, so its minor flow compromise is acceptable."
  },
  {
    id: "p5_q1",
    phase: 5,
    phaseName: "Behavioural & Work Style",
    weight: "10%",
    question: "Exceptional defense. Let's finish with Phase 5: Behavioural Fit. AI evaluation is highly repetitive and requires deep focus over 8+ hour shifts. Describe a situation where your attention to detail made a major difference under pressure, and share your personal strategies for avoiding 'lazy rating syndrome' (satisficing) over hundreds of evaluations.",
    idealKeywords: ["repetition", "breaks", "satisficing", "checklist", "accuracy", "fatigue", "rubric", "active auditing", "structure"],
    sampleExcellentAnswer: "To fight fatigue, I treat every prompt as an independent, binding contract. I break my shifts into 50-minute blocks with 10-minute active resets. I use a personal checklist for common hidden traps (such as subtle mathematical errors or negative constraints) instead of relying on memory, and I write out my rationales iteratively as I audit, which keeps my critical thinking active and calibrated.",
    challengeQuestion: "Thank you. You've demonstrated a highly systematic mindset. That concludes our assessment! Let me process your transcript, grade your live evaluation accuracy, and compile your comprehensive Platform Readiness Report.",
    challengeKeywords: [],
    sampleExcellentChallengeAnswer: ""
  }
];

interface TypewriterTextProps {
  text: string;
  isLast: boolean;
  onComplete?: () => void;
  speed?: number;
}

function TypewriterText({ text, isLast, onComplete, speed = 40 }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isLast) {
      setDisplayedText(text);
      return;
    }

    const words = text.split(" ");
    let currentWordIndex = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedText(prev => prev + (prev ? " " : "") + words[currentWordIndex]);
        currentWordIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [text, isLast, speed]);

  return <span>{displayedText}</span>;
}

export default function InterviewSimulator({ stats, onComplete, onBack }: InterviewSimulatorProps) {
  const [interviewStep, setInterviewStep] = useState<"setup_platform" | "setup_role" | "setup_profile" | "analysis" | "interviewing" | "report">("setup_platform");
  
  // Selection States
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // Questionnaire Onboarding Fields
  const [profile, setProfile] = useState({
    name: stats.displayName || "Alex Johnson",
    education: "Bachelor of Science in English & Psychology",
    workExperience: "2 years as a Content Reviewer & Freelance Technical Writer",
    aiExperience: "Completed advanced prompt engineering training & baseline RLHF studies",
    programmingKnowledge: "Basic Python (data types, loops) & simple script debugging",
    languages: "English (Native), Spanish (Conversational)",
    remoteExperience: "1.5 years working as an independent remote annotator",
    goals: "Qualify for premium specialized AI alignment contracts ($35-45/hr)"
  });
  
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Interview questions: default to the static bank, replaced with
  // AI-generated, domain/platform-tailored questions once the profile
  // analysis step resolves (see handleRunProfileAnalysis).
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>(INTERVIEW_QUESTIONS);

  // CV / Resume File Upload States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // Active Interview State
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "interviewer" | "candidate"; text: string; isChallenge?: boolean }>>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isInterviewerTyping, setIsInterviewerTyping] = useState(false);
  
  // Dynamic Challenge Tracking
  const [hasRespondedToMainQuestion, setHasRespondedToMainQuestion] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, { mainAnswer: string; challengeAnswer: string }>>({});

  // Phase 4 Live Pairwise Task Interactive States
  const [p4SelectedModel, setP4SelectedModel] = useState<"A" | "B" | "">("");
  const [p4Ratings, setP4Ratings] = useState<{ A: number; B: number }>({ A: 0, B: 0 });
  const [p4Flags, setP4Flags] = useState<{ A: Record<string, boolean>; B: Record<string, boolean> }>({
    A: { hallucination: false, safety: false, formatting: true }, // Model A fails formatting/negative constraint (tense)!
    B: { hallucination: false, safety: false, formatting: false }
  });
  const [p4Rationale, setP4Rationale] = useState("");
  const [p4Submitted, setP4Submitted] = useState(false);

  // Final Report & Replays
  const [reportScore, setReportScore] = useState(0);
  const [reportData, setReportData] = useState<any>(null);
  const [expandedReplayIndex, setExpandedReplayIndex] = useState<number | null>(null);

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<"prompt" | "granted" | "denied">("prompt");
  
  const lastSpokenIndex = useRef(-1);
  const recognitionRef = useRef<any>(null);

  // Helper: Request and Check Microphone Permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop tracks immediately as we just need permission confirmation
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionState("granted");
      return true;
    } catch (err) {
      console.error("Microphone permission was denied or failed:", err);
      setMicPermissionState("denied");
      return false;
    }
  };

  // Check microphone permissions on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "microphone" as any })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            setMicPermissionState("granted");
          } else if (permissionStatus.state === "denied") {
            setMicPermissionState("denied");
          }
          permissionStatus.onchange = () => {
            if (permissionStatus.state === "granted") {
              setMicPermissionState("granted");
            } else if (permissionStatus.state === "denied") {
              setMicPermissionState("denied");
            }
          };
        })
        .catch(err => console.log("navigator.permissions query not supported:", err));
    }
  }, []);

  // Helper: Speak Text using TTS with natural male voice named John
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsAiSpeaking(false);
    
    if (!isVoiceEnabled) return;

    // Remove markdown-like indicators or brackets for clearer speech
    const cleanText = text
      .replace(/\[ADAPTIVE CHALLENGE TRIGGER\]/g, "Adaptive Challenge Trigger")
      .replace(/\[Live pair assessment submitted\]/g, "Live evaluation submitted")
      .replace(/\*\*/g, "") // remove bold asterisks
      .replace(/"/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose voice: prioritize natural male voice John/David/George
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith("en") && 
      (
        v.name.toLowerCase().includes("male") || 
        v.name.toLowerCase().includes("david") || 
        v.name.toLowerCase().includes("mark") || 
        v.name.toLowerCase().includes("george") ||
        v.name.toLowerCase().includes("john") ||
        v.name.toLowerCase().includes("guy") ||
        v.name.toLowerCase().includes("james") ||
        (v.name.toLowerCase().includes("natural") && v.name.toLowerCase().includes("male"))
      )
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    } else {
      const anyEnVoice = voices.find(v => v.lang.startsWith("en"));
      if (anyEnVoice) {
        utterance.voice = anyEnVoice;
      }
    }
    
    // Setup pitch & speed parameters to make John sound realistic & deep
    utterance.rate = 0.95;
    utterance.pitch = 0.92;
    
    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };
    utterance.onend = () => {
      setIsAiSpeaking(false);
    };
    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice output
  const handleVoiceToggle = () => {
    const nextVal = !isVoiceEnabled;
    setIsVoiceEnabled(nextVal);
    if (!nextVal) {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
    } else {
      // Speak the last message
      if (chatHistory.length > 0) {
        const lastMsg = chatHistory[chatHistory.length - 1];
        if (lastMsg.sender === "interviewer") {
          speakText(lastMsg.text);
        }
      }
    }
  };

  const listeningTargetRef = useRef<"chat" | "phase4">("chat");

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          if (listeningTargetRef.current === "chat") {
            setCurrentInput(prev => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
            });
          } else if (listeningTargetRef.current === "phase4") {
            setP4Rationale(prev => {
              const trimmed = prev.trim();
              return trimmed ? `${trimmed} ${finalTranscript}` : finalTranscript;
            });
          }
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = (target: "chat" | "phase4" = "chat") => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      listeningTargetRef.current = target;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Listen for new interviewer messages to trigger speakText
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      const lastIndex = chatHistory.length - 1;
      if (lastMsg.sender === "interviewer") {
        if (lastIndex > lastSpokenIndex.current) {
          lastSpokenIndex.current = lastIndex;
          if (isVoiceEnabled) {
            speakText(lastMsg.text);
          }
        }
      }
    }
  }, [chatHistory, isVoiceEnabled]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isInterviewerTyping]);

  // CV / Resume Drag & Drop Handlers
  const handleFileDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCVFile(e.target.files[0]);
    }
  };

  const handleCVFile = (file: File) => {
    setUploadedFile(file);
    setIsParsing(true);
    setParsingProgress(15);

    const progressInterval = setInterval(() => {
      setParsingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 8;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = (e.target?.result as string) || "";
        const mimeType = file.type || "application/octet-stream";
        const base64Data = dataUrl.split(",")[1] || "";

        console.log("Sending CV to backend for Gemini extraction:", file.name, mimeType);
        
        const response = await fetch("/api/parse-resume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            base64Data,
            mimeType,
            fileName: file.name
          })
        });

        const result = await response.json();
        
        clearInterval(progressInterval);
        setParsingProgress(100);
        setIsParsing(false);

        if (result.success && result.profile) {
          setProfile(result.profile);
        } else if (result.profile) {
          // Warning fallback with some extracted content
          setProfile(result.profile);
        } else {
          throw new Error(result.error || "Failed to parse profile");
        }

      } catch (err) {
        console.error("Backend parsing error, falling back to local text scanner:", err);
        
        // Fail-safe local client-side parser
        const textReader = new FileReader();
        textReader.onload = (evt) => {
          const text = (evt.target?.result as string) || "";
          const lowerText = text.toLowerCase();
          
          let parsedName = stats.displayName || file.name.split(".")[0].replace(/[-_]/g, " ");
          parsedName = parsedName.replace(/\b\w/g, c => c.toUpperCase());
          
          // Determine education
          let parsedEdu = "Bachelor of Science in General Science";
          if (lowerText.includes("phd") || lowerText.includes("ph.d") || lowerText.includes("doctorate")) {
            parsedEdu = "Ph.D. / Doctorate in Cognitive Science or Engineering";
          } else if (lowerText.includes("master") || lowerText.includes("m.s.") || lowerText.includes("m.a.") || lowerText.includes("ms ") || lowerText.includes("mba")) {
            parsedEdu = "Master's Degree in computational or analytical field";
          } else if (lowerText.includes("bachelor") || lowerText.includes("b.s.") || lowerText.includes("b.a.")) {
            parsedEdu = "Bachelor's Degree in Technical Writing or Computer Science";
          } else if (lowerText.includes("university") || lowerText.includes("college") || lowerText.includes("school")) {
            parsedEdu = "University undergraduate degree";
          }

          // Extract work experience based on content keywords
          let parsedWork = "2 years of professional data review and content validation";
          if (lowerText.includes("manager") || lowerText.includes("lead") || lowerText.includes("scrum") || lowerText.includes("agile")) {
            parsedWork = "3-5 years of project leadership, Scrum management, or quality assurance coordination";
          } else if (lowerText.includes("developer") || lowerText.includes("engineer") || lowerText.includes("programmer") || lowerText.includes("coding")) {
            parsedWork = "3 years as a Software Developer and technical code quality auditor";
          } else if (lowerText.includes("writer") || lowerText.includes("editor") || lowerText.includes("content") || lowerText.includes("translator")) {
            parsedWork = "2.5 years of technical writing, structural copy-editing, and translation";
          }

          // Extract AI/RLHF experience
          let parsedAI = "Familiarity with general prompt engineering and instruction-following metrics";
          const aiKeywords: string[] = [];
          if (lowerText.includes("rlhf") || lowerText.includes("reinforcement learning")) aiKeywords.push("RLHF evaluation");
          if (lowerText.includes("prompt") || lowerText.includes("instruction following")) aiKeywords.push("prompt engineering");
          if (lowerText.includes("red-team") || lowerText.includes("red team") || lowerText.includes("safety") || lowerText.includes("jailbreak")) aiKeywords.push("safety red-teaming");
          if (lowerText.includes("fine-tune") || lowerText.includes("sft") || lowerText.includes("supervised")) aiKeywords.push("SFT model tuning");
          if (lowerText.includes("annotation") || lowerText.includes("labeling") || lowerText.includes("tagging")) aiKeywords.push("content annotation");

          if (aiKeywords.length > 0) {
            parsedAI = `Experienced in ${aiKeywords.join(", ")}`;
          }

          // Extract programming knowledge level
          let parsedProg = "Basic scripting knowledge & markdown validation";
          const codingSkills: string[] = [];
          if (lowerText.includes("python")) codingSkills.push("Python");
          if (lowerText.includes("javascript") || lowerText.includes("js")) codingSkills.push("JavaScript");
          if (lowerText.includes("typescript") || lowerText.includes("ts")) codingSkills.push("TypeScript");
          if (lowerText.includes("sql") || lowerText.includes("database") || lowerText.includes("postgres")) codingSkills.push("SQL");

          if (codingSkills.length > 0) {
            parsedProg = `Proficient in ${codingSkills.join(", ")}`;
          }

          // Extract foreign languages spoken
          let parsedLang = "English (Native)";
          const langKeywords: string[] = [];
          if (lowerText.includes("spanish") || lowerText.includes("español")) langKeywords.push("Spanish");
          if (lowerText.includes("french") || lowerText.includes("français")) langKeywords.push("French");
          if (lowerText.includes("german") || lowerText.includes("deutsch")) langKeywords.push("German");

          if (langKeywords.length > 0) {
            parsedLang = `English (Native), ${langKeywords.join(", ")}`;
          }

          let parsedGoals = "Secure long-context evaluation projects and specialize in complex reasoning model QA";
          if (codingSkills.length > 0) {
            parsedGoals = "Qualify for senior-tier technical coding and system prompt validation roles ($45+/hr)";
          }

          clearInterval(progressInterval);
          setParsingProgress(100);
          setIsParsing(false);

          setProfile({
            name: parsedName,
            education: parsedEdu,
            workExperience: parsedWork,
            aiExperience: parsedAI,
            programmingKnowledge: parsedProg,
            languages: parsedLang,
            remoteExperience: lowerText.includes("remote") ? "3+ years of autonomous remote work and distributed teamwork" : "Experienced with autonomous, self-directed remote workloads",
            goals: parsedGoals
          });
        };

        textReader.onerror = () => {
          clearInterval(progressInterval);
          setParsingProgress(100);
          setIsParsing(false);
          setProfile({
            name: file.name.split(".")[0].replace(/[-_]/g, " "),
            education: "Bachelor's Degree",
            workExperience: "2 years of professional content review and technical writing",
            aiExperience: "Self-taught prompt engineering & general alignment studies",
            programmingKnowledge: "Intermediate Python script debugging & code verification",
            languages: "English (Native)",
            remoteExperience: "Experienced in self-managed remote delivery schedules",
            goals: "Transition into high-quality professional AI evaluation contracts"
          });
        };

        textReader.readAsText(file);
      }
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setParsingProgress(100);
      setIsParsing(false);
      setProfile({
        name: file.name.split(".")[0].replace(/[-_]/g, " "),
        education: "Bachelor's Degree",
        workExperience: "2 years of professional content review and technical writing",
        aiExperience: "Self-taught prompt engineering & general alignment studies",
        programmingKnowledge: "Intermediate Python script debugging & code verification",
        languages: "English (Native)",
        remoteExperience: "Experienced in self-managed remote delivery schedules",
        goals: "Transition into high-quality professional AI evaluation contracts"
      });
    };

    // Read CV file as data URL to handle binary files (PDF/docx) seamlessly
    reader.readAsDataURL(file);
  };

  // Helper: Populate Simulated Onboarding Questionnaire
  const handleSimulateResumeUpload = () => {
    setIsSimulatingUpload(true);
    const mockFile = new File(["Mock resume content for evaluation"], "Alex_Johnson_Resume.pdf", { type: "application/pdf" });
    setUploadedFile(mockFile);
    setIsParsing(true);
    setParsingProgress(25);

    setTimeout(() => {
      setProfile({
        name: stats.displayName || "Alex Johnson",
        education: "Master of Arts in Linguistics & Journalism",
        workExperience: "4 years as a Scrum Master & Agile Content Specialist at a digital agency",
        aiExperience: "Self-trained in RLHF taxonomies, completed introductory Prompt Engineering and red-teaming workshops",
        programmingKnowledge: "Intermediate Python, comfortable reviewing API code, script syntax, and markdown schemas",
        languages: "English (Native), Spanish (Conversational)",
        remoteExperience: "2 years managing fully remote engineering teams in distributed settings",
        goals: "Transition fully into long-context AI evaluation and reasoning model QA"
      });
      setIsSimulatingUpload(false);
      setIsParsing(false);
      setParsingProgress(100);
    }, 1000);
  };

  // Helper: Launch Candidate Profile Onboarding Analysis
  const handleRunProfileAnalysis = () => {
    setIsAnalyzing(true);
    setInterviewStep("analysis");

    const platform = PLATFORMS.find(p => p.id === selectedPlatform);
    const role = ROLES.find(r => r.id === selectedRole);
    const platformName = platform?.name || "AI Platforms";
    const roleName = role?.name || "AI Trainer";

    // Keep the "processing profile" animation feeling substantial while the
    // real Gemini call for domain-specific questions runs behind it.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2500));
    const questionsFetch = fetch("/api/interview-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platformName,
        platformStyle: platform?.style,
        roleName,
        roleDescription: role?.description,
      }),
    })
      .then((res) => res.json())
      .catch(() => ({ success: false }));

    Promise.all([minDelay, questionsFetch]).then(([, result]: [unknown, any]) => {
      if (result?.success && Array.isArray(result.questions) && result.questions.length === 4) {
        // Phases 0,1,2 -> generated 0,1,2 (Resume/Knowledge/Scenario).
        // Phase 3 (index 3) stays the bespoke live pairwise translation task.
        // Phase 4 -> generated 3 (Behavioural).
        const merged: InterviewQuestion[] = INTERVIEW_QUESTIONS.map((staticQ, idx) => {
          if (idx === 3) return staticQ;
          const gen = result.questions[idx < 3 ? idx : idx - 1];
          return {
            ...staticQ,
            question: gen.question,
            idealKeywords: gen.idealKeywords,
            sampleExcellentAnswer: gen.sampleExcellentAnswer,
            challengeQuestion: gen.challengeQuestion,
            challengeKeywords: gen.challengeKeywords,
            sampleExcellentChallengeAnswer: gen.sampleExcellentChallengeAnswer,
          };
        });
        setInterviewQuestions(merged);
      } else {
        setInterviewQuestions(INTERVIEW_QUESTIONS);
      }

      const summary = `I have parsed your candidate profile, ${profile.name}. Given your background as a "${profile.workExperience}" combined with your "${profile.aiExperience}" and "${profile.programmingKnowledge}" skills, you present a highly strategic profile for alignment work.

I have fully calibrated our virtual assessment loop to test your specific transition capabilities. This session will validate your motivation, technical RLHF foundations, pairwise scenario judgement, and safety red-teaming compliance. You will be evaluated against ${platformName}'s strict "${roleName}" criteria, with our live Adaptive Challenge Engine active. Ready? Let's enter the virtual boardroom.`;

      setAnalysisText(summary);
      setIsAnalyzing(false);
    });
  };

  // Helper: Start the actual Interview Live Loop
  const handleStartInterview = () => {
    setInterviewStep("interviewing");
    setActivePhaseIndex(0);
    setHasRespondedToMainQuestion(false);
    setUserAnswers({});
    
    // Welcome message
    setIsInterviewerTyping(true);
    setTimeout(() => {
      const firstQ = interviewQuestions[0];
      const initialGreeting = `Welcome to the virtual assessment board, ${profile.name}. I am your automated lead interviewer for today. I will guide you through five phases of progressive assessment to test your suitability for ${PLATFORMS.find(p => p.id === selectedPlatform)?.name} as a ${ROLES.find(r => r.id === selectedRole)?.name}.

We will begin with Phase 1: ${firstQ.phaseName} (Weight: ${firstQ.weight}). 

Here is your first prompt:
"${firstQ.question}"`;
      
      setChatHistory([{ sender: "interviewer", text: initialGreeting }]);
      setIsInterviewerTyping(false);
    }, 1500);
  };

  // Helper: Send typed candidate response
  const handleSendResponse = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (!currentInput.trim()) return;
    const typedText = currentInput;
    setCurrentInput("");

    // Add candidate message
    setChatHistory(prev => [...prev, { sender: "candidate", text: typedText }]);

    setIsInterviewerTyping(true);
    
    setTimeout(() => {
      const currentQ = interviewQuestions[activePhaseIndex];
      const lowerText = typedText.toLowerCase();
      const words = typedText.trim().split(/\s+/).filter(Boolean);

      if (!hasRespondedToMainQuestion) {
        // Candidate responded to the main question. Save it, then trigger the platform CHALLENGE with customized pushbacks!
        setUserAnswers(prev => ({
          ...prev,
          [currentQ.id]: {
            mainAnswer: typedText,
            challengeAnswer: ""
          }
        }));
        
        setHasRespondedToMainQuestion(true);
        
        // Formulate personalized challenge trigger & dynamic pushbacks
        let customChallenge = currentQ.challengeQuestion;
        let pushbackIntro = "";

        if (currentQ.phase === 1) {
          if (words.length < 15) {
            pushbackIntro = `Wait, John here. That professional summary is extremely brief, ${profile.name}. In high-volume AI audit environments, short explanations raise an immediate 'satisficing' flag. Let's push back immediately: `;
            customChallenge = `How can we trust your rigorous auditing capabilities if your own career overview is only a few words? Tell me about a specific project where your meticulous attention directly prevented a major team error or logic issue.`;
          } else {
            pushbackIntro = `Interesting background detail. I see your experience as a "${profile.workExperience}" with skills in "${profile.programmingKnowledge}". Given that context, let's calibration test you: `;
            if (profile.programmingKnowledge.toLowerCase().includes("python") || profile.programmingKnowledge.toLowerCase().includes("js") || profile.programmingKnowledge.toLowerCase().includes("coding") || profile.programmingKnowledge.toLowerCase().includes("proficient")) {
              customChallenge = `Since your CV highlights programming proficiency, let's explore a core engineering challenge: If a model writes functionally flawless code but fails a minor docstring or comment constraint, how do you balance functional correctness against strict guideline compliance?`;
            } else {
              customChallenge = `In multi-turn chat annotation, suppose a user updates their formatting preferences halfway through the conversation, creating an explicit contradiction with the initial instructions. How do you decide which instructions to hold the model accountable for?`;
            }
          }
        } else if (currentQ.phase === 2) {
          const hasReward = lowerText.includes("reward") || lowerText.includes("model") || lowerText.includes("rating") || lowerText.includes("preference") || lowerText.includes("pairwise");
          const hasSft = lowerText.includes("sft") || lowerText.includes("supervised") || lowerText.includes("demonstration") || lowerText.includes("example");

          if (words.length < 15 || (!hasReward && !hasSft)) {
            pushbackIntro = `Hold on, I must stop you there. Your RLHF definition is quite shallow and completely misses the mechanical differences. You did not mention SFT as starting from supervised demonstrations, or how RLHF utilizes a secondary Reward Model trained on human preference data. Let's push back on this: `;
            customChallenge = `If a model is already highly fine-tuned with SFT, why do we need RLHF at all? What specific behavioral failures does SFT fail to align that preference-based reward modeling successfully resolves?`;
          } else {
            pushbackIntro = `That is a highly calibrated definition of SFT vs RLHF preference training. Your comprehension of reward optimization metrics is excellent. However, let's test your troubleshooting mindset: `;
            customChallenge = `What happens if human evaluators themselves are uncalibrated, leading to noisy or contradictory preference data? How does this compromise the Reward Model, and what operational steps can you take as a reviewer to prevent it?`;
          }
        } else if (currentQ.phase === 3) {
          const hasTradeoff = lowerText.includes("trade-off") || lowerText.includes("tradeoff") || lowerText.includes("efficiency") || lowerText.includes("logging") || lowerText.includes("constraint") || lowerText.includes("latency") || lowerText.includes("o(n");

          if (words.length < 15 || !hasTradeoff) {
            pushbackIntro = `Let me stop you and push back directly. Your analysis ignores the fundamental trade-off of this scenario. Model B writes an O(N^2) quadratic algorithm which is practically unusable at scale, whereas Model A has flawless logic but misses a minor logging string format. Let's calibrate: `;
            customChallenge = `Are you saying you would rank Model B higher simply because of a cosmetic formatting rule, even if its catastrophic latency crashes the client's servers? Defend your prioritization from a system reliability standpoint.`;
          } else {
            pushbackIntro = `A very intelligent analysis of functional utility versus absolute instruction following. You handled that calibration trade-off perfectly. Let's push this stance: `;
            customChallenge = `Suppose our company's active project directive for this client is 'absolute customer trust and functional reliability over literal constraint compliance'. Would this directive change your ranking, and how would you professionally defend it in a lead calibration meeting?`;
          }
        } else if (currentQ.phase === 5) {
          if (words.length < 15) {
            pushbackIntro = `Avoiding fatigue is easier said than done. That strategy is quite generic. Let me push back directly: `;
            customChallenge = `If you were tasked with auditing 150 complex prompt responses in a single 8-hour shift, what concrete, tool-based checklist rules would you enforce to ensure you never overlook a subtle logic or safety violation?`;
          } else {
            pushbackIntro = `Fascinating approach. Treating every prompt as an independent binding contract is an elite evaluator mindset. Let me ask you this final calibration question: `;
            customChallenge = `If you detect that a peer reviewer has been consistently submitting shallow, lazy rationales, how would you address this within your calibration team to maintain database integrity?`;
          }
        }

        setChatHistory(prev => [
          ...prev, 
          { 
            sender: "interviewer", 
            text: `[ADAPTIVE CHALLENGE TRIGGER] 
${pushbackIntro}${customChallenge}`,
            isChallenge: true 
          }
        ]);
        setIsInterviewerTyping(false);
      } else {
        // Candidate responded to the CHALLENGE. Save it, then advance to the next phase!
        setUserAnswers(prev => {
          const existing = prev[currentQ.id] || { mainAnswer: "", challengeAnswer: "" };
          return {
            ...prev,
            [currentQ.id]: {
              ...existing,
              challengeAnswer: typedText
            }
          };
        });

        const nextIndex = activePhaseIndex + 1;
        if (nextIndex < interviewQuestions.length) {
          setActivePhaseIndex(nextIndex);
          setHasRespondedToMainQuestion(false);
          
          const nextQ = interviewQuestions[nextIndex];
          let intro = `Excellent defense. Let's move to Phase ${nextQ.phase}: ${nextQ.phaseName} (Weight: ${nextQ.weight}).\n\n`;
          
          if (nextQ.phase === 4) {
            intro += `For this live evaluation, please inspect the translation task loading below. Fill out the rating card, submit your pairwise preferences, and then type a brief summary of your rationale in our chat.`;
          }

          setChatHistory(prev => [
            ...prev,
            {
              sender: "interviewer",
              text: `${intro}
"${nextQ.question}"`
            }
          ]);
          setIsInterviewerTyping(false);
        } else {
          // Interview complete! Show summary transition
          setChatHistory(prev => [
            ...prev,
            {
              sender: "interviewer",
              text: `Thank you, ${profile.name}. We have successfully completed all five phases of our virtual assessment. 

I will now process your interview transcripts, analyze your rationale vocabulary, grade your pairwise translation constraints accuracy, and compile your Platform Readiness Diagnostic Report. 

Click the button below to generate your report.`
            }
          ]);
          setIsInterviewerTyping(false);
        }
      }
    }, 1200);
  };

  // Phase 4 Live Pairwise Submission
  const handleP4Submit = () => {
    if (!p4SelectedModel || p4Ratings.A === 0 || p4Ratings.B === 0 || p4Rationale.trim().split(/\s+/).filter(Boolean).length < 10) {
      alert("Please select the higher-ranking model, rate both models (1-5 stars), and write a professional rationale (minimum 10 words) before submitting.");
      return;
    }
    setP4Submitted(true);
    
    // Simulate user sending message
    setChatHistory(prev => [
      ...prev,
      { sender: "candidate", text: `[Live pair assessment submitted] Rated Model A: ${p4Ratings.A} stars. Rated Model B: ${p4Ratings.B} stars. Preference choice: Model ${p4SelectedModel}. Rationale: "${p4Rationale}"` }
    ]);
    
    setIsInterviewerTyping(true);
    setTimeout(() => {
      const currentQ = interviewQuestions[3]; // Phase 4
      setUserAnswers(prev => ({
        ...prev,
        [currentQ.id]: {
          mainAnswer: `Choice: Model ${p4SelectedModel}. Ratings: A(${p4Ratings.A}), B(${p4Ratings.B}). Rationale: ${p4Rationale}`,
          challengeAnswer: ""
        }
      }));
      setHasRespondedToMainQuestion(true);
      
      const isCorrect = p4SelectedModel === "B";
      let p4ChallengeIntro = "";

      if (!isCorrect) {
        p4ChallengeIntro = `Wait, let's stop and calibrate immediately, ${profile.name}. You ranked Model A higher, but Model A completely violated the absolute negative constraint to 'ONLY use present-tense verbs' (it used past 'madrugó' and future 'atrapará')! In professional AI evaluation, a negative constraint violation is a critical, disqualifying failure. How can you defend ranking a non-compliant model higher simply because of minor prose aesthetics? Defend this major audit error:`;
      } else {
        p4ChallengeIntro = `Excellent selection, ${profile.name}. You correctly identified that Model B adhered to the negative constraint of present tense, whereas Model A failed. However, let's push back on your rationale. A senior reviewer on the client team argues: 'Spanish speakers will find Model B's strict present-tense prose awkward and repetitive. We should prioritize natural communication flow over pedantic grammar rules.' How would you professionally refute this reviewer?`;
      }
      
      setChatHistory(prev => [
        ...prev,
        {
          sender: "interviewer",
          text: `[ADAPTIVE CHALLENGE TRIGGER]
${p4ChallengeIntro}`,
          isChallenge: true
        }
      ]);
      setIsInterviewerTyping(false);
    }, 1200);
  };

  // Helper: Grade the entire interview and generate report metrics
  const handleGenerateReport = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Basic scoring algorithm
      let finalScore = 50; // base score

      // Check Phase 4 choices: Correct choice is Model B (present tense compliance)
      const p4Correct = p4SelectedModel === "B";
      if (p4Correct) finalScore += 20;
      else finalScore += 5;

      // Ratings accuracy: Model B should be higher than Model A
      const ratingAccurate = p4Ratings.B > p4Ratings.A;
      if (ratingAccurate) finalScore += 5;

      // Rationale grading: length & keywords
      const rationaleLen = p4Rationale.trim().split(/\s+/).filter(Boolean).length;
      if (rationaleLen >= 20) finalScore += 5;
      if (p4Rationale.toLowerCase().includes("negative constraint")) finalScore += 5;
      if (p4Rationale.toLowerCase().includes("present tense")) finalScore += 5;

      // Keyword density in other answers
      let textLength = 0;
      let matchedKeywordsCount = 0;
      const allText = (Object.values(userAnswers) as Array<{ mainAnswer: string; challengeAnswer: string }>).map(a => a.mainAnswer + " " + a.challengeAnswer).join(" ");
      textLength = allText.split(/\s+/).filter(Boolean).length;

      const criticalKeywords = [
        "rlhf", "sft", "reward model", "alignment", "calibration", "rubric", "evidence", "guidelines",
        "contradiction", "recency", "compliance", "optimization", "suboptimal", "negative constraint"
      ];

      criticalKeywords.forEach(kw => {
        if (allText.toLowerCase().includes(kw)) matchedKeywordsCount++;
      });

      // Cap text length bonus
      finalScore += Math.min(10, Math.round(textLength / 50));
      // Keyword matches bonus
      finalScore += Math.min(10, matchedKeywordsCount);

      // final limit check
      finalScore = Math.min(98, Math.max(45, finalScore));

      // Competency scores
      const compScores = {
        communication: Math.min(99, 70 + Math.min(28, Math.round(textLength / 12))),
        instructionFollowing: p4Correct ? 95 : 55,
        accuracyEvaluation: p4Correct && ratingAccurate ? 92 : 60,
        contextTracking: allText.toLowerCase().includes("recency") || allText.toLowerCase().includes("latest") || allText.toLowerCase().includes("most recent") ? 90 : 65,
        reasoning: Math.min(96, 65 + matchedKeywordsCount * 3),
        responseRanking: p4Ratings.B === 5 && p4Ratings.A <= 3 ? 95 : p4Ratings.B > p4Ratings.A ? 80 : 50,
        safetyAwareness: allText.toLowerCase().includes("safety") || allText.toLowerCase().includes("liability") ? 90 : 70,
        professionalism: Math.min(98, 72 + Math.min(25, matchedKeywordsCount * 2)),
        confidence: rationaleLen > 25 ? 92 : 75,
        analyticalThinking: Math.min(95, 68 + matchedKeywordsCount * 2.5),
        evidenceBasedDecisionMaking: allText.toLowerCase().includes("rubric") || allText.toLowerCase().includes("guidelines") || allText.toLowerCase().includes("evidence") ? 94 : 62
      };

      // Compile Strengths with deep personalization based on the uploaded CV profile
      const strengths = ["Rigorous commitment to negative constraints in pairwise evaluations"];
      
      if (profile.workExperience && profile.workExperience.length > 5) {
        strengths.push(`Successfully translated professional methodologies from your background ("${profile.workExperience}") into structured, high-effort audit answers.`);
      }
      if (profile.programmingKnowledge && (profile.programmingKnowledge.toLowerCase().includes("python") || profile.programmingKnowledge.toLowerCase().includes("javascript") || profile.programmingKnowledge.toLowerCase().includes("proficient"))) {
        strengths.push(`Validated your technical skills ("${profile.programmingKnowledge}") by passing the high-complexity algorithmic utility calibration in Phase 3.`);
      } else if (profile.programmingKnowledge) {
        strengths.push(`Utilized your analytical background ("${profile.programmingKnowledge}") to provide highly systematic multi-turn logical critiques.`);
      }
      if (profile.goals && profile.goals.length > 5) {
        strengths.push(`Aligned responses to your target objective to "${profile.goals}" with consistent evidence-based decision models.`);
      }

      if (compScores.communication >= 85 && !strengths.includes("Excellent text articulation and professional rationale length")) {
        strengths.push("Excellent text articulation and professional rationale length");
      }
      if (compScores.contextTracking >= 80 && !strengths.includes("Strong grasp of recency-bias rules and multi-turn instruction updates")) {
        strengths.push("Strong grasp of recency-bias rules and multi-turn instruction updates");
      }

      // Compile Weaknesses/Growth areas
      const growthAreas = [];
      if (!p4Correct) {
        growthAreas.push({ 
          topic: `Calibration discrepancy: ranking Model A's prose above Model B's strict constraint compliance (which conflicts with your target goals to "${profile.goals}")`, 
          lesson: "p2_m1_l2 (Pairwise evaluation & negative constraints)" 
        });
      }
      if (compScores.contextTracking < 80) {
        growthAreas.push({ topic: "Context tracking & multi-turn state updates", lesson: "p2_m1_l6 (Context Tracking & Information Retrieval)" });
      }
      if (compScores.accuracyEvaluation < 80) {
        growthAreas.push({ topic: "Factual hallucination verification thresholds", lesson: "p2_m1_l4 (Hallucination Auditing & Fact-checking)" });
      }
      if (growthAreas.length === 0) {
        growthAreas.push({ topic: "Advanced adversarial red-teaming safety checks & multi-lingual logic limits", lesson: "Part 4 (Expert Red-Teaming Syllabus)" });
      }

      // Platform predictions
      const platformPredictions = [
        { name: "Scale AI", score: Math.round(finalScore * 0.91 + 5), desc: finalScore >= 75 ? `Highly Ready - Excellent alignment with your background in "${profile.education.split("in")[1] || "computational logic"}".` : "Needs Study - Focus on accuracy checks." },
        { name: "Outlier", score: Math.round(finalScore * 0.93 + 2), desc: finalScore >= 80 ? "Ready - Composes highly structured, elaborate essays." : "Partially Ready - Expand rationale justification length." },
        { name: "Alignerr", score: Math.round(finalScore * 0.92 + 3), desc: finalScore >= 80 ? "Ready - Pristine logical constraint auditing." : "Needs Practice - Focus on edge case constraints." },
        { name: "Invisible", score: Math.round(finalScore * 0.90 + 6), desc: finalScore >= 75 ? `Highly Ready - Exceptional workflow structure matching your experience in "${profile.remoteExperience}".` : "Partially Ready - Adhere closely to tone guides." },
        { name: "Mercor", score: Math.round(finalScore * 0.94 + 3), desc: finalScore >= 80 ? "Highly Ready - Logical speed matches hiring standards." : "Needs Practice - Focus on reasoning constraints." },
        { name: "Micro1", score: Math.round(finalScore * 0.95 + 4), desc: finalScore >= 80 ? "Ready - Demonstrates pristine guideline conformity." : "Partially Ready - Rubric tracking needs refinement." }
      ];

      setReportScore(finalScore);
      setReportData({
        competencies: compScores,
        strengths,
        growthAreas,
        platforms: platformPredictions
      });
      setInterviewStep("report");
      setIsAnalyzing(false);

      // Post completion to main Academy stats
      onComplete(finalScore, strengths, growthAreas.map(g => g.topic));
    }, 2800);
  };

  // Helper: Reset Interview State for retakes
  const handleRetakeInterview = () => {
    setInterviewStep("setup_platform");
    setSelectedPlatform("");
    setSelectedRole("");
    setP4SelectedModel("");
    setP4Ratings({ A: 0, B: 0 });
    setP4Rationale("");
    setP4Submitted(false);
    setUserAnswers({});
    setReportData(null);
  };

  // --- RENDER PLATFORM SELECTION SCREEN ---
  if (interviewStep === "setup_platform") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-1 animate-fade-in">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-indigo-650 dark:text-indigo-400 tracking-wider font-mono">
            Step 1 of 3 &bull; Configuration
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Select Your Target Hiring Platform
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            The AI interview engine adapts its pacing, questions, challenge severity, and rubric constraints to replicate the exact hiring screens of leading platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map((plat) => {
            const isSelected = selectedPlatform === plat.id;
            return (
              <button
                key={plat.id}
                onClick={() => setSelectedPlatform(plat.id)}
                className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20 scale-[1.01]" 
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl">
                      {plat.id === "mercor" && <Brain className="w-5 h-5 text-purple-500" />}
                      {plat.id === "micro1" && <Zap className="w-5 h-5 text-blue-500" />}
                      {plat.id === "scale" && <Award className="w-5 h-5 text-emerald-500" />}
                      {plat.id === "outlier" && <Terminal className="w-5 h-5 text-orange-500" />}
                      {plat.id === "alignerr" && <Sparkles className="w-5 h-5 text-pink-500" />}
                      {plat.id === "invisible" && <Sliders className="w-5 h-5 text-cyan-500" />}
                      {plat.id === "general" && <Cpu className="w-5 h-5 text-indigo-500" />}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase">
                      {plat.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{plat.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-normal">{plat.style}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>FOCUS:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{plat.focus}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Arenas
          </button>
          
          <button
            disabled={!selectedPlatform}
            onClick={() => setInterviewStep("setup_role")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedPlatform 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Next: Select Role <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER ROLE SELECTION SCREEN ---
  if (interviewStep === "setup_role") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-1 animate-fade-in">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-indigo-650 dark:text-indigo-400 tracking-wider font-mono">
            Step 2 of 3 &bull; Configuration
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Choose Your Target Evaluation Role
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Your role determines the technical depth, scenario exercises (Phase 4 coding/general options), and score weighting standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20 scale-[1.01]" 
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-1 w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white">{r.name}</h3>
                    <span className="text-[9px] bg-slate-105 text-slate-500 px-2 py-0.5 rounded font-mono font-bold">
                      {r.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{r.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            onClick={() => setInterviewStep("setup_platform")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Platform
          </button>
          
          <button
            disabled={!selectedRole}
            onClick={() => setInterviewStep("setup_profile")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedRole 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Next: Candidate Profile <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER PROFILE ONBOARDING QUESTIONNAIRE ---
  if (interviewStep === "setup_profile") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto p-1 animate-fade-in">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono">
            Step 3 of 3 &bull; Onboarding Profile
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Build Your Assessment Profile
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload your resume or CV. Our alignment parsing engine will analyze your background to dynamically calibrate prompt scenarios, difficulty levels, and role-specific constraints.
          </p>
        </div>

        {/* Drag & Drop Upload Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Professional CV / Resume Upload
            </h3>
            
            {!uploadedFile && (
              <button
                type="button"
                onClick={handleSimulateResumeUpload}
                disabled={isSimulatingUpload || isParsing}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 shrink-0" /> 
                {isSimulatingUpload ? "Parsing CV..." : "Autofill Simulated CV"}
              </button>
            )}
          </div>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragEnter={handleFileDrag}
            onDragOver={handleFileDrag}
            onDragLeave={handleFileDrag}
            onDrop={handleFileDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
              dragActive
                ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20"
                : uploadedFile
                  ? "border-emerald-500 bg-emerald-50/5 dark:bg-emerald-950/5"
                  : "border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-950/40"
            }`}
          >
            {/* Real File Input hidden */}
            {!uploadedFile && !isParsing && (
              <input
                type="file"
                id="cv-file-input"
                accept=".pdf,.docx,.txt,.doc"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                disabled={isParsing || isSimulatingUpload}
              />
            )}

            {isParsing ? (
              <div className="space-y-4 w-full max-w-xs z-20">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-full w-fit mx-auto animate-bounce">
                  <Brain className="w-8 h-8 text-indigo-650 dark:text-indigo-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-850 dark:text-white">Analyzing & Extracting CV Data...</p>
                  <p className="text-[10px] text-slate-400">Deep structural scan in progress</p>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${parsingProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : uploadedFile ? (
              <div className="space-y-4 z-20">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full w-fit mx-auto text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-850 dark:text-white">CV Uploaded successfully</p>
                  <div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-350">{uploadedFile.name}</span>
                    <span className="text-slate-400">({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="text-[10px] font-bold text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Remove file & Upload Another
                </button>
              </div>
            ) : (
              <div className="space-y-4 z-20">
                <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800/60 w-fit mx-auto text-slate-400">
                  <Upload className="w-7 h-7 text-indigo-500 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-850 dark:text-white">
                    Drag and drop your CV / Resume here
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports PDF, DOCX, or TXT (Max 5MB)
                  </p>
                </div>
                <span className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all">
                  Browse Files
                </span>
              </div>
            )}
          </div>

          {/* Toggle manual overrides form */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
              className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-650 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Review / Edit Extracted Profile Details {uploadedFile && <span className="text-[10px] text-emerald-500 font-mono">(Extracted from CV!)</span>}
              </span>
              {isFormExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isFormExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4 pt-4 border-t border-slate-50 dark:border-slate-850 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Full Name:</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Highest Education:</label>
                  <input
                    type="text"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Work Experience Summary:</label>
                  <input
                    type="text"
                    value={profile.workExperience}
                    onChange={(e) => setProfile({ ...profile, workExperience: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Prior AI / Annotation Experience:</label>
                  <input
                    type="text"
                    value={profile.aiExperience}
                    onChange={(e) => setProfile({ ...profile, aiExperience: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Programming Knowledge Level:</label>
                  <input
                    type="text"
                    value={profile.programmingKnowledge}
                    onChange={(e) => setProfile({ ...profile, programmingKnowledge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Foreign Languages Spoken:</label>
                  <input
                    type="text"
                    value={profile.languages}
                    onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Remote Work Experience:</label>
                  <input
                    type="text"
                    value={profile.remoteExperience}
                    onChange={(e) => setProfile({ ...profile, remoteExperience: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-350">Motivation & Career Goals:</label>
                  <textarea
                    rows={2}
                    value={profile.goals}
                    onChange={(e) => setProfile({ ...profile, goals: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Microphone Setup Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-600 animate-pulse" /> Voice Interaction & Mic Access
            </h3>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              micPermissionState === "granted"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                : micPermissionState === "denied"
                  ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-900/40"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40"
            }`}>
              {micPermissionState === "granted" ? "Microphone Enabled" : micPermissionState === "denied" ? "Mic Access Blocked" : "Permission Required"}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-850 dark:text-white">Real-Time Conversation Mode</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Granting microphone access enables you to respond verbally to Interviewer John. The evaluation engine translates your voice to text seamlessly.
              </p>
            </div>
            {micPermissionState !== "granted" ? (
              <button
                type="button"
                onClick={requestMicrophonePermission}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" /> Enable Voice Access
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-150">
                <Check className="w-3.5 h-3.5" /> Active & Ready
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
          <button
            onClick={() => setInterviewStep("setup_role")}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Role
          </button>
          
          <button
            onClick={handleRunProfileAnalysis}
            disabled={!uploadedFile && !profile.name}
            className={`px-6 py-3 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98 ${
              uploadedFile || profile.name
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" /> Analyze Profile & Build Interview
          </button>
        </div>
      </div>
    );
  }

  // --- RENDER CANDIDATE PROFILE ONBOARDING ANALYSIS SCREEN ---
  if (interviewStep === "analysis") {
    return (
      <div className="max-w-2xl mx-auto p-1 text-center py-12 animate-fade-in">
        {isAnalyzing ? (
          <div className="space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-slate-800"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Interviewer Agent Active</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Reviewing CV education milestones, cross-referencing past roles with alignment logic, and compiling targeted pairwise exercises...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono font-bold uppercase px-2 py-0.5 rounded">
                  Analytical Summary
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">Interviewer Digest Generated</h3>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl text-xs leading-relaxed text-slate-700 dark:text-slate-350 space-y-3 font-sans">
              <p className="whitespace-pre-line">{analysisText}</p>
            </div>

            {/* Profile Fit indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl border">
                <p className="text-xs font-bold text-slate-850 dark:text-white">85%</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Experience Fit</p>
              </div>
              <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl border">
                <p className="text-xs font-bold text-slate-850 dark:text-white">70%</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Technical Baseline</p>
              </div>
              <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-2xl border">
                <p className="text-xs font-bold text-slate-850 dark:text-white">90%</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Adaptation Curve</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => setInterviewStep("setup_profile")}
                className="flex-1 py-3 border border-slate-250 dark:border-slate-800 text-slate-500 hover:text-slate-805 dark:text-slate-400 dark:hover:text-white rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </button>
              <button
                onClick={handleStartInterview}
                className="flex-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-1.5 group font-sans"
              >
                Enter Virtual Interview Room <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER RUNNING ACTIVE INTERVIEW CONSOLE ---
  if (interviewStep === "interviewing") {
    const currentQ = interviewQuestions[activePhaseIndex];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in pl-1">
        
        {/* 1. Left Progress Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm h-fit space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-450 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider block w-fit">
              Hiring Portal Simulation
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 leading-tight uppercase font-sans tracking-tight">
              {PLATFORMS.find(p => p.id === selectedPlatform)?.name} Assessment
            </h3>
            <span className="text-[10px] text-slate-400 block mt-1">Role: {ROLES.find(r => r.id === selectedRole)?.name}</span>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">Assessment Timeline</span>
            
            <div className="space-y-3 font-sans">
              {interviewQuestions.map((q, idx) => {
                const isActive = activePhaseIndex === idx;
                const isCompleted = activePhaseIndex > idx;
                
                return (
                  <div key={q.id} className="flex gap-2.5 items-start text-xs">
                    <div className="flex flex-col items-center shrink-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive 
                          ? "bg-indigo-600 text-white ring-4 ring-indigo-500/25" 
                          : isCompleted 
                            ? "bg-emerald-500 text-white" 
                            : "bg-slate-100 text-slate-450 dark:bg-slate-850"
                      }`}>
                        {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                      </span>
                      {idx < interviewQuestions.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1.5 ${isCompleted ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-850"}`}></div>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <p className={`font-semibold text-[11px] truncate ${isActive ? "text-slate-900 dark:text-white font-extrabold" : "text-slate-450"}`}>
                        {q.phaseName}
                      </p>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Weight: {q.weight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl space-y-2 text-[10px] font-mono text-slate-500">
            <span className="font-extrabold text-slate-700 dark:text-slate-400 block">ADAPTIVE INTELLIGENCE METRICS</span>
            <div className="flex justify-between items-center">
              <span>Interviewer Mood:</span>
              <span className="font-bold text-indigo-650 dark:text-indigo-400">Analytical</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pacing Engine:</span>
              <span className="font-bold text-emerald-600">Adaptive Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Challenge Mode:</span>
              <span className="font-bold text-orange-600">Armed & Responsive</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to cancel the active interview? Progress will be discarded.")) {
                handleRetakeInterview();
              }
            }}
            className="w-full py-2 border hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-[10px] font-bold text-slate-450 hover:text-slate-700 dark:hover:text-white uppercase tracking-wider font-mono cursor-pointer transition-colors"
          >
            Cancel Assessment
          </button>
        </div>

        {/* 2. Chat / Evaluation Workspace Panel */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Chat Feed Console */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between min-h-[450px]">
            <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Live Assessment Chat Interface
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVoiceToggle}
                  className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    isVoiceEnabled 
                      ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-250 text-indigo-650 dark:text-indigo-400" 
                      : "bg-slate-50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 text-slate-450 hover:text-slate-650"
                  }`}
                  title={isVoiceEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
                >
                  {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="hidden sm:inline">{isVoiceEnabled ? "AI Voice Active" : "AI Voice Muted"}</span>
                </button>
                <span className="text-xs text-slate-400">Phase {currentQ.phase} of 5</span>
              </div>
            </div>

            {/* Interactive Speaking Panel of Interviewer John */}
            <div className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800/80 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
              {/* Animated Background Pulse Wave */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
                <div className={`rounded-full border border-indigo-500 absolute transition-all duration-1000 ${isAiSpeaking ? "w-[240px] h-[240px] animate-ping" : "w-[120px] h-[120px]"}`}></div>
                <div className="w-[180px] h-[180px] rounded-full border border-indigo-400 animate-spin-slow absolute"></div>
              </div>

              <div className="flex flex-col items-center space-y-2 z-10 relative">
                {/* Visualizer Speaker Orb */}
                <div className="relative">
                  {isAiSpeaking ? (
                    <>
                      <div className="absolute -inset-3 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 animate-ping"></div>
                      <div className="absolute -inset-1.5 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 animate-pulse"></div>
                    </>
                  ) : (
                    <div className="absolute -inset-1 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                  )}
                  
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-650 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md transition-all duration-300 ${
                    isAiSpeaking ? "scale-105 ring-4 ring-indigo-500/25" : "scale-100"
                  }`}>
                    {isAiSpeaking ? (
                      <div className="flex items-center gap-0.5 h-6">
                        <span className="w-0.75 h-4 bg-white rounded-full animate-bounce delay-75"></span>
                        <span className="w-0.75 h-6 bg-white rounded-full animate-bounce"></span>
                        <span className="w-0.75 h-5 bg-white rounded-full animate-bounce delay-150"></span>
                        <span className="w-0.75 h-3 bg-white rounded-full animate-bounce delay-100"></span>
                      </div>
                    ) : (
                      <Mic className="w-5 h-5 text-indigo-100" />
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAiSpeaking ? "bg-indigo-500 animate-ping" : "bg-emerald-500"}`}></span>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">John &bull; Lead Interviewer</h4>
                  </div>
                  <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {isAiSpeaking ? "Speaking natural voice..." : "Voice Connected & Ready"}
                  </p>
                </div>

                {/* Simulated Jumping Equalizer Waves */}
                {isAiSpeaking && (
                  <div className="flex items-center justify-center gap-0.5 pt-1 h-3 overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-0.5 bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-150"
                        style={{ 
                          height: `${Math.floor(Math.random() * 12) + 4}px`,
                          animation: `bounce 0.6s ease-in-out infinite alternate`,
                          animationDelay: `${i * 60}ms`
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 my-4 max-h-[350px] pr-2">
              {chatHistory.map((msg, i) => {
                const isInterviewer = msg.sender === "interviewer";
                return (
                  <div 
                    key={i} 
                    className={`flex items-start gap-3 text-xs max-w-[85%] ${
                      isInterviewer ? "mr-auto" : "ml-auto flex-row-reverse"
                    } animate-fade-in`}
                  >
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                      isInterviewer 
                        ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border dark:border-indigo-900" 
                        : "bg-slate-900 text-white"
                    }`}>
                      {isInterviewer ? (
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-450 font-sans">John</span>
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap font-sans ${
                      isInterviewer 
                        ? msg.isChallenge 
                          ? "bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/20 text-slate-800 dark:text-slate-200"
                          : "bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800"
                        : "bg-indigo-600 text-white font-medium"
                    }`}>
                      {msg.isChallenge && (
                        <span className="text-[9px] font-mono font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest block mb-1">
                          ⚡ Interviewer Calibration Challenge
                        </span>
                      )}
                      {isInterviewer ? (
                        <TypewriterText text={msg.text} isLast={i === chatHistory.length - 1} speed={30} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                );
              })}
              
              {isInterviewerTyping && (
                <div className="flex items-start gap-3 mr-auto animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-slate-105 flex items-center justify-center">
                    <Cpu className="w-4 h-4 animate-spin text-indigo-600" />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            {currentQ.phase !== 4 || p4Submitted ? (
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex gap-2">
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={
                    hasRespondedToMainQuestion 
                      ? "Submit your calibration defense rationale..." 
                      : "Type your professional answer, citing alignment metrics..."
                  }
                  rows={2}
                  className="flex-1 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-sans"
                />
                
                <button
                  type="button"
                  onClick={() => toggleListening("chat")}
                  className={`rounded-2xl px-4 flex items-center justify-center cursor-pointer transition-all border shrink-0 ${
                    isListening && listeningTargetRef.current === "chat"
                      ? "bg-red-500 border-red-500 text-white animate-pulse shadow-md" 
                      : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                  title={isListening && listeningTargetRef.current === "chat" ? "Stop recording voice" : "Speak response (Speech-to-Text)"}
                >
                  {isListening && listeningTargetRef.current === "chat" ? (
                    <div className="flex items-center gap-1.5">
                      <Mic className="w-4 h-4 animate-bounce" />
                      <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">Listening</span>
                    </div>
                  ) : (
                    <Mic className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                <button
                  onClick={handleSendResponse}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 flex items-center justify-center cursor-pointer shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Phase 4 Live Evaluation Interactive Workspace Embed */}
          {currentQ.phase === 4 && !p4Submitted && (
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/20 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest">
                    Phase 4 Active Workspace
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 mb-0">
                    Pairwise Translation Evaluation Exercise
                  </h3>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl border border-amber-150 text-[10px] text-amber-800 dark:text-amber-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5" /> Exercise Timer Active
                </div>
              </div>

              {/* Pairwise prompt contract */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block">User Prompt & Negative Constraints</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-normal font-sans italic">
                    "Translate 'The early bird catches the worm' into Spanish. You must follow these strict requirements: 
                    1. ONLY use verbs in the present tense. 
                    2. Format your output as a bulleted list with bold key phrases."
                  </p>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-855 text-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-450 uppercase block">Expert Alignment Guideline Clause</span>
                  <p className="text-slate-505 leading-normal">
                    <span className="font-bold text-indigo-600">Guideline Core Metric:</span> Negative constraints (like 'only use verbs in present tense') are absolute filters. Even if a model's prose flow is slightly suboptimal, perfect structural compliance must always be ranked higher than beautiful but non-compliant outputs.
                  </p>
                </div>
              </div>

              {/* Models Side-By-Side Outputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model A Output */}
                <div className="border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-black text-rose-600 uppercase">Model A</strong>
                    <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                      Fluid but Non-Compliant
                    </span>
                  </div>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl font-sans text-xs leading-relaxed text-slate-750 dark:text-slate-350">
                    <ul className="list-disc pl-4 space-y-1 my-0">
                      <li>El pájaro que <strong>madrugó</strong> (past tense) <strong>atrapará</strong> (future tense) el gusano.</li>
                      <li>La recompensa <strong>perteneció</strong> (past tense) a quien <strong>actuará</strong> (future tense) rápido.</li>
                    </ul>
                  </div>
                </div>

                {/* Model B Output */}
                <div className="border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-center">
                    <strong className="text-xs font-black text-emerald-600 uppercase">Model B</strong>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                      Present Tense Compliant
                    </span>
                  </div>
                  
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl font-sans text-xs leading-relaxed text-slate-750 dark:text-slate-350">
                    <ul className="list-disc pl-4 space-y-1 my-0">
                      <li>El pájaro que <strong>madruga</strong> (present tense) <strong>consigue</strong> (present tense) el gusano.</li>
                      <li>La recompensa <strong>corresponde</strong> (present tense) a quien <strong>actúa</strong> (present tense) rápido.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Interactive Scoring Panel */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6">
                
                {/* Preference Pick */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-white block">
                    1. Overall Pairwise Preference (Which Model is superior?):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["A", "B"].map((m) => {
                      const isSelected = p4SelectedModel === m;
                      return (
                        <button
                          key={m}
                          onClick={() => setP4SelectedModel(m as "A" | "B")}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                            isSelected 
                              ? "bg-indigo-650 border-indigo-650 text-white scale-[1.01] shadow" 
                              : "bg-white border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-650"
                          }`}
                        >
                          Model {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stars rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-white block">
                      Model A Rating (1-5 Stars):
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setP4Ratings({ ...p4Ratings, A: star })}
                          className="cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${p4Ratings.A >= star ? "text-amber-500 fill-amber-500 scale-105" : "text-slate-300 hover:text-amber-250"} transition-all`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-white block">
                      Model B Rating (1-5 Stars):
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setP4Ratings({ ...p4Ratings, B: star })}
                          className="cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${p4Ratings.B >= star ? "text-amber-500 fill-amber-500 scale-105" : "text-slate-300 hover:text-amber-250"} transition-all`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Professional rationale commentary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800 dark:text-white block">
                      2. Write Your Calibration Rationale Justification (Min 10 words):
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleListening("phase4")}
                      className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                        isListening && listeningTargetRef.current === "phase4"
                          ? "bg-red-500 border-red-500 text-white animate-pulse shadow-sm" 
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350"
                      }`}
                      title={isListening && listeningTargetRef.current === "phase4" ? "Stop recording voice" : "Speak rationale (Speech-to-Text)"}
                    >
                      {isListening && listeningTargetRef.current === "phase4" ? (
                        <>
                          <Mic className="w-3 h-3 animate-bounce" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                          <span>Speak Rationale</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-1 leading-normal">
                    Cite prompt constraints and negative tense violations to defend your rating objectively as an elite reviewer would.
                  </p>
                  <textarea
                    rows={3}
                    value={p4Rationale}
                    onChange={(e) => setP4Rationale(e.target.value)}
                    placeholder="E.g., Model B is superior due to full present-tense negative constraint compliance, while Model A committed severe tense violations by using past/future verbs..."
                    className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-indigo-500 text-slate-800 dark:text-slate-200"
                  />
                  <span className="text-[9px] text-slate-400 font-mono text-right block">
                    Word count: {p4Rationale.trim().split(/\s+/).filter(Boolean).length} / 10
                  </span>
                </div>

                <button
                  onClick={handleP4Submit}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Submit Live Pair Assessment & Defend Answer
                </button>
              </div>
            </div>
          )}

          {/* Report compile triggering footer */}
          {chatHistory.length >= 10 && (
            <div className="flex justify-center p-4 bg-white dark:bg-slate-900 border rounded-3xl animate-fade-in shadow-sm">
              <button
                onClick={handleGenerateReport}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer animate-pulse flex items-center gap-1.5 font-sans"
              >
                <Award className="w-4 h-4 shrink-0" /> Finalize Assessment & Generate Readiness Report
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  // --- RENDER DETAILED REPORT SCREEN ---
  if (interviewStep === "report" && reportData) {
    const passed = reportScore >= 85;
    
    return (
      <div className="space-y-8 max-w-5xl mx-auto p-1 pb-16 animate-fade-in">
        
        {/* Certificate Banner Card */}
        <div className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-slate-800/60 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[9px] bg-indigo-500 text-white font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                AI Alignment Licensing Division
              </span>
              
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight leading-tight">
                PLATFORM READINESS REPORT
              </h2>
              
              <p className="text-xs text-indigo-200/80 max-w-lg leading-relaxed font-sans">
                Completed assessment for <span className="font-bold text-white">{PLATFORMS.find(p => p.id === selectedPlatform)?.name}</span> as a <span className="font-bold text-white">{ROLES.find(r => r.id === selectedRole)?.name}</span>. Diagnostic grades compiled in core RLHF competencies.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-1 font-mono text-[11px] text-indigo-305">
                <div>Candidate: <span className="text-white font-bold">{profile.name}</span></div>
                <span>&bull;</span>
                <div>Hash: <span className="text-indigo-400 select-all">AIS-INT-{Math.floor(100000 + Math.random() * 900000)}</span></div>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="bg-slate-900/60 backdrop-blur-xs p-6 rounded-3xl border border-slate-800 text-center space-y-1.5 shrink-0 w-44">
              <p className="text-[9px] uppercase text-slate-450 font-bold font-mono">Overall Readiness</p>
              <p className={`text-5xl font-black ${passed ? "text-emerald-500" : "text-amber-500"}`}>
                {reportScore}%
              </p>
              <span className={`text-[10px] font-bold uppercase block ${passed ? "text-emerald-400" : "text-amber-400"}`}>
                {passed ? "Elite Cert Ready" : "Partially Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Competencies Progress Bars & Platform Fit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Competency Scorecard */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" /> Core Alignment Competency Diagnostic
            </h3>
            
            <div className="space-y-3.5 pt-1 text-xs">
              {Object.entries(reportData.competencies).map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const grade = (value as number) >= 95 ? "A+" : (value as number) >= 90 ? "A" : (value as number) >= 80 ? "B+" : "B";
                
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{label}</span>
                      <div className="flex items-center gap-1.5 font-bold font-mono">
                        <span className="text-slate-900 dark:text-white">{(value as number)}%</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          grade.includes("A") 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>{grade}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (value as number) >= 90 ? "bg-emerald-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Fit Prediction Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Hiring Platform Suitability Matrix
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {reportData.platforms.map((plat: any) => {
                const ready = plat.score >= 80;
                return (
                  <div key={plat.name} className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-855 dark:text-white">{plat.name}</strong>
                      <span className={`text-[10px] font-bold font-mono ${ready ? "text-emerald-600" : "text-amber-600"}`}>
                        {plat.score}% Match
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-850 h-1 rounded overflow-hidden">
                      <div 
                        className={`h-full ${ready ? "bg-emerald-500" : "bg-amber-500"}`}
                        style={{ width: `${plat.score}%` }}
                      ></div>
                    </div>

                    <p className="text-[10px] text-slate-405 leading-normal">{plat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Strengths & Academy Growth Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 shrink-0" /> Audited Core Strengths
            </h4>
            <ul className="text-xs text-slate-655 dark:text-slate-350 list-disc pl-4 space-y-2">
              {reportData.strengths.map((s: string, i: number) => (
                <li key={i} className="leading-relaxed">{s}</li>
              ))}
            </ul>
          </div>

          {/* Growth Plan & Academy Links */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 space-y-3">
            <h4 className="text-xs font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <ThumbsDown className="w-4 h-4 shrink-0" /> Recommended Academy Growth Plan
            </h4>
            
            <div className="space-y-2 text-xs">
              {reportData.growthAreas.map((g: any, i: number) => (
                <div key={i} className="p-3 bg-white dark:bg-slate-900 border rounded-xl space-y-1 flex justify-between items-center gap-3">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{g.topic}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Suggested Syllabus Focus</span>
                  </div>
                  <span className="bg-indigo-50 text-indigo-750 dark:bg-indigo-950/40 text-[9px] font-mono px-2 py-1 rounded font-extrabold uppercase shrink-0">
                    {g.lesson.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INTERVIEW REPLAY & EXPERT COACHING ACCORDION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-500" /> Interactive Interview Replay & Expert Calibration Coaching
            </h3>
            <p className="text-xs text-slate-450 mt-1 leading-normal">
              Review every response and adaptive challenge alongside certified calibration-grade answers to perfect your performance.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {interviewQuestions.map((q, idx) => {
              const answers = userAnswers[q.id] || { mainAnswer: "N/A", challengeAnswer: "N/A" };
              const isExpanded = expandedReplayIndex === idx;
              
              return (
                <div key={q.id} className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedReplayIndex(isExpanded ? null : idx)}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-105 flex justify-between items-center text-left text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-mono px-2 py-0.5 rounded text-[10px]">
                        Phase {q.phase}
                      </span>
                      <span>{q.phaseName}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-150 dark:border-slate-800 space-y-5 text-xs font-sans leading-relaxed text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900">
                      
                      {/* Interviewer Question */}
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-900">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">1. Interviewer Question Prompt:</span>
                        <p className="font-semibold text-slate-900 dark:text-white italic">"{q.question}"</p>
                      </div>

                      {/* Candidate Answer */}
                      <div className="space-y-1 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                        <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">2. Your Answer:</span>
                        <p className="text-slate-800 dark:text-slate-200">"{answers.mainAnswer}"</p>
                      </div>

                      {/* Adaptive Challenge & Answer */}
                      {answers.challengeAnswer && (
                        <div className="space-y-3 border-l-2 border-orange-500/40 pl-3">
                          <div className="space-y-1 bg-orange-500/5 p-3.5 rounded-xl border border-orange-500/15">
                            <span className="text-[9px] font-mono font-bold text-orange-600 dark:text-orange-400 uppercase">3. Interviewer Calibration Challenge:</span>
                            <p className="font-semibold text-slate-900 dark:text-white italic">
                              "{q.phase === 4 
                                ? `You chose Model ${p4SelectedModel || "B"}. However, a lead calibration reviewer argues: 'Model A's Spanish translation is far more natural, idiomatic, and elegant. We shouldn't fail a model's fluid translation over minor grammar constraints like present tenses.' How would you professionally refute this reviewer?` 
                                : q.challengeQuestion}"
                            </p>
                          </div>
                          
                          <div className="space-y-1 bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/15">
                            <span className="text-[9px] font-mono font-bold text-indigo-650 dark:text-indigo-400 uppercase">4. Your Calibration Defense:</span>
                            <p className="text-slate-800 dark:text-slate-200">"{answers.challengeAnswer}"</p>
                          </div>
                        </div>
                      )}

                      {/* Expert Guidance calibration panel */}
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-3">
                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lead Reviewer Expert Assessment Feedback
                        </span>

                        <div className="space-y-2 leading-relaxed">
                          <p>
                            <strong className="text-slate-900 dark:text-white">Suggested Calibration Rationale:</strong>
                          </p>
                          <p className="p-3 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed italic">
                            "{q.phase === 4 ? q.sampleExcellentAnswer + " " + q.sampleExcellentChallengeAnswer : q.sampleExcellentAnswer}"
                          </p>
                          
                          <p className="text-xs text-slate-500 mt-2 font-sans">
                            <strong className="text-slate-855 dark:text-white block uppercase text-[10px] tracking-wider mb-0.5">Scoring Strategy:</strong> 
                            Evaluators are scored on keyword alignment ("{q.idealKeywords.slice(0, 5).join('", "')}") and adherence to objective constraints. Rationales must defend rules over intuition and avoid lazy rating habits.
                          </p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Retake Control */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleRetakeInterview}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-705 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <RotateCcw className="w-4 h-4 shrink-0" /> Retake Mock Assessment Simulator
          </button>
          
          <button
            onClick={onBack}
            className="px-6 py-3 bg-slate-105 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl text-xs font-bold shadow-xs cursor-pointer font-sans"
          >
            Return to Dashboard
          </button>
        </div>

      </div>
    );
  }

  return null;
}
