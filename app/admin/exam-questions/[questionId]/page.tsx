import { notFound } from "next/navigation";
import { getAdminExamQuestion, getAdminModules } from "@/lib/admin/queries";
import ExamQuestionForm from "../ExamQuestionForm";

export default async function EditExamQuestionPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const [question, modules] = await Promise.all([
    getAdminExamQuestion(questionId),
    getAdminModules(),
  ]);

  if (!question) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Exam Question
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <ExamQuestionForm modules={modules} question={question} />
      </div>
    </div>
  );
}
