import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllAdminExamQuestions, getAdminModules } from "@/lib/admin/queries";
import { deleteExamQuestion } from "@/lib/actions/admin-exam-questions";
import DeleteButton from "../DeleteButton";

export default async function ExamQuestionsPage() {
  const [questions, modules] = await Promise.all([
    getAllAdminExamQuestions(),
    getAdminModules(),
  ]);

  const moduleTitleById = new Map(modules.map((m) => [m.id, m.title]));

  async function boundDelete(id: string) {
    "use server";
    return deleteExamQuestion(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Exam Questions
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            Shared question bank — the app draws random questions from here
            across every module for Exam Practice, under Real World Practice.
          </p>
        </div>
        <Link
          href="/admin/exam-questions/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Question
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Question</th>
              <th className="text-left px-4 py-3">Module</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-md truncate">
                  {q.question || "(untitled)"}
                  <div className="text-slate-400 font-normal">{q.id}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {moduleTitleById.get(q.module_id) ?? q.module_id}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{q.category}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{q.sort_order}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/exam-questions/${q.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={q.id} action={boundDelete} label={q.id} />
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No exam questions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
