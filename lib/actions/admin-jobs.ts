"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface JobFormInput {
  title: string;
  payRate: string;
  payRateMinCents: number | null;
  field: string;
  description: string;
  skillsNeeded: string; // comma-separated in the form, split into an array here
  applicationUrl: string;
  isActive: boolean;
  sortOrder: number;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toRow(input: JobFormInput) {
  return {
    title: input.title,
    pay_rate: input.payRate || null,
    pay_rate_min_cents: input.payRateMinCents,
    field: input.field,
    description: input.description || null,
    skills_needed: splitList(input.skillsNeeded),
    application_url: input.applicationUrl,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

export async function createJob(
  id: string,
  input: JobFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function updateJob(
  oldId: string,
  newId: string,
  input: JobFormInput,
): Promise<{ error?: string }> {
  if (!newId.trim()) return { error: "Slug/ID is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("jobs")
    .update({ id: newId, ...toRow(input) })
    .eq("id", oldId);

  if (error) return { error: error.message };

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function deleteJob(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  return {};
}
