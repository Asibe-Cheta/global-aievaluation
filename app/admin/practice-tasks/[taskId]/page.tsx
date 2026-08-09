import { notFound } from "next/navigation";
import { getAdminPracticeTask, getAdminModules } from "@/lib/admin/queries";
import PracticeTaskForm from "../PracticeTaskForm";

export default async function EditPracticeTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const [task, modules] = await Promise.all([
    getAdminPracticeTask(taskId),
    getAdminModules(),
  ]);

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Practice Task
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <PracticeTaskForm modules={modules} task={task} />
      </div>
    </div>
  );
}
