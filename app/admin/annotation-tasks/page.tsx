import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAdminAnnotationTasks, getAdminModules } from "@/lib/admin/queries";
import { deleteAnnotationTask } from "@/lib/actions/admin-annotation-tasks";
import DeleteButton from "../DeleteButton";

export default async function AnnotationTasksPage() {
  const [tasks, modules] = await Promise.all([
    getAllAdminAnnotationTasks(),
    getAdminModules(),
  ]);

  const moduleTitleById = new Map(modules.map((m) => [m.id, m.title]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Annotation Tasks
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            Data annotation practice (image pairs, video, audio) — pick which
            module each task belongs to when creating it.
          </p>
        </div>
        <Link
          href="/admin/annotation-tasks/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Module</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {tasks.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {t.title}
                  <div className="text-slate-400 font-normal">{t.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {moduleTitleById.get(t.module_id) ?? t.module_id}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {t.type === "image_pair" ? "Image pair" : t.type === "video" ? "Video" : "Audio"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.sort_order}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/annotation-tasks/${t.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={t.id} action={deleteAnnotationTask} label={t.title} />
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No annotation tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
