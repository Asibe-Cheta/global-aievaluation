"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET = "testimonial-media";

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

async function uploadAvatar(
  supabase: SupabaseServerClient,
  id: string,
  file: File,
): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large (max 5MB).`);
  }

  const path = `${id}/${Date.now()}-${slugFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function readFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    quote: String(formData.get("quote") ?? ""),
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    rating: formData.get("rating") ? Number(formData.get("rating")) : null,
    isActive: formData.get("isActive") === "true",
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };
}

function readFile(formData: FormData, key: string): File | null {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

export async function createTestimonial(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const fields = readFields(formData);

  if (!fields.name) return { error: "Name is required." };
  if (!fields.quote) return { error: "Quote is required." };

  let avatarUrl = fields.avatarUrl || null;
  const image = readFile(formData, "avatarImage");
  if (image) {
    try {
      avatarUrl = await uploadAvatar(supabase, id, image);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Upload failed." };
    }
  }

  const { error } = await supabase.from("testimonials").insert({
    id,
    name: fields.name,
    role: fields.role || null,
    quote: fields.quote,
    avatar_url: avatarUrl,
    rating: fields.rating,
    is_active: fields.isActive,
    sort_order: fields.sortOrder,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function updateTestimonial(
  oldId: string,
  newId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  if (!newId.trim()) return { error: "Slug/ID is required." };

  const supabase = await createClient();
  const fields = readFields(formData);

  if (!fields.name) return { error: "Name is required." };
  if (!fields.quote) return { error: "Quote is required." };

  let avatarUrl = fields.avatarUrl || null;
  const image = readFile(formData, "avatarImage");
  if (image) {
    try {
      avatarUrl = await uploadAvatar(supabase, newId, image);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Upload failed." };
    }
  }

  const { error } = await supabase
    .from("testimonials")
    .update({
      id: newId,
      name: fields.name,
      role: fields.role || null,
      quote: fields.quote,
      avatar_url: avatarUrl,
      rating: fields.rating,
      is_active: fields.isActive,
      sort_order: fields.sortOrder,
    })
    .eq("id", oldId);

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
