import { notFound } from "next/navigation";
import { getAdminAchievement } from "@/lib/admin/queries";
import AchievementForm from "../AchievementForm";

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const achievement = await getAdminAchievement(id);

  if (!achievement) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Achievement
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <AchievementForm achievement={achievement} />
      </div>
    </div>
  );
}
