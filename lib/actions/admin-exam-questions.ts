"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminCaseStudyMediaItem } from "@/lib/admin/queries";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
const BUCKET = "exam-media";

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadClip(
  supabase: SupabaseServerClient,
  questionId: string,
  type: "video" | "audio",
  file: File,
): Promise<AdminCaseStudyMediaItem> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large (max 20MB).`);
  }

  const path = `${questionId}/${type}-${Date.now()}-${slugFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { type, path, url: data.publicUrl };
}

function readFields(formData: FormData) {
  return {
    moduleId: String(formData.get("moduleId") ?? ""),
    type: String(formData.get("type") ?? "mcq") as "mcq" | "tf" | "scenario",
    category: String(formData.get("category") ?? ""),
    question: String(formData.get("question") ?? ""),
    options: JSON.parse(String(formData.get("options") ?? "[]")),
    correctOptionIndex: Number(formData.get("correctOptionIndex") ?? 0) || 0,
    explanation: String(formData.get("explanation") ?? ""),
    part: String(formData.get("part") ?? ""),
    scenario: String(formData.get("scenario") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

function toRow(fields: ReturnType<typeof readFields>, media: AdminCaseStudyMediaItem[]) {
  return {
    module_id: fields.moduleId,
    type: fields.type,
    category: fields.category,
    question: fields.question || null,
    options: fields.options,
    correct_option_index: fields.correctOptionIndex,
    explanation: fields.explanation || null,
    part: fields.part || null,
    scenario: fields.scenario || null,
    media,
    sort_order: fields.sortOrder,
  };
}

async function resolveMedia(
  supabase: SupabaseServerClient,
  id: string,
  formData: FormData,
  existingMedia: AdminCaseStudyMediaItem[],
): Promise<AdminCaseStudyMediaItem[]> {
  const removeExisting = formData.get("removeMedia") === "true";
  const videoFile = formData.get("mediaVideo");
  const audioFile = formData.get("mediaAudio");

  if (videoFile instanceof File && videoFile.size > 0) {
    if (existingMedia[0]?.path) {
      await supabase.storage.from(BUCKET).remove([existingMedia[0].path]);
    }
    return [await uploadClip(supabase, id, "video", videoFile)];
  }
  if (audioFile instanceof File && audioFile.size > 0) {
    if (existingMedia[0]?.path) {
      await supabase.storage.from(BUCKET).remove([existingMedia[0].path]);
    }
    return [await uploadClip(supabase, id, "audio", audioFile)];
  }
  if (removeExisting) {
    if (existingMedia[0]?.path) {
      await supabase.storage.from(BUCKET).remove([existingMedia[0].path]);
    }
    return [];
  }
  return existingMedia;
}

export async function createExamQuestion(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const fields = readFields(formData);

  if (!id) return { error: "Slug/ID is required." };

  let media: AdminCaseStudyMediaItem[];
  try {
    media = await resolveMedia(supabase, id, formData, []);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("exam_questions")
    .insert({ id, ...toRow(fields, media) });

  if (error) return { error: error.message };

  revalidatePath("/admin/exam-questions");
  revalidatePath("/");
  redirect("/admin/exam-questions");
}

export async function updateExamQuestion(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const fields = readFields(formData);
  const existingMedia: AdminCaseStudyMediaItem[] = JSON.parse(
    String(formData.get("existingMedia") ?? "[]"),
  );

  let media: AdminCaseStudyMediaItem[];
  try {
    media = await resolveMedia(supabase, id, formData, existingMedia);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("exam_questions")
    .update(toRow(fields, media))
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

  const { data: existing } = await supabase
    .from("exam_questions")
    .select("media")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("exam_questions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  const paths = ((existing?.media ?? []) as AdminCaseStudyMediaItem[])
    .map((m) => m.path)
    .filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  revalidatePath("/admin/exam-questions");
  revalidatePath("/");
  return {};
}
