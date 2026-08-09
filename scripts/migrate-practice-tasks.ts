import { createClient } from "@supabase/supabase-js";

// One-off script: copies existing exam_questions and annotation_tasks rows
// into the new unified practice_tasks table (see
// supabase/migrations/0017_practice_tasks.sql). Run with
// `npm run migrate-practice-tasks` AFTER applying that migration.
// Idempotent — upserts keyed by id, safe to re-run.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Add them to .env.local before running this script.",
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false },
});

interface MediaItem {
  type: "image" | "video" | "audio";
  path: string;
  url: string;
  durationSeconds?: number;
}

function toOptions(options: string[] | null, correctIndex: number | null): Array<{ text: string; is_correct: boolean }> {
  return (options ?? []).map((text, i) => ({ text, is_correct: i === (correctIndex ?? 0) }));
}

function block(text: string | null, media: MediaItem[] = []) {
  return { text: text ?? "", media };
}

async function migrateExamQuestions() {
  const { data: rows, error } = await supabase.from("exam_questions").select("*");
  if (error) throw new Error(`exam_questions: ${error.message}`);

  const practiceRows = (rows ?? []).map((r) => ({
    id: r.id,
    module_id: r.module_id,
    task_type: "evaluation",
    category: r.category,
    sort_order: r.sort_order,
    guideline: block(r.scenario),
    item: block(null, r.media ?? []),
    response_a: block(null),
    response_b: null,
    question: r.question ?? "",
    response_mode: "choice",
    interaction_type: "judge",
    options: toOptions(r.options, r.correct_option_index),
    model_answer: null,
    explanation: r.explanation,
    reviewer_notes: null,
    timed: true,
    time_limit_seconds: null,
    failure_mode_tags: [],
  }));

  if (practiceRows.length === 0) {
    console.log("No exam_questions rows to migrate.");
    return;
  }

  const { error: upsertError } = await supabase.from("practice_tasks").upsert(practiceRows);
  if (upsertError) throw new Error(`practice_tasks (from exam_questions): ${upsertError.message}`);
  console.log(`Migrated ${practiceRows.length} exam_questions -> practice_tasks`);
}

async function migrateAnnotationTasks() {
  const { data: rows, error } = await supabase.from("annotation_tasks").select("*");
  if (error) throw new Error(`annotation_tasks: ${error.message}`);

  const practiceRows = (rows ?? []).map((r) => {
    const guidelineText = [r.instructions, r.scenario].filter(Boolean).join("\n\n");
    return {
      id: r.id,
      module_id: r.module_id,
      task_type: "annotation",
      category: null,
      sort_order: r.sort_order,
      guideline: block(guidelineText || null),
      item: block(null, r.media ?? []),
      response_a: block(null),
      response_b: null,
      question: r.question ?? "",
      response_mode: "choice_plus_written",
      interaction_type: "judge",
      options: toOptions(r.options, r.correct_option_index),
      model_answer: null,
      explanation: r.explanation,
      reviewer_notes: r.reviewer_notes,
      timed: false,
      time_limit_seconds: null,
      failure_mode_tags: [],
    };
  });

  if (practiceRows.length === 0) {
    console.log("No annotation_tasks rows to migrate.");
    return;
  }

  const { error: upsertError } = await supabase.from("practice_tasks").upsert(practiceRows);
  if (upsertError) throw new Error(`practice_tasks (from annotation_tasks): ${upsertError.message}`);
  console.log(`Migrated ${practiceRows.length} annotation_tasks -> practice_tasks`);
}

async function main() {
  await migrateExamQuestions();
  await migrateAnnotationTasks();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
