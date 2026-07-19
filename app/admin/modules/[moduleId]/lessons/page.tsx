import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { getAdminLessons, getAdminModule } from "@/lib/admin/queries";
import { deleteLesson } from "@/lib/actions/admin-lessons";
import DeleteButton from "../../../DeleteButton";

export default async function LessonsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const [lessons, mod] = await Promise.all([
    getAdminLessons(moduleId),
    getAdminModule(moduleId),
  ]);

  async function boundDelete(id: string) {
    "use server";
    return deleteLesson(id, moduleId);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/modules"
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Modules
      </Link>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Lessons — {mod?.title ?? moduleId}
        </h2>
        <Link
          href={`/admin/modules/${moduleId}/lessons/new`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Lesson
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {lessons.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {l.title}
                  <div className="text-slate-400 font-normal">{l.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.duration}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.sort_order}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/modules/${moduleId}/lessons/${l.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={l.id} action={boundDelete} label={l.title} />
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No lessons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
