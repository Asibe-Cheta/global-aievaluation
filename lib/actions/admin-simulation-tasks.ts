"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SimulationTaskFormInput {
  moduleId: string;
  type: string;
  title: string;
  prompt: string;
  responses: { letter: string; text: string }[];
  responseSingle: string;
  response: string;
  options: string[];
  correctOptionIndex: number;
  idealJustificationKeywords: string;
  rubric: string;
  explanation: string;
  idealRating: number | null;
  idealFlags: { hallucination: boolean; safety: boolean; formatting: boolean };
  category: string;
  sortOrder: number;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toRow(input: SimulationTaskFormInput) {
  return {
    module_id: input.moduleId,
    type: input.type || null,
    title: input.title || null,
    prompt: input.prompt || null,
    responses: input.type === "ranking" && input.responses.length > 0 ? input.responses : null,
    response_single: input.responseSingle || null,
    response: input.response || null,
    options: input.options,
    correct_option_index: input.correctOptionIndex,
    ideal_justification_keywords: splitList(input.idealJustificationKeywords),
    rubric: input.rubric || null,
    explanation: input.explanation || null,
    ideal_rating: input.idealRating,
    ideal_flags: input.idealFlags,
    category: input.category || null,
    sort_order: input.sortOrder,
  };
}

export async function createSimulationTask(
  id: string,
  input: SimulationTaskFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("simulation_tasks")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${input.moduleId}/simulation-tasks`);
  revalidatePath("/");
  redirect(`/admin/modules/${input.moduleId}/simulation-tasks`);
}

export async function updateSimulationTask(
  oldId: string,
  newId: string,
  input: SimulationTaskFormInput,
): Promise<{ error?: string }> {
  if (!newId.trim()) return { error: "Slug/ID is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("simulation_tasks")
    .update({ id: newId, ...toRow(input) })
    .eq("id", oldId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${input.moduleId}/simulation-tasks`);
  revalidatePath("/");
  redirect(`/admin/modules/${input.moduleId}/simulation-tasks`);
}

export async function deleteSimulationTask(
  id: string,
  moduleId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("simulation_tasks")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${moduleId}/simulation-tasks`);
  revalidatePath("/");
  return {};
}
