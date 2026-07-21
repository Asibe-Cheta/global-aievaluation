import AnnotationTaskForm from "../AnnotationTaskForm";

export default async function NewAnnotationTaskPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        New Annotation Task
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <AnnotationTaskForm moduleId={moduleId} />
      </div>
    </div>
  );
}
