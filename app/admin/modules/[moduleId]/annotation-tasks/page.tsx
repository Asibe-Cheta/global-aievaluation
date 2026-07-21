import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { getAdminAnnotationTasks, getAdminModule } from "@/lib/admin/queries";
import { deleteAnnotationTask } from "@/lib/actions/admin-annotation-tasks";
import DeleteButton from "../../../DeleteButton";

export default async function AnnotationTasksPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const [tasks, mod] = await Promise.all([
    getAdminAnnotationTasks(moduleId),
    getAdminModule(moduleId),
  ]);

  async function boundDelete(id: string) {
    "use server";
    return deleteAnnotationTask(id, moduleId);
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
          Annotation Tasks — {mod?.title ?? moduleId}
        </h2>
        <Link
          href={`/admin/modules/${moduleId}/annotation-tasks/new`}
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
                  {t.type === "image_pair" ? "Image pair" : "Video"}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.sort_order}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/modules/${moduleId}/annotation-tasks/${t.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={t.id} action={boundDelete} label={t.title} />
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
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
