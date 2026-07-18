import { createClient } from "@/lib/supabase/server";
import type {
  Module,
  Achievement,
  UserStats,
} from "@/types";
import type { JobOpportunity } from "@/data/jobs";

export async function getModuleCurriculum(): Promise<Module[]> {
  const supabase = await createClient();

  const [
    { data: modules, error: modulesError },
    { data: lessons, error: lessonsError },
    { data: simulationTasks, error: simError },
    { data: examQuestions, error: examError },
  ] = await Promise.all([
    supabase.from("modules").select("*").order("sort_order"),
    supabase.from("lessons").select("*").order("sort_order"),
    supabase.from("simulation_tasks").select("*").order("sort_order"),
    supabase.from("exam_questions").select("*").order("sort_order"),
  ]);

  if (modulesError) throw new Error(`getModuleCurriculum/modules: ${modulesError.message}`);
  if (lessonsError) throw new Error(`getModuleCurriculum/lessons: ${lessonsError.message}`);
  if (simError) throw new Error(`getModuleCurriculum/simulation_tasks: ${simError.message}`);
  if (examError) throw new Error(`getModuleCurriculum/exam_questions: ${examError.message}`);

  return (modules ?? []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description ?? "",
    simulationIntro: m.simulation_intro ?? { scenario: "", objective: "" },
    lessons: (lessons ?? [])
      .filter((l) => l.module_id === m.id)
      .map((l) => ({
        id: l.id,
        moduleId: l.module_id,
        title: l.title,
        description: l.description ?? undefined,
        duration: l.duration ?? "",
        objectives: l.objectives ?? [],
        content: l.content ?? [],
        examples: l.examples ?? [],
        miniCaseStudies: l.mini_case_studies ?? [],
        reflectionQuestions: l.reflection_questions ?? [],
        keyTakeaways: l.key_takeaways ?? [],
        practiceLab: l.practice_lab ?? [],
        quiz: l.quiz ?? [],
      })),
    simulationTasks: (simulationTasks ?? [])
      .filter((t) => t.module_id === m.id)
      .map((t) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        prompt: t.prompt,
        responses: t.responses ?? undefined,
        responseSingle: t.response_single ?? undefined,
        response: t.response ?? undefined,
        options: t.options ?? [],
        correctOptionIndex: t.correct_option_index,
        idealJustificationKeywords: t.ideal_justification_keywords ?? [],
        rubric: t.rubric,
        explanation: t.explanation,
        idealRating: t.ideal_rating ?? undefined,
        idealFlags: t.ideal_flags ?? undefined,
        category: t.category ?? undefined,
      })),
    examQuestions: (examQuestions ?? [])
      .filter((q) => q.module_id === m.id)
      .map((q) => ({
        id: q.id,
        type: q.type,
        category: q.category,
        question: q.question,
        options: q.options ?? [],
        correctOptionIndex: q.correct_option_index,
        explanation: q.explanation,
        part: q.part ?? undefined,
        scenario: q.scenario ?? undefined,
      })),
  })) as Module[];
}

export async function getAchievements(): Promise<Achievement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getAchievements: ${error.message}`);

  return (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description ?? "",
    icon: a.icon ?? "",
    reqMetric: a.req_metric ?? "",
    unlocked: false,
  }));
}

export async function getJobs(): Promise<JobOpportunity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`getJobs: ${error.message}`);

  return (data ?? []).map((j) => ({
    id: j.id,
    title: j.title,
    payRate: j.pay_rate ?? "",
    referralReward: j.referral_reward ?? "",
    badge: j.badge ?? undefined,
    hiredText: j.hired_text ?? undefined,
    category: j.category,
    field: j.field,
    avatars: j.avatars ?? undefined,
    requiredLessonId: j.required_lesson_id ?? undefined,
    requiredLessonName: j.required_lesson_name ?? undefined,
    description: j.description ?? "",
    skillsNeeded: j.skills_needed ?? [],
  }));
}

const DEFAULT_SKILLS = {
  promptEvaluation: 0,
  responseRanking: 0,
  factChecking: 0,
  safetyReview: 0,
  annotation: 0,
  reasoning: 0,
  reasoningEvaluation: 0,
  instructionFollowing: 0,
};

export async function getUserStats(
  userId: string,
  email: string,
): Promise<UserStats> {
  const supabase = await createClient();

  const [{ data: profile, error: profileError }, { data: progress, error: progressError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_progress").select("*").eq("user_id", userId).single(),
    ]);

  if (profileError) throw new Error(`getUserStats/profile: ${profileError.message}`);
  if (progressError) throw new Error(`getUserStats/progress: ${progressError.message}`);

  return {
    completedLessons: progress.completed_lessons ?? [],
    completedSimulations: progress.completed_simulations ?? [],
    passedExams: progress.passed_exams ?? [],
    streakCount: progress.streak_count ?? 0,
    lastActiveDate: progress.last_active_date ?? new Date().toISOString(),
    xp: progress.xp ?? 0,
    activeRank: progress.active_rank ?? "Trainee Evaluator",
    skills: progress.skills ?? DEFAULT_SKILLS,
    practiceSubmissions: progress.practice_submissions ?? {},
    quizScores: progress.quiz_scores ?? {},
    simulationScores: progress.simulation_scores ?? {},
    examScores: progress.exam_scores ?? {},
    currentModuleId: progress.current_module_id ?? undefined,
    currentLessonId: progress.current_lesson_id ?? undefined,
    displayName: profile.display_name ?? undefined,
    avatarUrl: profile.avatar_url ?? undefined,
    email,
    role: profile.job_role ?? undefined,
    location: profile.location ?? undefined,
    timezone: profile.timezone ?? undefined,
    membershipTier: profile.membership_tier ?? "starter",
    settings: profile.settings ?? {
      notificationsEnabled: true,
      audioFeedback: true,
      pacingMode: "standard",
    },
  };
}
