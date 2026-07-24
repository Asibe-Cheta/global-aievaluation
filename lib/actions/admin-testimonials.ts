"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface TestimonialFormInput {
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
  rating: number | null;
  isActive: boolean;
  sortOrder: number;
}

function toRow(input: TestimonialFormInput) {
  return {
    name: input.name,
    role: input.role || null,
    quote: input.quote,
    avatar_url: input.avatarUrl || null,
    rating: input.rating,
    is_active: input.isActive,
    sort_order: input.sortOrder,
  };
}

export async function createTestimonial(
  id: string,
  input: TestimonialFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .insert({ id, ...toRow(input) });

  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function updateTestimonial(
  id: string,
  input: TestimonialFormInput,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update(toRow(input))
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return {};
}
