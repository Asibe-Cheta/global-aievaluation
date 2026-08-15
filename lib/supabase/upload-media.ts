import { createClient } from "./client";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

function slugFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export interface UploadedMedia {
  type: "image" | "video" | "audio";
  path: string;
  url: string;
}

// Uploads straight from the browser to Supabase Storage instead of through a
// "use server" action. Video/audio clips (and sometimes large screenshots)
// routinely exceed Vercel's serverless function request-body limit
// (~4.5MB) — well under the app's own 20MB cap — so sending them through a
// server action's FormData reliably 413'd before the request ever reached
// our own size check. The buckets already carry admin-only write policies
// (is_admin()), so an authenticated admin session can write here directly.
export async function uploadMediaClip(
  bucket: string,
  pathPrefix: string,
  type: "image" | "video" | "audio",
  file: File,
): Promise<UploadedMedia> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`${file.name} is too large (max 20MB).`);
  }

  const supabase = createClient();
  const path = `${pathPrefix}/${type}-${Date.now()}-${slugFileName(file.name)}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { type, path, url: data.publicUrl };
}

// Best-effort cleanup when an admin removes a clip they just uploaded (or an
// existing one) — not awaited-and-blocking anywhere that matters, so a
// failure here never blocks the actual form save.
export async function removeMediaClip(bucket: string, path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(bucket).remove([path]);
}
