"use server";

import { createClient } from "@/lib/supabase/server";

export interface SavedCvProfile {
  name: string;
  education: string;
  workExperience: string;
  aiExperience: string;
  programmingKnowledge: string;
  languages: string;
  remoteExperience: string;
  goals: string;
}

export async function saveCvProfile(profile: SavedCvProfile): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ saved_cv_profile: profile })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getSavedCvProfile(): Promise<SavedCvProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("saved_cv_profile")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(`getSavedCvProfile: ${error.message}`);
  return data?.saved_cv_profile ?? null;
}
