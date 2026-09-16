import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            用 AI 面試官陪你反覆練習，貼上職缺描述，立即開始模擬面試。
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">產品</span>
          <a
            href="#features"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            功能特色
          </a>
          <a
            href="#how-it-works"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            使用流程
          </a>
          <Link
            href="/interview"
            className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            立即開始模擬面試
          </Link>
        </div>
      </div>
      <div className="border-t border-zinc-200 px-6 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        © {new Date().getFullYear()} 面試通 AI. All rights reserved.
      </div>
    </footer>
  );
}
