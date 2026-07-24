"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface ExamQuestionFormInput {
  moduleId: string;
  type: "mcq" | "tf" | "scenario";
  category: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  part: string;
  scenario: string;
  sortOrder: number;
}

function toRow(input: ExamQuestionFormInput) {
  return {
    module_id: input.moduleId,
    type: input.type,
    category: input.category,
    question: input.question || null,
    options: input.options,
    correct_option_index: input.correctOptionIndex,
    explanation: input.explanation || null,
    part: input.part || null,
    scenario: input.scenario || null,
    sort_order: input.sortOrder,
  };
}

export async function createExamQuestion(
  id: string,
  input: ExamQuestionFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_questions")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath("/admin/exam-questions");
  revalidatePath("/");
  redirect("/admin/exam-questions");
}

export async function updateExamQuestion(
  id: string,
  input: ExamQuestionFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_questions")
    .update(toRow(input))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/exam-questions");
  revalidatePath("/");
  redirect("/admin/exam-questions");
}

export async function deleteExamQuestion(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_questions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/exam-questions");
  revalidatePath("/");
  return {};
}
