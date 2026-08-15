"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminMiniCaseStudy, AdminContentBlock } from "@/lib/admin/queries";
import { validateSlugId } from "@/lib/admin/validateSlugId";

export interface LessonFormFields {
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  objectives: string[];
  content: AdminContentBlock[];
  miniCaseStudies: AdminMiniCaseStudy[];
  keyTakeaways: string[];
  sortOrder: number;
}

// Media (images/video/audio) for both content blocks and mini case studies
// is uploaded straight from the browser to Supabase Storage before submit
// (see lib/supabase/upload-media.ts, ContentBlocksEditor.tsx,
// MiniCaseStudiesEditor.tsx) — server actions have a request-body size limit
// on Vercel that clips routinely exceeded — so `content`/`miniCaseStudies`
// arrive here already carrying final `media` arrays, nothing left to upload.
function readFields(formData: FormData): LessonFormFields {
  return {
    moduleId: String(formData.get("moduleId") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    duration: String(formData.get("duration") ?? ""),
    objectives: JSON.parse(String(formData.get("objectives") ?? "[]")),
    content: JSON.parse(String(formData.get("content") ?? "[]")),
    miniCaseStudies: JSON.parse(String(formData.get("miniCaseStudies") ?? "[]")),
    keyTakeaways: JSON.parse(String(formData.get("keyTakeaways") ?? "[]")),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

function toRow(fields: LessonFormFields) {
  return {
    module_id: fields.moduleId,
    title: fields.title,
    description: fields.description || null,
    duration: fields.duration || null,
    objectives: fields.objectives,
    content: fields.content,
    mini_case_studies: fields.miniCaseStudies,
    key_takeaways: fields.keyTakeaways,
    sort_order: fields.sortOrder,
  };
}

export async function createLesson(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const fields = readFields(formData);

  const idError = validateSlugId(id);
  if (idError) return { error: idError };
  if (!fields.title) return { error: "Title is required." };

  const { error } = await supabase
    .from("lessons")
    .insert({ id, ...toRow(fields) });

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${fields.moduleId}/lessons`);
  revalidatePath("/");
  redirect(`/admin/modules/${fields.moduleId}/lessons`);
}

export async function updateLesson(
  oldId: string,
  newId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const idError = validateSlugId(newId);
  if (idError) return { error: idError };

  const supabase = await createClient();
  const fields = readFields(formData);

  if (!fields.title) return { error: "Title is required." };

  const { error } = await supabase
    .from("lessons")
    .update({ id: newId, ...toRow(fields) })
    .eq("id", oldId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/modules/${fields.moduleId}/lessons`);
  revalidatePath("/");
  redirect(`/admin/modules/${fields.moduleId}/lessons`);
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
