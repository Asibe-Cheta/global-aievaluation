import AchievementForm from "../AchievementForm";

export default function NewAchievementPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        New Achievement
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <AchievementForm />
      </div>
    </div>
  );
}
