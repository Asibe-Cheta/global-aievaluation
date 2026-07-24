"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminAnnotationMediaItem } from "@/lib/admin/queries";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SECONDS = 10;
const BUCKET = "annotation-media";

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadMedia(
  supabase: SupabaseServerClient,
  taskId: string,
  file: File,
): Promise<AdminAnnotationMediaItem> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large (max 20MB).`);
  }

  const path = `${taskId}/${Date.now()}-${slugFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function replaceMedia(
  supabase: SupabaseServerClient,
  taskId: string,
  file: File,
  previous: AdminAnnotationMediaItem | undefined,
): Promise<AdminAnnotationMediaItem> {
  const uploaded = await uploadMedia(supabase, taskId, file);
  if (previous?.path) {
    await supabase.storage.from(BUCKET).remove([previous.path]);
  }
  return uploaded;
}

function readFile(formData: FormData, key: string): File | null {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

export interface AnnotationTaskFormFields {
  moduleId: string;
  type: "image_pair" | "video" | "audio";
  title: string;
  instructions: string | null;
  sortOrder: number;
  scenario: string | null;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string | null;
  reviewerNotes: string | null;
}

function readFields(formData: FormData): AnnotationTaskFormFields {
  return {
    moduleId: String(formData.get("moduleId") ?? ""),
    type: String(formData.get("type") ?? "image_pair") as
      | "image_pair"
      | "video"
      | "audio",
    title: String(formData.get("title") ?? ""),
    instructions: String(formData.get("instructions") ?? "") || null,
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    scenario: String(formData.get("scenario") ?? "") || null,
    question: String(formData.get("question") ?? ""),
    options: JSON.parse(String(formData.get("options") ?? "[]")),
    correctOptionIndex: Number(formData.get("correctOptionIndex") ?? 0) || 0,
    explanation: String(formData.get("explanation") ?? "") || null,
    reviewerNotes: String(formData.get("reviewerNotes") ?? "") || null,
  };
}

async function uploadNewMedia(
  supabase: SupabaseServerClient,
  id: string,
  fields: AnnotationTaskFormFields,
  formData: FormData,
): Promise<{ media?: AdminAnnotationMediaItem[]; error?: string }> {
  if (fields.type === "image_pair") {
    const image1 = readFile(formData, "image1");
    const image2 = readFile(formData, "image2");
    if (!image1 || !image2) {
      return { error: "Both images are required for an image pair task." };
    }
    return {
      media: [
        await uploadMedia(supabase, id, image1),
        await uploadMedia(supabase, id, image2),
      ],
    };
  }

  if (fields.type === "video") {
    const video = readFile(formData, "video");
    if (!video) return { error: "A video file is required." };

    const durationRaw = formData.get("videoDurationSeconds");
    const durationSeconds = durationRaw ? Number(durationRaw) : undefined;
    if (durationSeconds && durationSeconds > MAX_VIDEO_SECONDS) {
      return {
        error: `Video must be ${MAX_VIDEO_SECONDS}s or less (got ${durationSeconds.toFixed(1)}s).`,
      };
    }

    const uploaded = await uploadMedia(supabase, id, video);
    return { media: [{ ...uploaded, durationSeconds }] };
  }

  // audio
  const audio = readFile(formData, "audio");
  if (!audio) return { error: "An audio file is required." };
  return { media: [await uploadMedia(supabase, id, audio)] };
}

export async function createAnnotationTask(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "").trim();
  const fields = readFields(formData);

  if (!id) return { error: "Slug/ID is required." };
  if (!fields.title) return { error: "Title is required." };
  if (!fields.question) return { error: "Question is required." };
  if (fields.options.length < 2) return { error: "At least 2 options are required." };

  let media: AdminAnnotationMediaItem[];
  try {
    const result = await uploadNewMedia(supabase, id, fields, formData);
    if (result.error || !result.media) return { error: result.error };
    media = result.media;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase.from("annotation_tasks").insert({
    id,
    module_id: fields.moduleId,
    type: fields.type,
    title: fields.title,
    instructions: fields.instructions,
    media,
    scenario: fields.scenario,
    question: fields.question,
    options: fields.options,
    correct_option_index: fields.correctOptionIndex,
    explanation: fields.explanation,
    reviewer_notes: fields.reviewerNotes,
    sort_order: fields.sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/annotation-tasks");
  revalidatePath("/");
  redirect("/admin/annotation-tasks");
}

export async function updateAnnotationTask(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const fields = readFields(formData);
  const existingMedia: AdminAnnotationMediaItem[] = JSON.parse(
    String(formData.get("existingMedia") ?? "[]"),
  );

  if (!fields.title) return { error: "Title is required." };
  if (!fields.question) return { error: "Question is required." };
  if (fields.options.length < 2) return { error: "At least 2 options are required." };

  let media: AdminAnnotationMediaItem[];
  try {
    if (fields.type === "image_pair") {
      const image1 = readFile(formData, "image1");
      const image2 = readFile(formData, "image2");
      const slot1 = image1
        ? await replaceMedia(supabase, id, image1, existingMedia[0])
        : existingMedia[0];
      const slot2 = image2
        ? await replaceMedia(supabase, id, image2, existingMedia[1])
        : existingMedia[1];
      if (!slot1 || !slot2) {
        return { error: "Both images are required for an image pair task." };
      }
      media = [slot1, slot2];
    } else if (fields.type === "video") {
      const video = readFile(formData, "video");
      const durationRaw = formData.get("videoDurationSeconds");
      const durationSeconds = durationRaw
        ? Number(durationRaw)
        : existingMedia[0]?.durationSeconds;
      if (durationSeconds && durationSeconds > MAX_VIDEO_SECONDS) {
        return {
          error: `Video must be ${MAX_VIDEO_SECONDS}s or less (got ${durationSeconds.toFixed(1)}s).`,
        };
      }
      const slot = video
        ? await replaceMedia(supabase, id, video, existingMedia[0])
        : existingMedia[0];
      if (!slot) return { error: "A video file is required." };
      media = [{ ...slot, durationSeconds }];
    } else {
      const audio = readFile(formData, "audio");
      const slot = audio
        ? await replaceMedia(supabase, id, audio, existingMedia[0])
        : existingMedia[0];
      if (!slot) return { error: "An audio file is required." };
      media = [slot];
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("annotation_tasks")
    .update({
      module_id: fields.moduleId,
      type: fields.type,
      title: fields.title,
      instructions: fields.instructions,
      media,
      scenario: fields.scenario,
      question: fields.question,
      options: fields.options,
      correct_option_index: fields.correctOptionIndex,
      explanation: fields.explanation,
      reviewer_notes: fields.reviewerNotes,
      sort_order: fields.sortOrder,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/annotation-tasks");
  revalidatePath("/");
  redirect("/admin/annotation-tasks");
}

export async function deleteAnnotationTask(
  id: string,
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("annotation_tasks")
    .select("media")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("annotation_tasks").delete().eq("id", id);
  if (error) return { error: error.message };

  const paths = ((existing?.media ?? []) as AdminAnnotationMediaItem[])
    .map((m) => m.path)
    .filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  revalidatePath("/admin/annotation-tasks");
  revalidatePath("/");
  return {};
}
