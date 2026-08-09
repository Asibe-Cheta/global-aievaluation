"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminCaseStudyMediaItem,
  AdminPracticeTaskContentBlock,
  AdminPracticeTaskOption,
} from "@/lib/admin/queries";
import { validateSlugId } from "@/lib/admin/validateSlugId";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
const BUCKET = "exam-media";
const BLOCK_KEYS = ["guideline", "item", "response_a", "response_b"] as const;
type BlockKey = (typeof BLOCK_KEYS)[number];

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadClip(
  supabase: SupabaseServerClient,
  taskId: string,
  blockKey: string,
  type: "image" | "video" | "audio",
  file: File,
): Promise<AdminCaseStudyMediaItem> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large (max 20MB).`);
  }

  const path = `${taskId}/${blockKey}-${type}-${Date.now()}-${slugFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { type, path, url: data.publicUrl };
}

// Each content block has at most one media item. Client sends
// `${blockKey}Image` / `${blockKey}Video` / `${blockKey}Audio` files and a
// `${blockKey}RemoveMedia` flag.
async function resolveBlockMedia(
  supabase: SupabaseServerClient,
  taskId: string,
  blockKey: BlockKey,
  formData: FormData,
  existingMedia: AdminCaseStudyMediaItem[],
): Promise<AdminCaseStudyMediaItem[]> {
  const removeExisting = formData.get(`${blockKey}RemoveMedia`) === "true";

  for (const type of ["image", "video", "audio"] as const) {
    const file = formData.get(`${blockKey}${type[0].toUpperCase()}${type.slice(1)}`);
    if (file instanceof File && file.size > 0) {
      if (existingMedia[0]?.path) {
        await supabase.storage.from(BUCKET).remove([existingMedia[0].path]);
      }
      return [await uploadClip(supabase, taskId, blockKey, type, file)];
    }
  }

  if (removeExisting) {
    if (existingMedia[0]?.path) {
      await supabase.storage.from(BUCKET).remove([existingMedia[0].path]);
    }
    return [];
  }

  return existingMedia;
}

async function resolveAllBlockMedia(
  supabase: SupabaseServerClient,
  taskId: string,
  formData: FormData,
  existingBlocks: Record<BlockKey, AdminPracticeTaskContentBlock | null>,
): Promise<Record<BlockKey, AdminCaseStudyMediaItem[]>> {
  const result = {} as Record<BlockKey, AdminCaseStudyMediaItem[]>;
  for (const key of BLOCK_KEYS) {
    result[key] = await resolveBlockMedia(
      supabase,
      taskId,
      key,
      formData,
      existingBlocks[key]?.media ?? [],
    );
  }
  return result;
}

function readFields(formData: FormData) {
  const hasResponseB = formData.get("hasResponseB") === "true";
  return {
    moduleId: String(formData.get("moduleId") ?? ""),
    taskType: String(formData.get("taskType") ?? "evaluation"),
    category: String(formData.get("category") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    guidelineText: String(formData.get("guidelineText") ?? ""),
    itemText: String(formData.get("itemText") ?? ""),
    responseAText: String(formData.get("responseAText") ?? ""),
    hasResponseB,
    responseBText: String(formData.get("responseBText") ?? ""),
    question: String(formData.get("question") ?? ""),
    responseMode: String(formData.get("responseMode") ?? "choice") as
      | "choice"
      | "written"
      | "choice_plus_written",
    options: JSON.parse(String(formData.get("options") ?? "[]")) as AdminPracticeTaskOption[],
    modelAnswer: String(formData.get("modelAnswer") ?? ""),
    explanation: String(formData.get("explanation") ?? ""),
    reviewerNotes: String(formData.get("reviewerNotes") ?? ""),
    timed: formData.get("timed") === "true",
    timeLimitSeconds: formData.get("timeLimitSeconds")
      ? Number(formData.get("timeLimitSeconds")) || null
      : null,
    failureModeTags: JSON.parse(String(formData.get("failureModeTags") ?? "[]")) as string[],
  };
}

function toRow(
  fields: ReturnType<typeof readFields>,
  blockMedia: Record<BlockKey, AdminCaseStudyMediaItem[]>,
) {
  return {
    module_id: fields.moduleId,
    task_type: fields.taskType,
    category: fields.category || null,
    sort_order: fields.sortOrder,
    guideline: { text: fields.guidelineText, media: blockMedia.guideline },
    item: { text: fields.itemText, media: blockMedia.item },
    response_a: { text: fields.responseAText, media: blockMedia.response_a },
    response_b: fields.hasResponseB
      ? { text: fields.responseBText, media: blockMedia.response_b }
      : null,
    question: fields.question,
    response_mode: fields.responseMode,
    interaction_type: "judge",
    options: fields.responseMode === "written" ? [] : fields.options,
    model_answer: fields.responseMode === "choice" ? null : fields.modelAnswer || null,
    explanation: fields.explanation || null,
    reviewer_notes: fields.reviewerNotes || null,
    timed: fields.timed,
    time_limit_seconds: fields.timed ? fields.timeLimitSeconds : null,
    failure_mode_tags: fields.failureModeTags,
  };
}

export async function createPracticeTask(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const fields = readFields(formData);

  const idError = validateSlugId(id);
  if (idError) return { error: idError };
  if (!fields.question) return { error: "Question is required." };

  let blockMedia: Record<BlockKey, AdminCaseStudyMediaItem[]>;
  try {
    blockMedia = await resolveAllBlockMedia(supabase, id, formData, {
      guideline: null,
      item: null,
      response_a: null,
      response_b: null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("practice_tasks")
    .insert({ id, ...toRow(fields, blockMedia) });

  if (error) return { error: error.message };

  revalidatePath("/admin/practice-tasks");
  revalidatePath("/");
  redirect("/admin/practice-tasks");
}

export async function updatePracticeTask(
  oldId: string,
  newId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const idError = validateSlugId(newId);
  if (idError) return { error: idError };

  const supabase = await createClient();
  const fields = readFields(formData);
  if (!fields.question) return { error: "Question is required." };

  const existingBlocks = JSON.parse(
    String(formData.get("existingBlocks") ?? "{}"),
  ) as Record<BlockKey, AdminPracticeTaskContentBlock | null>;

  let blockMedia: Record<BlockKey, AdminCaseStudyMediaItem[]>;
  try {
    blockMedia = await resolveAllBlockMedia(supabase, newId, formData, existingBlocks);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  const { error } = await supabase
    .from("practice_tasks")
    .update({ id: newId, ...toRow(fields, blockMedia) })
    .eq("id", oldId);

  if (error) return { error: error.message };

  revalidatePath("/admin/practice-tasks");
  revalidatePath("/");
  redirect("/admin/practice-tasks");
}

export async function deletePracticeTask(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("practice_tasks")
    .select("guideline, item, response_a, response_b")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("practice_tasks").delete().eq("id", id);
  if (error) return { error: error.message };

  const paths = [
    existing?.guideline,
    existing?.item,
    existing?.response_a,
    existing?.response_b,
  ]
    .filter(Boolean)
    .flatMap((block: AdminPracticeTaskContentBlock) => block.media ?? [])
    .map((m: AdminCaseStudyMediaItem) => m.path)
    .filter(Boolean);

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  revalidatePath("/admin/practice-tasks");
  revalidatePath("/");
  return {};
}
