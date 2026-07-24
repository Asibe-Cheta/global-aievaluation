import { notFound } from "next/navigation";
import { getAdminTestimonial } from "@/lib/admin/queries";
import TestimonialForm from "../TestimonialForm";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await getAdminTestimonial(id);

  if (!testimonial) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Edit Testimonial
      </h2>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
