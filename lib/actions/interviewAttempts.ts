"use server";

import { createClient } from "@/lib/supabase/server";

export interface InterviewAttemptRecord {
  id: string;
  roleId: string;
  roleName: string;
  score: number;
  competencies: Record<string, number>;
  strengths: string[];
  growthAreas: Array<{ topic: string; lesson: string }>;
  platforms: Array<{ name: string; score: number; desc: string }>;
  createdAt: string;
}

export async function saveInterviewAttempt(params: {
  roleId: string;
  roleName: string;
  score: number;
  competencies: Record<string, number>;
  strengths: string[];
  growthAreas: Array<{ topic: string; lesson: string }>;
  platforms: Array<{ name: string; score: number; desc: string }>;
  transcript: Array<{ sender: string; text: string }>;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("interview_attempts").insert({
    user_id: user.id,
    role_id: params.roleId,
    role_name: params.roleName,
    score: params.score,
    competencies: params.competencies,
    strengths: params.strengths,
    growth_areas: params.growthAreas,
    platforms: params.platforms,
    transcript: params.transcript,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getInterviewAttempts(): Promise<InterviewAttemptRecord[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("interview_attempts")
    .select("id, role_id, role_name, score, competencies, strengths, growth_areas, platforms, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(`getInterviewAttempts: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    roleId: row.role_id,
    roleName: row.role_name,
    score: row.score,
    competencies: row.competencies,
    strengths: row.strengths,
    growthAreas: row.growth_areas,
    platforms: row.platforms,
    createdAt: row.created_at,
  }));
}
