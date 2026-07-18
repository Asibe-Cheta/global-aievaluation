"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  createAchievement,
  updateAchievement,
  type AchievementFormInput,
} from "@/lib/actions/admin-achievements";
import type { AdminAchievementRow } from "@/lib/admin/queries";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";

export default function AchievementForm({
  achievement,
}: {
  achievement?: AdminAchievementRow;
}) {
  const router = useRouter();
  const isEdit = !!achievement;

  const [id, setId] = useState(achievement?.id ?? "");
  const [title, setTitle] = useState(achievement?.title ?? "");
  const [description, setDescription] = useState(achievement?.description ?? "");
  const [icon, setIcon] = useState(achievement?.icon ?? "");
  const [reqMetric, setReqMetric] = useState(achievement?.req_metric ?? "");
  const [sortOrder, setSortOrder] = useState(String(achievement?.sort_order ?? 0));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const input: AchievementFormInput = {
      title,
      description,
      icon,
      reqMetric,
      sortOrder: Number(sortOrder) || 0,
    };

    const result = isEdit
      ? await updateAchievement(achievement!.id, input)
      : await createAchievement(id, input);

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
            placeholder="e.g. ach_7"
            disabled={isEdit}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Icon (emoji)</label>
          <input
            className={inputClass}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🌱"
          />
        </div>
        <div>
          <label className={labelClass}>Requirement Metric</label>
          <input
            className={inputClass}
            value={reqMetric}
            onChange={(e) => setReqMetric(e.target.value)}
            placeholder="lessons:1, simulations:1, exams:1, score:100, streak:3"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          {isEdit ? "Save Changes" : "Create Achievement"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/achievements")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
