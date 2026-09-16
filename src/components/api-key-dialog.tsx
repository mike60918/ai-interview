"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";

type ApiKeyDialogProps = {
  open: boolean;
  initialValue: string;
  onClose: () => void;
  onSave: (key: string) => void;
};

// 呼叫端必須在 open 由 false 變成 true 時改變這個元件的 `key`
// （見 interview/page.tsx），讓 React 重新掛載它、以 initialValue
// 重新初始化 value，而不是用 effect 手動同步。
export function ApiKeyDialog({ open, initialValue, onClose, onSave }: ApiKeyDialogProps) {
  const [value, setValue] = useState(initialValue);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              設定 OpenAI API Key
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          本工具採 BYOK（Bring Your Own Key）模式：你的 API Key 只會存在自己瀏覽器的
          localStorage 裡，並在每次呼叫面試 API 時一併帶上，不會被我們的伺服器保存。
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            OpenAI API Key
          </label>
          <input
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="sk-..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            還沒有 API Key？前往 OpenAI 建立一組 →
          </a>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setValue("");
              onSave("");
            }}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            清除
          </button>
          <button
            type="button"
            onClick={() => onSave(value.trim())}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-transform hover:scale-[1.01]"
          >
            儲存
          </button>
        </div>
      </div>
    </div>
  );
}
