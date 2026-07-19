"use server";

import { createClient } from "@/lib/supabase/server";
import type { UserStats } from "@/types";

export async function syncUserProgress(stats: UserStats) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [{ error: profileError }, { error: progressError }] = await Promise.all([
    supabase
      .from("profiles")
      .update({
        display_name: stats.displayName ?? null,
        job_role: stats.role ?? null,
        location: stats.location ?? null,
        timezone: stats.timezone ?? null,
        avatar_url: stats.avatarUrl ?? null,
        // membership_tier is intentionally omitted — it's only ever set by
        // the Stripe webhook (see app/api/stripe/webhook/route.ts) after a
        // real payment, and a DB trigger reverts any other attempt to change it.
        settings: stats.settings ?? {},
      })
      .eq("id", user.id),
    supabase
      .from("user_progress")
      .update({
        xp: stats.xp,
        active_rank: stats.activeRank,
        streak_count: stats.streakCount,
        last_active_date: stats.lastActiveDate
          ? new Date(stats.lastActiveDate).toISOString().slice(0, 10)
          : null,
        skills: stats.skills,
        completed_lessons: stats.completedLessons,
        completed_simulations: stats.completedSimulations,
        passed_exams: stats.passedExams,
        practice_submissions: stats.practiceSubmissions ?? {},
        quiz_scores: stats.quizScores ?? {},
        simulation_scores: stats.simulationScores ?? {},
        exam_scores: stats.examScores ?? {},
        current_module_id: stats.currentModuleId ?? null,
        current_lesson_id: stats.currentLessonId ?? null,
      })
      .eq("user_id", user.id),
  ]);

  if (profileError) throw new Error(`syncUserProgress/profile: ${profileError.message}`);
  if (progressError) throw new Error(`syncUserProgress/progress: ${progressError.message}`);
}
