import { createClient } from "@supabase/supabase-js";
import { MODULE_CURRICULUM, ALL_ACHIEVEMENTS } from "../data/modules";
import { DEFAULT_JOBS } from "../data/jobs";
import { LESSON_SKILL_BOOSTS, MODULE_SIM_SKILL_BOOSTS } from "../data/skill-boosts";

// One-off script: seeds the Supabase database from the existing mock
// content in data/modules.ts and data/jobs.ts. Run with `npm run seed`
// after applying supabase/migrations/0001_init.sql. Requires
// NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local
// (never commit the secret key).
//
// WARNING: once content is editable via the admin dashboard, re-running
// this script will overwrite any admin edits to existing rows (it's an
// upsert keyed by id) back to these static defaults. Safe to re-run only
// for genuinely new rows or one-off backfills — not as routine maintenance.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Add them to .env.local before running the seed script.",
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false },
});

async function seedModules() {
  const rows = MODULE_CURRICULUM.map((m, index) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    simulation_intro: m.simulationIntro,
    sim_skill_boosts: MODULE_SIM_SKILL_BOOSTS[m.id] ?? {},
    sort_order: index,
  }));

  const { error } = await supabase.from("modules").upsert(rows);
  if (error) throw new Error(`modules: ${error.message}`);
  console.log(`Seeded ${rows.length} modules`);
}

async function seedLessons() {
  const rows = MODULE_CURRICULUM.flatMap((m) =>
    m.lessons.map((l, index) => ({
      id: l.id,
      module_id: m.id,
      title: l.title,
      description: l.description ?? null,
      duration: l.duration,
      objectives: l.objectives,
      content: l.content,
      mini_case_studies: l.miniCaseStudies,
      reflection_questions: l.reflectionQuestions,
      key_takeaways: l.keyTakeaways,
      skill_boosts: LESSON_SKILL_BOOSTS[l.id] ?? {},
      sort_order: index,
    })),
  );

  const { error } = await supabase.from("lessons").upsert(rows);
  if (error) throw new Error(`lessons: ${error.message}`);
  console.log(`Seeded ${rows.length} lessons`);
}

async function seedAchievements() {
  const rows = ALL_ACHIEVEMENTS.map((a, index) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    req_metric: a.reqMetric,
    sort_order: index,
  }));

  const { error } = await supabase.from("achievements").upsert(rows);
  if (error) throw new Error(`achievements: ${error.message}`);
  console.log(`Seeded ${rows.length} achievements`);
}

async function seedJobs() {
  const rows = DEFAULT_JOBS.map((j, index) => ({
    id: j.id,
    title: j.title,
    pay_rate: j.payRate,
    referral_reward: j.referralReward,
    badge: j.badge ?? null,
    hired_text: j.hiredText ?? null,
    category: j.category,
    field: j.field,
    avatars: j.avatars ?? [],
    required_lesson_id: j.requiredLessonId ?? null,
    required_lesson_name: j.requiredLessonName ?? null,
    description: j.description,
    skills_needed: j.skillsNeeded,
    sort_order: index,
  }));

  const { error } = await supabase.from("jobs").upsert(rows);
  if (error) throw new Error(`jobs: ${error.message}`);
  console.log(`Seeded ${rows.length} jobs`);
}

async function main() {
  // modules first: lessons reference module_id. Practice tasks are
  // admin-authored content living only in the DB now — see
  // scripts/migrate-practice-tasks.ts for the one-off migration from the
  // old exam_questions/annotation_tasks tables.
  await seedModules();
  await seedLessons();
  await seedAchievements();
  await seedJobs();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
