import { notFound } from "next/navigation";
import { getAdminLesson } from "@/lib/admin/queries";
import LessonForm from "../LessonForm";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ moduleId: string; lessonId: string }>;
}) {
  const { moduleId, lessonId } = await params;
  const lesson = await getAdminLesson(lessonId);

  if (!lesson) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Lesson
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <LessonForm moduleId={moduleId} lesson={lesson} />
      </div>
    </div>
  );
}
