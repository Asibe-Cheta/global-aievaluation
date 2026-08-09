"use server";

import { createClient } from "@/lib/supabase/server";

export interface SavedCvProfile {
  name: string;
  education: string;
  workExperience: string;
  aiExperience: string;
  programmingKnowledge: string;
  languages: string;
  remoteExperience: string;
  goals: string;
}

export async function saveCvProfile(profile: SavedCvProfile): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ saved_cv_profile: profile })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getSavedCvProfile(): Promise<SavedCvProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("saved_cv_profile")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(`getSavedCvProfile: ${error.message}`);
  return data?.saved_cv_profile ?? null;
}

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// profiles.avatar_url is a public storage URL like
// ".../storage/v1/object/public/avatars/<userId>/<file>" — pull the
// "<userId>/<file>" path back out so a replace/remove can clean up the old
// object. Returns null for anything that isn't one of our own avatar URLs
// (e.g. the legacy preset-avatar ids like "avatar-1").
function avatarPathFromUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/${AVATAR_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function uploadAvatarPhoto(
  formData: FormData,
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Image is too large (max 5MB)." };
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const path = `${user.id}/${Date.now()}-${slugFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const { data: publicUrlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);
  if (updateError) return { error: updateError.message };

  const oldPath = avatarPathFromUrl(existing?.avatar_url ?? null);
  if (oldPath && oldPath !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
  }

  return { url };
}

export async function removeAvatarPhoto(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);
  if (updateError) return { error: updateError.message };

  const oldPath = avatarPathFromUrl(existing?.avatar_url ?? null);
  if (oldPath) {
    await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
  }

  return {};
}
