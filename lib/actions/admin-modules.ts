"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ModuleFormInput {
  title: string;
  description: string;
  simSkillBoosts: Record<string, number>;
  sortOrder: number;
}

function toRow(input: ModuleFormInput) {
  return {
    title: input.title,
    description: input.description || null,
    sim_skill_boosts: input.simSkillBoosts,
    sort_order: input.sortOrder,
  };
}

export async function createModule(
  id: string,
  input: ModuleFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("modules")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath("/admin/modules");
  revalidatePath("/");
  redirect("/admin/modules");
}

export async function updateModule(
  id: string,
  input: ModuleFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("modules")
    .update(toRow(input))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/modules");
  revalidatePath("/");
  redirect("/admin/modules");
}

export async function deleteModule(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/modules");
  revalidatePath("/");
  return {};
}
