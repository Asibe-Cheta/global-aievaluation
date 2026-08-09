import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAdminPracticeTasks, getAdminModules, type AdminPracticeTaskRow } from "@/lib/admin/queries";
import { deletePracticeTask } from "@/lib/actions/admin-practice-tasks";
import DeleteButton from "../DeleteButton";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

export default async function PracticeTasksPage() {
  const [tasks, modules] = await Promise.all([
    getAllAdminPracticeTasks(),
    getAdminModules(),
  ]);

  const moduleTitleById = new Map(modules.map((m) => [m.id, m.title]));

  async function boundDelete(id: string) {
    "use server";
    return deletePracticeTask(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Real World Practice
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            Evaluation and annotation tasks — the app draws these per module,
            grouped into Beginner, Intermediate, and Expert practice.
          </p>
        </div>
        <Link
          href="/admin/practice-tasks/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Practice Task
        </Link>
      </div>

      {LEVELS.map((level) => {
        const levelTasks = tasks.filter((t) => t.difficulty === level.value);
        return (
          <div key={level.value} className="space-y-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              {level.label}
              <span className="bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                {levelTasks.length}
              </span>
            </h3>
            <PracticeTaskTable
              tasks={levelTasks}
              moduleTitleById={moduleTitleById}
              boundDelete={boundDelete}
            />
          </div>
        );
      })}
    </div>
  );
}

function PracticeTaskTable({
  tasks,
  moduleTitleById,
  boundDelete,
}: {
  tasks: AdminPracticeTaskRow[];
  moduleTitleById: Map<string, string>;
  boundDelete: (id: string) => Promise<{ error?: string }>;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
          <tr>
            <th className="text-left px-4 py-3">Question</th>
            <th className="text-left px-4 py-3">Module</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-left px-4 py-3">Mode</th>
            <th className="text-left px-4 py-3">Timed</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
          {tasks.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                {t.question || t.id}
                <div className="text-slate-400 font-normal">{t.id}</div>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                {moduleTitleById.get(t.module_id) ?? t.module_id}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.task_type}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.response_mode}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{t.timed ? "Yes" : "No"}</td>
              <td className="px-4 py-3 text-right space-x-3">
                <Link
                  href={`/admin/practice-tasks/${t.id}`}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  Edit
                </Link>
                <DeleteButton id={t.id} action={boundDelete} label={t.question || t.id} />
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                No practice tasks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
