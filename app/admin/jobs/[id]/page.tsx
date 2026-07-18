import { notFound } from "next/navigation";
import { getAdminJob } from "@/lib/admin/queries";
import JobForm from "../JobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getAdminJob(id);

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Job
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
