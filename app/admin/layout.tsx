import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Award, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside className="w-60 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen p-5 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Admin
          </span>
          <h1 className="text-sm font-black text-slate-900 dark:text-white">
            Content Dashboard
          </h1>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin/jobs"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Jobs
          </Link>
          <Link
            href="/admin/achievements"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-850 transition-colors"
          >
            <Award className="w-4 h-4" />
            Achievements
          </Link>
        </nav>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to App
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 max-w-5xl">{children}</main>
    </div>
  );
}
