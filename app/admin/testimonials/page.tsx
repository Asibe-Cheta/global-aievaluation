import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminTestimonials } from "@/lib/admin/queries";
import DeleteButton from "../DeleteButton";
import { deleteTestimonial } from "@/lib/actions/admin-testimonials";

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Testimonials
        </h2>
        <Link
          href="/admin/testimonials/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Testimonial
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Quote</th>
              <th className="text-left px-4 py-3">Active</th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {testimonials.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {t.name}
                  <div className="text-slate-400 font-normal">{t.role}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-md truncate">
                  {t.quote}
                </td>
                <td className="px-4 py-3">
                  {t.is_active ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="text-slate-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {t.sort_order}
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/testimonials/${t.id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={t.id} action={deleteTestimonial} label={t.name} />
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No testimonials yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
