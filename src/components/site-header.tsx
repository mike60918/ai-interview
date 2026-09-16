import Link from "next/link";
import { Logo } from "./logo";

const navLinks = [
  { href: "#features", label: "功能特色" },
  { href: "#how-it-works", label: "使用流程" },
  { href: "#for-whom", label: "適合對象" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/70 backdrop-blur-md dark:border-zinc-800/70 dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          href="/interview"
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-opacity hover:opacity-90"
        >
          開始模擬面試
        </Link>
      </div>
    </header>
  );
}
