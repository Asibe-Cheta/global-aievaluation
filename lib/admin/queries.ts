import { createClient } from "@/lib/supabase/server";
import { normalizeContentBlocks } from "@/lib/content-blocks";

export interface AdminJobRow {
  id: string;
  title: string;
  pay_rate: string | null;
  pay_rate_min_cents: number | null;
  referral_reward: string | null;
  badge: string | null;
  hired_text: string | null;
  category: "project-based" | "one-time" | "talent-network" | null;
  field: string;
  avatars: string[];
  required_lesson_id: string | null;
  required_lesson_name: string | null;
  description: string | null;
  skills_needed: string[];
  application_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface AdminModuleRow {
  id: string;
  title: string;
  description: string | null;
  simulation_intro: { scenario: string; objective: string } | null;
  sim_skill_boosts: Record<string, number>;
  sort_order: number;
}

export interface AdminSimulationTaskRow {
  id: string;
  module_id: string;
  type: string | null;
  title: string | null;
  prompt: string | null;
  responses: { letter: string; text: string }[] | null;
  response_single: string | null;
  response: string | null;
  options: string[];
  correct_option_index: number | null;
  ideal_justification_keywords: string[];
  rubric: string | null;
  explanation: string | null;
  ideal_rating: number | null;
  ideal_flags: { hallucination: boolean; safety: boolean; formatting: boolean } | null;
  category: string | null;
  sort_order: number;
}

export interface AdminExamQuestionRow {
  id: string;
  module_id: string;
  type: string | null;
  category: string | null;
  question: string | null;
  options: string[];
  correct_option_index: number | null;
  explanation: string | null;
  part: string | null;
  scenario: string | null;
  media: AdminCaseStudyMediaItem[];
  sort_order: number;
}

export interface AdminCaseStudyMediaItem {
  type: "image" | "video" | "audio";
  path: string;
  url: string;
  durationSeconds?: number;
}

export interface AdminMiniCaseStudy {
  id: string;
  scenario: string;
  prompt: string;
  response: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  reviewerNotes?: string;
  media?: AdminCaseStudyMediaItem[];
}

export interface AdminContentBlock {
  id: string;
  text: string;
  media?: AdminCaseStudyMediaItem[]; // at most 1 attachment per block
}

export interface AdminLessonRow {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  duration: string | null;
  objectives: string[];
  content: AdminContentBlock[];
  mini_case_studies: AdminMiniCaseStudy[];
  reflection_questions: string[];
  key_takeaways: string[];
  skill_boosts: Record<string, number>;
  sort_order: number;
}

export async function getAdminJobs(): Promise<AdminJobRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getAdminJobs: ${error.message}`);
  return data ?? [];
}

export async function getAdminJob(id: string): Promise<AdminJobRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminJob: ${error.message}`);
  return data;
}

export async function getAdminModules(): Promise<AdminModuleRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getAdminModules: ${error.message}`);
  return data ?? [];
}

export async function getAdminModule(
  id: string,
): Promise<AdminModuleRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminModule: ${error.message}`);
  return data;
}

export async function getAdminSimulationTasks(
  moduleId: string,
): Promise<AdminSimulationTaskRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("simulation_tasks")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order");

  if (error) throw new Error(`getAdminSimulationTasks: ${error.message}`);
  return data ?? [];
}

export async function getAdminSimulationTask(
  id: string,
): Promise<AdminSimulationTaskRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("simulation_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminSimulationTask: ${error.message}`);
  return data;
}

export async function getAdminExamQuestions(
  moduleId: string,
): Promise<AdminExamQuestionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order");

  if (error) throw new Error(`getAdminExamQuestions: ${error.message}`);
  return data ?? [];
}

export async function getAllAdminExamQuestions(): Promise<AdminExamQuestionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_questions")
    .select("*")
    .order("module_id")
    .order("sort_order");

  if (error) throw new Error(`getAllAdminExamQuestions: ${error.message}`);
  return data ?? [];
}

export async function getAdminExamQuestion(
  id: string,
): Promise<AdminExamQuestionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminExamQuestion: ${error.message}`);
  return data;
}

export async function getAdminLessons(
  moduleId: string,
): Promise<AdminLessonRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order")
    .order("created_at");

  if (error) throw new Error(`getAdminLessons: ${error.message}`);
  return (data ?? []).map((row) => ({
    ...row,
    content: normalizeContentBlocks(row.content),
  }));
}

export async function getAdminLesson(
  id: string,
): Promise<AdminLessonRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminLesson: ${error.message}`);
  if (!data) return null;
  return { ...data, content: normalizeContentBlocks(data.content) };
}

export interface AdminAnnotationMediaItem {
  path: string;
  url: string;
  durationSeconds?: number;
}

export interface AdminAnnotationTaskRow {
  id: string;
  module_id: string;
  type: "image_pair" | "video" | "audio";
  title: string;
  instructions: string | null;
  media: AdminAnnotationMediaItem[];
  scenario: string | null;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string | null;
  reviewer_notes: string | null;
  sort_order: number;
}

export async function getAdminAnnotationTasks(
  moduleId: string,
): Promise<AdminAnnotationTaskRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annotation_tasks")
    .select("*")
    .eq("module_id", moduleId)
    .order("sort_order");

  if (error) throw new Error(`getAdminAnnotationTasks: ${error.message}`);
  return data ?? [];
}

export async function getAdminAnnotationTask(
  id: string,
): Promise<AdminAnnotationTaskRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annotation_tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminAnnotationTask: ${error.message}`);
  return data;
}

export async function getAllAdminAnnotationTasks(): Promise<AdminAnnotationTaskRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("annotation_tasks")
    .select("*")
    .order("module_id")
    .order("sort_order");

  if (error) throw new Error(`getAllAdminAnnotationTasks: ${error.message}`);
  return data ?? [];
}

export interface AdminTestimonialRow {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  rating: number | null;
  is_active: boolean;
  sort_order: number;
}

export async function getAdminTestimonials(): Promise<AdminTestimonialRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(`getAdminTestimonials: ${error.message}`);
  return data ?? [];
}

export async function getAdminTestimonial(
  id: string,
): Promise<AdminTestimonialRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminTestimonial: ${error.message}`);
  return data;
}
