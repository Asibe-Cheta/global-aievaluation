import { createClient } from "@/lib/supabase/server";

export interface AdminJobRow {
  id: string;
  title: string;
  pay_rate: string | null;
  pay_rate_min_cents: number | null;
  referral_reward: string | null;
  badge: string | null;
  hired_text: string | null;
  category: "project-based" | "one-time" | "talent-network";
  field: string;
  avatars: string[];
  required_lesson_id: string | null;
  required_lesson_name: string | null;
  description: string | null;
  skills_needed: string[];
  application_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface AdminAchievementRow {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  req_metric: string | null;
  sort_order: number;
}

export async function getAdminJobs(): Promise<AdminJobRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getAdminJobs: ${error.message}`);
  return data ?? [];
}

export async function getAdminJob(id: string): Promise<AdminJobRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminJob: ${error.message}`);
  return data;
}

export async function getAdminAchievements(): Promise<AdminAchievementRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getAdminAchievements: ${error.message}`);
  return data ?? [];
}

export async function getAdminAchievement(
  id: string,
): Promise<AdminAchievementRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminAchievement: ${error.message}`);
  return data;
}
