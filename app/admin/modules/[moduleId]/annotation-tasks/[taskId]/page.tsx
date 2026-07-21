import { notFound } from "next/navigation";
import { getAdminAnnotationTask } from "@/lib/admin/queries";
import AnnotationTaskForm from "../AnnotationTaskForm";

export default async function EditAnnotationTaskPage({
  params,
}: {
  params: Promise<{ moduleId: string; taskId: string }>;
}) {
  const { moduleId, taskId } = await params;
  const task = await getAdminAnnotationTask(taskId);

  if (!task) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Annotation Task
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <AnnotationTaskForm moduleId={moduleId} task={task} />
      </div>
    </div>
  );
}
