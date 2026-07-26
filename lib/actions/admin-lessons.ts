"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminMiniCaseStudy } from "@/lib/admin/queries";

export interface LessonFormInput {
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  objectives: string[];
  content: string[];
  miniCaseStudies: AdminMiniCaseStudy[];
  keyTakeaways: string[];
  sortOrder: number;
}

function toRow(input: LessonFormInput) {
  return {
    module_id: input.moduleId,
    title: input.title,
    description: input.description || null,
    duration: input.duration || null,
    objectives: input.objectives,
    content: input.content,
    mini_case_studies: input.miniCaseStudies,
    key_takeaways: input.keyTakeaways,
    sort_order: input.sortOrder,
  };
}

export async function createLesson(
  id: string,
  input: LessonFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${input.moduleId}/lessons`);
  revalidatePath("/");
  redirect(`/admin/modules/${input.moduleId}/lessons`);
}

export async function updateLesson(
  id: string,
  input: LessonFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update(toRow(input))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${input.moduleId}/lessons`);
  revalidatePath("/");
  redirect(`/admin/modules/${input.moduleId}/lessons`);
}

export async function deleteLesson(
  id: string,
  moduleId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${moduleId}/lessons`);
  revalidatePath("/");
  return {};
}
