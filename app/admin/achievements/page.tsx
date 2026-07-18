import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminAchievements } from "@/lib/admin/queries";
import DeleteButton from "../DeleteButton";
import { deleteAchievement } from "@/lib/actions/admin-achievements";

export default async function AdminAchievementsPage() {
  const achievements = await getAdminAchievements();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Achievements
        </h2>
        <Link
          href="/admin/achievements/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Achievement
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Icon</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Requirement</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {achievements.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-lg">{a.icon}</td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {a.title}
                  <div className="text-slate-400 font-normal">{a.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">
                  {a.req_metric}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {a.sort_order}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/achievements/${a.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={a.id} action={deleteAchievement} label={a.title} />
                </td>
              </tr>
            ))}
            {achievements.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No achievements yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
