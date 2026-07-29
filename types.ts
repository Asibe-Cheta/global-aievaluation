export enum Rank {
  TRAINEE = "Trainee Evaluator",
  JUNIOR = "Junior Evaluator",
  EVALUATOR = "Evaluator",
  SENIOR = "Senior Evaluator",
  EXPERT = "Expert Reviewer",
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reqMetric: string; // e.g., "lessons:5", "simulations:1", "score:85"
  unlocked: boolean;
}

export interface UserStats {
  completedLessons: string[]; // lessonIds
  completedSimulations: string[]; // moduleIds
  passedExams: string[]; // moduleIds
  streakCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  xp: number;
  activeRank: string;
  skills: {
    promptEvaluation: number;
    responseRanking: number;
    factChecking: number;
    safetyReview: number;
    annotation: number;
    reasoning: number;
    reasoningEvaluation: number;
    instructionFollowing: number;
  };
  practiceSubmissions: Record<string, any>;
  quizScores?: Record<string, number>;
  simulationScores?: Record<string, any>;
  examScores?: Record<string, any>;
  annotationSubmissions?: Record<string, AnnotationSubmission>;
  currentModuleId?: string;
  currentLessonId?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  role?: string;
  location?: string;
  timezone?: string;
  membershipTier?: "starter" | "professional" | "career_accelerator";
  settings?: {
    notificationsEnabled?: boolean;
    audioFeedback?: boolean;
    pacingMode?: "standard" | "speedrun";
  };
}

export interface CaseStudyMediaItem {
  type: "image" | "video" | "audio";
  path: string;
  url: string;
  durationSeconds?: number;
}

export interface ContentBlock {
  id: string;
  text: string;
  media?: CaseStudyMediaItem[]; // at most 1 attachment per block
}

export interface MiniCaseStudy {
  id: string;
  scenario: string;
  prompt: string;
  response: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  reviewerNotes?: string;
  media?: CaseStudyMediaItem[]; // max 2 videos + 2 audio clips, each <=10s
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  duration: string;
  objectives: string[];
  content: ContentBlock[]; // multi-step paragraphs, each with an optional image/video/audio
  miniCaseStudies: MiniCaseStudy[]; // 5 items
  reflectionQuestions?: string[];
  keyTakeaways: string[];
  skillBoosts?: Partial<UserStats["skills"]>;
}

export interface SimulationTask {
  id: string;
  type: "ranking" | "fact_checking" | "instruction_following" | "safety" | "annotation" | "logic" | "reasoning";
  title: string;
  prompt: string;
  responses?: {
    letter: string;
    text: string;
  }[]; // for ranking
  responseSingle?: string; // for others
  response?: string;
  options: string[]; // choices for user to select
  correctOptionIndex: number;
  idealJustificationKeywords: string[];
  rubric: string;
  explanation: string;
  idealRating?: number;
  idealFlags?: {
    hallucination: boolean;
    safety: boolean;
    formatting: boolean;
  };
  category?: string;
}

export interface AnnotationMediaItem {
  path: string;
  url: string;
  durationSeconds?: number;
}

export interface AnnotationTask {
  id: string;
  moduleId: string;
  type: "image_pair" | "video" | "audio";
  title: string;
  instructions?: string;
  media: AnnotationMediaItem[];
  scenario?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  reviewerNotes?: string;
}

export interface AnnotationSubmission {
  selectedOptionIndex: number;
  rationale: string;
  submittedAt: string;
}

export interface ExamQuestion {
  id: string;
  type: "mcq" | "tf" | "scenario";
  category: keyof UserStats["skills"];
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  part?: string;
  scenario?: string;
  media?: CaseStudyMediaItem[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  simulationIntro?: {
    scenario: string;
    objective: string;
  };
  simulationTasks: SimulationTask[];
  examQuestions: ExamQuestion[];
  annotationTasks?: AnnotationTask[];
  simSkillBoosts?: Partial<UserStats["skills"]>;
  locked?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
}
