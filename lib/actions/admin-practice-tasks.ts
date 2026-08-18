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
import type { PracticeDomainId } from "@/lib/practice-domains";

const BUCKET = "exam-media";
const BLOCK_KEYS = ["guideline", "item", "response_a", "response_b"] as const;
type BlockKey = (typeof BLOCK_KEYS)[number];

// Each content block has at most one media item. The client already
// uploaded any new file straight to Supabase (lib/supabase/upload-media.ts
// — server actions have a request-body size limit on Vercel that video/audio
// clips routinely exceeded) and sends the result as `${blockKey}Media`
// JSON, plus a `${blockKey}RemoveMedia` flag to clear it.
function resolveBlockMedia(
  blockKey: BlockKey,
  formData: FormData,
  existingMedia: AdminCaseStudyMediaItem[],
): AdminCaseStudyMediaItem[] {
  const mediaJson = formData.get(`${blockKey}Media`);
  if (typeof mediaJson === "string" && mediaJson) {
    return [JSON.parse(mediaJson) as AdminCaseStudyMediaItem];
  }
  if (formData.get(`${blockKey}RemoveMedia`) === "true") {
    return [];
  }
  return existingMedia;
}

function resolveAllBlockMedia(
  formData: FormData,
  existingBlocks: Record<BlockKey, AdminPracticeTaskContentBlock | null>,
): Record<BlockKey, AdminCaseStudyMediaItem[]> {
  const result = {} as Record<BlockKey, AdminCaseStudyMediaItem[]>;
  for (const key of BLOCK_KEYS) {
    result[key] = resolveBlockMedia(key, formData, existingBlocks[key]?.media ?? []);
  }
  return result;
}

function readFields(formData: FormData) {
  const hasResponseB = formData.get("hasResponseB") === "true";
  return {
    moduleId: String(formData.get("moduleId") ?? ""),
    taskType: String(formData.get("taskType") ?? "evaluation"),
    category: String(formData.get("category") ?? ""),
    difficulty: String(formData.get("difficulty") ?? "beginner") as
      | "beginner"
      | "intermediate"
      | "expert",
    domain: String(formData.get("domain") ?? "generalist") as PracticeDomainId,
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
    difficulty: fields.difficulty,
    domain: fields.domain,
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

  const blockMedia = resolveAllBlockMedia(formData, {
    guideline: null,
    item: null,
    response_a: null,
    response_b: null,
  });

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

  const blockMedia = resolveAllBlockMedia(formData, existingBlocks);

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
