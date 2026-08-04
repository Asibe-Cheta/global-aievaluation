// Every admin-editable content table (modules, lessons, simulation_tasks,
// annotation_tasks, exam_questions, jobs, testimonials) uses a manually
// typed `id text primary key`. These ids get embedded directly into URL
// path segments (e.g. /admin/modules/[moduleId]/lessons/[lessonId]) — a
// raw space or other unsafe character saves into Postgres just fine but
// then breaks navigation to that record's own edit page. Enforce the
// convention every admin form's placeholder already suggests ("m1_l7"):
// letters, numbers, underscores and hyphens only.
const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateSlugId(id: string): string | null {
  const trimmed = id.trim();
  if (!trimmed) return "Slug/ID is required.";
  if (trimmed !== id) return "Slug/ID can't have leading or trailing whitespace.";
  if (!SLUG_PATTERN.test(trimmed)) {
    return "Slug/ID can only contain letters, numbers, underscores and hyphens (no spaces or other characters).";
  }
  return null;
}
