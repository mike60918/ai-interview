import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-500/30">
        面
      </span>
      <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        面試通 <span className="text-indigo-600 dark:text-indigo-400">AI</span>
      </span>
    </Link>
  );
}
