"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AchievementFormInput {
  title: string;
  description: string;
  icon: string;
  reqMetric: string;
  sortOrder: number;
}

function toRow(input: AchievementFormInput) {
  return {
    title: input.title,
    description: input.description || null,
    icon: input.icon || null,
    req_metric: input.reqMetric || null,
    sort_order: input.sortOrder,
  };
}

export async function createAchievement(
  id: string,
  input: AchievementFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("achievements")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath("/admin/achievements");
  redirect("/admin/achievements");
}

export async function updateAchievement(
  id: string,
  input: AchievementFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("achievements")
    .update(toRow(input))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/achievements");
  redirect("/admin/achievements");
}

export async function deleteAchievement(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("achievements").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/achievements");
  return {};
}
