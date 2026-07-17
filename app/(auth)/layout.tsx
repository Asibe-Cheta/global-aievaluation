import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6 py-12 transition-colors">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image
          src="/assets/images/logos/global-logo.png"
          alt="Global Ready AIEval"
          width={28}
          height={28}
        />
        <span className="text-xl font-extrabold text-[#3B28CC] dark:text-indigo-400 tracking-tight">
          Global Ready AIEval
        </span>
      </Link>
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-lg p-8">
        {children}
      </div>
    </div>
  );
}
