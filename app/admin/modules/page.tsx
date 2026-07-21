import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminModules } from "@/lib/admin/queries";
import DeleteButton from "../DeleteButton";
import { deleteModule } from "@/lib/actions/admin-modules";

export default async function AdminModulesPage() {
  const modules = await getAdminModules();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Modules
        </h2>
        <Link
          href="/admin/modules/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Module
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Content</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {modules.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {m.title}
                  <div className="text-slate-400 font-normal">{m.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {m.sort_order}
                </td>
                <td className="px-4 py-3 space-x-3">
                  <Link
                    href={`/admin/modules/${m.id}/lessons`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Lessons
                  </Link>
                  <Link
                    href={`/admin/modules/${m.id}/simulation-tasks`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Simulation Tasks
                  </Link>
                  <Link
                    href={`/admin/modules/${m.id}/exam-questions`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Exam Questions
                  </Link>
                  <Link
                    href={`/admin/modules/${m.id}/annotation-tasks`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Annotation Tasks
                  </Link>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/modules/${m.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    id={m.id}
                    action={deleteModule}
                    label={`${m.title} — this also deletes ALL of its lessons, simulation tasks, exam questions, and annotation tasks`}
                  />
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No modules yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
