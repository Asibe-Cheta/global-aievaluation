"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { createJob, updateJob, type JobFormInput } from "@/lib/actions/admin-jobs";
import type { AdminJobRow } from "@/lib/admin/queries";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500";
const labelClass =
  "text-xs text-slate-455 font-bold uppercase tracking-wider block mb-1.5";

export default function JobForm({ job }: { job?: AdminJobRow }) {
  const router = useRouter();
  const isEdit = !!job;

  const [id, setId] = useState(job?.id ?? "");
  const [title, setTitle] = useState(job?.title ?? "");
  const [payRate, setPayRate] = useState(job?.pay_rate ?? "");
  const [payRateMinCents, setPayRateMinCents] = useState<string>(
    job?.pay_rate_min_cents != null ? String(job.pay_rate_min_cents) : "",
  );
  const [referralReward, setReferralReward] = useState(job?.referral_reward ?? "");
  const [badge, setBadge] = useState(job?.badge ?? "");
  const [hiredText, setHiredText] = useState(job?.hired_text ?? "");
  const [category, setCategory] = useState<JobFormInput["category"]>(
    job?.category ?? "project-based",
  );
  const [field, setField] = useState(job?.field ?? "");
  const [avatars, setAvatars] = useState((job?.avatars ?? []).join(", "));
  const [requiredLessonId, setRequiredLessonId] = useState(job?.required_lesson_id ?? "");
  const [requiredLessonName, setRequiredLessonName] = useState(job?.required_lesson_name ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [skillsNeeded, setSkillsNeeded] = useState((job?.skills_needed ?? []).join(", "));
  const [applicationUrl, setApplicationUrl] = useState(
    job?.application_url ?? "https://outlier.ai/?ref=academy",
  );
  const [isActive, setIsActive] = useState(job?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(String(job?.sort_order ?? 0));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const input: JobFormInput = {
      title,
      payRate,
      payRateMinCents: payRateMinCents ? Number(payRateMinCents) : null,
      referralReward,
      badge,
      hiredText,
      category,
      field,
      avatars,
      requiredLessonId,
      requiredLessonName,
      description,
      skillsNeeded,
      applicationUrl,
      isActive,
      sortOrder: Number(sortOrder) || 0,
    };

    const result = isEdit
      ? await updateJob(job!.id, input)
      : await createJob(id, input);

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
            placeholder="e.g. generalist-expert"
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
          <label className={labelClass}>Pay Rate (display)</label>
          <input
            className={inputClass}
            value={payRate}
            onChange={(e) => setPayRate(e.target.value)}
            placeholder="$70 / hour"
          />
        </div>
        <div>
          <label className={labelClass}>Pay Rate Min (cents, for sorting)</label>
          <input
            type="number"
            className={inputClass}
            value={payRateMinCents}
            onChange={(e) => setPayRateMinCents(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Referral Reward</label>
          <input
            className={inputClass}
            value={referralReward}
            onChange={(e) => setReferralReward(e.target.value)}
            placeholder="$280"
          />
        </div>
        <div>
          <label className={labelClass}>Badge (optional)</label>
          <input
            className={inputClass}
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="1-click apply"
          />
        </div>

        <div>
          <label className={labelClass}>Hired Text (optional)</label>
          <input
            className={inputClass}
            value={hiredText}
            onChange={(e) => setHiredText(e.target.value)}
            placeholder="98 hired this month"
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value as JobFormInput["category"])}
          >
            <option value="project-based">project-based</option>
            <option value="one-time">one-time</option>
            <option value="talent-network">talent-network</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Field</label>
          <input
            className={inputClass}
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="Generalist, AI Safety, Coding & SWE, ..."
            required
          />
        </div>
        <div>
          <label className={labelClass}>Avatars (comma-separated initials)</label>
          <input
            className={inputClass}
            value={avatars}
            onChange={(e) => setAvatars(e.target.value)}
            placeholder="F, A, P"
          />
        </div>

        <div>
          <label className={labelClass}>Required Lesson ID (optional)</label>
          <input
            className={inputClass}
            value={requiredLessonId}
            onChange={(e) => setRequiredLessonId(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Required Lesson Name (optional)</label>
          <input
            className={inputClass}
            value={requiredLessonName}
            onChange={(e) => setRequiredLessonName(e.target.value)}
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

        <div className="sm:col-span-2">
          <label className={labelClass}>Skills Needed (comma-separated)</label>
          <input
            className={inputClass}
            value={skillsNeeded}
            onChange={(e) => setSkillsNeeded(e.target.value)}
            placeholder="Logical Reasoning, Fact-Checking, ..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Application URL</label>
          <input
            className={inputClass}
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            required
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
            Active (visible on the public Jobs page)
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
          {isEdit ? "Save Changes" : "Create Job"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/jobs")}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
