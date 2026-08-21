import Image from "next/image";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { LEGAL_LINKS } from "@/lib/legal-links";

export default function LegalPageShell({
  title,
  effectiveDate,
  showDraftNotice = false,
  children,
}: {
  title: string;
  effectiveDate: string;
  // Only the pages I drafted myself (no source document was supplied) show
  // this — the 6 real documents from public/legal/ are final content, not a
  // starting point that needs a lawyer's pass before anyone relies on it.
  showDraftNotice?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      <header className="border-b border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/assets/images/logos/global-logo.png" alt="Global Ready AIEval" width={26} height={26} />
            <span className="text-lg font-extrabold text-[#3B28CC] dark:text-indigo-400 tracking-tight">
              Global Ready AIEval
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
            Effective {effectiveDate}
          </p>
        </div>

        {showDraftNotice && (
          <div className="mb-10 flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              This page was drafted from Global Ready AIEval&apos;s actual technical setup as a starting point —
              it is not legal advice. Have it reviewed alongside the rest of the site&apos;s legal documents before
              relying on it.
            </p>
          </div>
        )}

        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-slate-900 dark:prose-strong:text-white text-sm leading-relaxed">
          {children}
        </article>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-450">
            Related Legal Information
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
