"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Upload } from "lucide-react";
import {
  createTestimonial,
  updateTestimonial,
} from "@/lib/actions/admin-testimonials";
import type { AdminTestimonialRow } from "@/lib/admin/queries";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";

export default function TestimonialForm({
  testimonial,
}: {
  testimonial?: AdminTestimonialRow;
}) {
  const router = useRouter();
  const isEdit = !!testimonial;

  const [id, setId] = useState(testimonial?.id ?? "");
  const [name, setName] = useState(testimonial?.name ?? "");
  const [role, setRole] = useState(testimonial?.role ?? "");
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [avatarUrl, setAvatarUrl] = useState(testimonial?.avatar_url ?? "");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [rating, setRating] = useState(String(testimonial?.rating ?? 5));
  const [isActive, setIsActive] = useState(testimonial?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(String(testimonial?.sort_order ?? 0));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("role", role);
    formData.set("quote", quote);
    formData.set("avatarUrl", avatarUrl);
    formData.set("rating", rating);
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", sortOrder);
    if (avatarImage) formData.set("avatarImage", avatarImage);

    const result = isEdit
      ? await updateTestimonial(testimonial!.id, formData)
      : await createTestimonial(id, formData);

    setIsSubmitting(false);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Slug / ID</label>
          <input
            className={inputClass}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="e.g. testimonial-1"
            disabled={isEdit}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Role / Title (optional)</label>
          <input
            className={inputClass}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Outlier Qualified, Remote AI Evaluator"
          />
        </div>
        <div>
          <label className={labelClass}>Photo</label>
          {(avatarImage || avatarUrl) && (
            <img
              src={avatarImage ? URL.createObjectURL(avatarImage) : avatarUrl}
              alt="Preview"
              className="w-12 h-12 rounded-full object-cover mb-2"
            />
          )}
          <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline mb-2">
            <Upload className="w-3.5 h-3.5" />
            {avatarUrl || avatarImage ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarImage(e.target.files?.[0] ?? null)}
            />
          </label>
          <input
            className={inputClass}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="...or paste an image URL"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Quote</label>
          <textarea
            className={inputClass}
            rows={3}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Rating (1-5, optional)</label>
          <input
            type="number"
            min={1}
            max={5}
            className={inputClass}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input
            type="number"
            className={inputClass}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="is-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="is-active" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Active (visible on the public site)
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-850">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Create Testimonial"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/testimonials")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
