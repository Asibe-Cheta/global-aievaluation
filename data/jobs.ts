export interface JobOpportunity {
  id: string;
  title: string;
  payRate: string;
  referralReward: string;
  badge?: string;
  hiredText?: string;
  category: "project-based" | "one-time" | "talent-network";
  field: "Generalist" | "AI Safety" | "Coding & SWE" | "Medical & Bio" | "Consulting" | "Other";
  avatars?: string[];
  requiredLessonId?: string;
  requiredLessonName?: string;
  description: string;
  skillsNeeded: string[];
}

export const DEFAULT_JOBS: JobOpportunity[] = [
  {
    id: "generalist-expert",
    title: "Generalist Expert",
    payRate: "$70 / hour",
    referralReward: "$280",
    badge: "Submitted on 06/11/26",
    hiredText: "New opportunity",
    category: "project-based",
    field: "Generalist",
    requiredLessonId: "lesson-intro",
    requiredLessonName: "Introduction to Evaluation Models",
    description: "Review and refine model outputs for reasoning, logical flow, and factuality. Perfect for skilled generalists with high attention to detail.",
    skillsNeeded: ["Logical Reasoning", "Fact-Checking", "Constructive Criticism", "Prompt Optimization"]
  },
  {
    id: "gamers",
    title: "Gamers",
    payRate: "$11 - $12 / hour",
    referralReward: "$60",
    hiredText: "1035 hired this month",
    category: "project-based",
    field: "Other",
    avatars: ["F", "A", "P"],
    description: "Evaluate gaming AI agents, dialogue responses, and behavior in roleplay games. Help developers train more engaging NPC systems.",
    skillsNeeded: ["Gameplay Mechanics", "Dialogue Evaluation", "Creative Roleplay", "Bug Reporting"]
  },
  {
    id: "management-consultants",
    title: "Management & Strategy Consultants (MBB/Big 5)",
    payRate: "$100 / hour",
    referralReward: "$400",
    hiredText: "2073 hired this month",
    category: "project-based",
    field: "Consulting",
    avatars: ["B", "R", "K"],
    requiredLessonId: "lesson-reasoning",
    requiredLessonName: "Mathematical & Logical Reasoning",
    description: "High-tier advisory role evaluating AI decision-making models. Assess complex strategy proposals, financial models, and business logic frameworks.",
    skillsNeeded: ["Financial Modeling", "Strategic Frameworks", "Executive Communication", "Data Synthesis"]
  },
  {
    id: "internal-medicine-expert",
    title: "Internal Medicine Expert",
    payRate: "$130 - $180 / hour",
    referralReward: "$1200",
    badge: "1-click apply",
    hiredText: "878 hired this month",
    category: "project-based",
    field: "Medical & Bio",
    avatars: ["L", "F", "A"],
    description: "Review clinical diagnoses, medical summaries, and patient communication modules. Verify medical accuracy against certified clinical guidelines.",
    skillsNeeded: ["Clinical Diagnostics", "Medical Terminology", "HIPAA Awareness", "Expert Review"]
  },
  {
    id: "cybersecurity-swe",
    title: "Cybersecurity SWE — AI Safety",
    payRate: "$60 - $90 / hour",
    referralReward: "$360",
    hiredText: "9 hired this month",
    category: "project-based",
    field: "AI Safety",
    avatars: ["K", "E", "V"],
    requiredLessonId: "lesson-safety",
    requiredLessonName: "RLHF Safety & Red Teaming Techniques",
    description: "Red-team critical code generation pipelines. Identify security vulnerabilities, memory leaks, and sandbox evasion attempts in model-generated software.",
    skillsNeeded: ["Penetration Testing", "Vulnerability Research", "Secure Coding", "Red Teaming"]
  },
  {
    id: "biology-expert-phd",
    title: "Biology Expert (PhD) — AI Safety",
    payRate: "$65 - $70 / hour",
    referralReward: "$280",
    badge: "1-click apply",
    hiredText: "7 hired this month",
    category: "project-based",
    field: "AI Safety",
    avatars: ["S", "L", "F"],
    description: "Guard models against CBRN biological risks. Evaluate responses concerning molecular biology, epidemiology, and high-consequence laboratory protocols.",
    skillsNeeded: ["Molecular Biology", "Bio-Safety Assessment", "Academic Research", "CBRN Red Teaming"]
  },
  {
    id: "chemistry-expert-phd",
    title: "Chemistry Expert (PhD) — AI Safety",
    payRate: "$65 - $70 / hour",
    referralReward: "$280",
    badge: "1-click apply",
    hiredText: "9 hired this month",
    category: "project-based",
    field: "AI Safety",
    avatars: ["C", "S", "L"],
    description: "Perform strict safety evaluations for chemistry instruction sets. Identify chemical synthesis hazards, hazardous compound formulas, and safety guardrails.",
    skillsNeeded: ["Organic Chemistry", "Chemical Safety", "Data Verification", "Synthesis Safeguards"]
  },
  {
    id: "cuda-engineering-expert",
    title: "CUDA Engineering Expert",
    payRate: "$80 - $100 / hour",
    referralReward: "$480",
    hiredText: "63 hired this month",
    category: "project-based",
    field: "Coding & SWE",
    avatars: ["B", "R", "K"],
    requiredLessonId: "lesson-coding",
    requiredLessonName: "Programming & Code Evaluation Standards",
    description: "Benchmark and evaluate low-level GPU acceleration libraries and CUDA kernel generations. Provide precise feedback on memory optimization.",
    skillsNeeded: ["CUDA C/C++", "GPU Architecture", "Kernel Optimization", "Parallel Programming"]
  },
  {
    id: "medical-expert",
    title: "Medical Expert",
    payRate: "$130 - $180 / hour",
    referralReward: "$1200",
    badge: "1-click apply",
    hiredText: "47 hired this month",
    category: "project-based",
    field: "Medical & Bio",
    avatars: ["F", "A", "P"],
    description: "Provide high-fidelity expert reviews on medical research papers, pharmacology tables, and clinical guidelines generated by medical AI systems.",
    skillsNeeded: ["Pharmacology", "Literature Review", "Clinical Research", "Pathology Assessment"]
  },
  {
    id: "biology-research-scientist",
    title: "Biology Research Scientist (BA, MS, PhD)",
    payRate: "$50 - $70 / hour",
    referralReward: "$280",
    badge: "1-click apply",
    hiredText: "1 hired this month",
    category: "project-based",
    field: "Medical & Bio",
    avatars: ["R"],
    description: "Verify complex ecological, cellular, and microbiological explanations. Guide systems to teach core biological sciences correctly and contextually.",
    skillsNeeded: ["Microbiology", "Ecology", "Data Extraction", "Scientific Writing"]
  },
  {
    id: "devops-sre-cloud",
    title: "DevOps / SRE / Cloud Engineer (Coding Agent Exp...)",
    payRate: "$85 / hour",
    referralReward: "$340",
    hiredText: "New opportunity",
    category: "project-based",
    field: "Coding & SWE",
    description: "Assess self-executing cloud container tools and Kubernetes deployment automations. Guide autonomous development agents to safely orchestrate clouds.",
    skillsNeeded: ["Docker", "Kubernetes", "CI/CD Pipelines", "System Architecture"]
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer (Coding Agent Experience)",
    payRate: "$85 / hour",
    referralReward: "$340",
    hiredText: "New opportunity",
    category: "project-based",
    field: "Coding & SWE",
    requiredLessonId: "lesson-coding",
    requiredLessonName: "Programming & Code Evaluation Standards",
    description: "Provide rigorous feedback on backend database structures, system design proposals, and API routing schemas written by AI systems.",
    skillsNeeded: ["Node.js / Go / Python", "Database Design", "API Performance", "Distributed Systems"]
  },
  {
    id: "video-game-annotator",
    title: "Video Game Annotator",
    payRate: "$16 - $17 / hour",
    referralReward: "$80",
    hiredText: "98 hired this month",
    category: "project-based",
    field: "Other",
    avatars: ["V", "N", "H"],
    description: "Record game walkthroughs and annotate level details, quest trees, and game scripts to construct structured training corpora.",
    skillsNeeded: ["Level Navigation", "Video Logging", "Quest Script Analysis", "Attention to Detail"]
  },
  {
    id: "frontend-engineer",
    title: "Frontend Engineer (Coding Agent Experience)",
    payRate: "$85 / hour",
    referralReward: "$340",
    hiredText: "New opportunity",
    category: "project-based",
    field: "Coding & SWE",
    description: "Verify design systems, Tailwind compliance, and interactive components. Work with web design models to achieve standard-compliant pixel perfection.",
    skillsNeeded: ["React / Vue / Svelte", "Tailwind CSS", "Accessibility (a11y)", "Responsive Design"]
  },
  {
    id: "investment-banking-expert",
    title: "Investment Banking Expert",
    payRate: "$100 - $130 / hour",
    referralReward: "$520",
    hiredText: "1352 hired this month",
    category: "project-based",
    field: "Consulting",
    avatars: ["V", "N", "H"],
    description: "Evaluate quantitative modeling, algorithmic strategies, valuation spreadsheets, and mergers analysis from next-generation financial co-pilots.",
    skillsNeeded: ["M&A Valuations", "Excel Formulas", "Corporate Finance", "Quantitative Analysis"]
  },
  {
    id: "data-engineer",
    title: "Data Engineer (Coding Agent Experience)",
    payRate: "$80 / hour",
    referralReward: "$320",
    hiredText: "New opportunity",
    category: "project-based",
    field: "Coding & SWE",
    description: "Provide critical feedback on data science models, heavy SQL data warehouse schema generation, and stream pipeline integrity evaluations.",
    skillsNeeded: ["SQL Performance", "ETL Pipelines", "Pandas & Numpy", "Apache Spark"]
  },
  {
    id: "onetime-consulting",
    title: "Fast-Track LLM Prompt Audit",
    payRate: "$150 / task",
    referralReward: "$50",
    badge: "Urgent",
    hiredText: "Completed in 1 hour",
    category: "one-time",
    field: "AI Safety",
    description: "A quick, high-priority sweep of prompt injection vectors on a newly deployed chat endpoint. Spot immediate security leaks and fix model parameters.",
    skillsNeeded: ["Prompt Hacking", "Adversarial Inputs", "WAF Configuration"]
  },
  {
    id: "talent-network-expert",
    title: "Senior Technical Review Committee",
    payRate: "$120 / hour",
    referralReward: "$500",
    badge: "Elite Access",
    hiredText: "Join Network",
    category: "talent-network",
    field: "Consulting",
    description: "Exclusive vetted network for verified experts. Serve as a final-tier quality checker for professional curricula and multi-turn coding outputs.",
    skillsNeeded: ["Expert Verification", "Curriculum Design", "Architect Review"]
  }
];
