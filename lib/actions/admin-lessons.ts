"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminMiniCaseStudy, AdminCaseStudyMediaItem, AdminContentBlock } from "@/lib/admin/queries";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_CLIP_SECONDS = 10;
const MAX_PER_TYPE = 2;
const BUCKET = "lesson-media";

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadClip(
  supabase: SupabaseServerClient,
  lessonId: string,
  caseId: string,
  type: "image" | "video" | "audio",
  file: File,
): Promise<AdminCaseStudyMediaItem> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large (max 20MB).`);
  }

  const path = `${lessonId}/${caseId}/${type}-${Date.now()}-${slugFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { type, path, url: data.publicUrl };
}

async function mergeCaseStudyMedia(
  supabase: SupabaseServerClient,
  lessonId: string,
  caseStudies: AdminMiniCaseStudy[],
  formData: FormData,
): Promise<AdminMiniCaseStudy[]> {
  const result: AdminMiniCaseStudy[] = [];

  for (const cs of caseStudies) {
    const media = [...(cs.media ?? [])];
    const existingImages = media.filter((m) => m.type === "image").length;
    const existingVideos = media.filter((m) => m.type === "video").length;
    const existingAudios = media.filter((m) => m.type === "audio").length;

    let imageSlotsUsed = existingImages;
    let videoSlotsUsed = existingVideos;
    let audioSlotsUsed = existingAudios;

    for (let i = 0; i < MAX_PER_TYPE; i++) {
      const imageFile = formData.get(`case_${cs.id}_image_${i}`);
      if (imageFile instanceof File && imageFile.size > 0) {
        if (imageSlotsUsed >= MAX_PER_TYPE) {
          throw new Error(`Case study "${cs.question || cs.id}" has more than ${MAX_PER_TYPE} images.`);
        }
        media.push(await uploadClip(supabase, lessonId, cs.id, "image", imageFile));
        imageSlotsUsed++;
      }

      const videoFile = formData.get(`case_${cs.id}_video_${i}`);
      if (videoFile instanceof File && videoFile.size > 0) {
        if (videoSlotsUsed >= MAX_PER_TYPE) {
          throw new Error(`Case study "${cs.question || cs.id}" has more than ${MAX_PER_TYPE} videos.`);
        }
        media.push(await uploadClip(supabase, lessonId, cs.id, "video", videoFile));
        videoSlotsUsed++;
      }

      const audioFile = formData.get(`case_${cs.id}_audio_${i}`);
      if (audioFile instanceof File && audioFile.size > 0) {
        if (audioSlotsUsed >= MAX_PER_TYPE) {
          throw new Error(`Case study "${cs.question || cs.id}" has more than ${MAX_PER_TYPE} audio clips.`);
        }
        media.push(await uploadClip(supabase, lessonId, cs.id, "audio", audioFile));
        audioSlotsUsed++;
      }
    }

    result.push({ ...cs, media });
  }

  return result;
}

async function mergeContentBlockMedia(
  supabase: SupabaseServerClient,
  lessonId: string,
  blocks: AdminContentBlock[],
  formData: FormData,
): Promise<AdminContentBlock[]> {
  const result: AdminContentBlock[] = [];

  for (const block of blocks) {
    const media = [...(block.media ?? [])];

    for (const type of ["image", "video", "audio"] as const) {
      const file = formData.get(`content_${block.id}_${type}`);
      if (file instanceof File && file.size > 0) {
        media.length = 0;
        media.push(await uploadClip(supabase, lessonId, block.id, type, file));
      }
    }

    result.push({ ...block, media });
  }

  return result;
}

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

function toRow(
  fields: LessonFormFields,
  miniCaseStudies: AdminMiniCaseStudy[],
  content: AdminContentBlock[],
) {
  return {
    module_id: fields.moduleId,
    title: fields.title,
    description: fields.description || null,
    duration: fields.duration || null,
    objectives: fields.objectives,
    content,
    mini_case_studies: miniCaseStudies,
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

  if (!id) return { error: "Slug/ID is required." };
  if (!fields.title) return { error: "Title is required." };

  let miniCaseStudies: AdminMiniCaseStudy[];
  let content: AdminContentBlock[];
  try {
    miniCaseStudies = await mergeCaseStudyMedia(supabase, id, fields.miniCaseStudies, formData);
    content = await mergeContentBlockMedia(supabase, id, fields.content, formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("lessons")
    .insert({ id, ...toRow(fields, miniCaseStudies, content) });

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
  if (!newId.trim()) return { error: "Slug/ID is required." };

  const supabase = await createClient();
  const fields = readFields(formData);

  if (!fields.title) return { error: "Title is required." };

  let miniCaseStudies: AdminMiniCaseStudy[];
  let content: AdminContentBlock[];
  try {
    miniCaseStudies = await mergeCaseStudyMedia(supabase, newId, fields.miniCaseStudies, formData);
    content = await mergeContentBlockMedia(supabase, newId, fields.content, formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("lessons")
    .update({ id: newId, ...toRow(fields, miniCaseStudies, content) })
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
