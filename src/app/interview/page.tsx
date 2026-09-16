"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, KeyRound, RotateCcw, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { loadStoredApiKey, saveStoredApiKey, OPENAI_API_KEY_HEADER } from "@/lib/api-key";

const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 10;
const DEFAULT_QUESTIONS = 3;
const QUESTION_PRESETS = [3, 5, 8];

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Stage = "setup" | "interview" | "finished";

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
            : "rounded-bl-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(DEFAULT_QUESTIONS);
  const [stage, setStage] = useState<Stage>("setup");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 進到頁面時，從瀏覽器 localStorage 讀回使用者先前存過的 API Key。
  // 必須用 effect 而非 useState 的 lazy initializer：SSR 階段沒有
  // window/localStorage，若在 render 階段就讀取會導致 client 端第一次
  // hydrate 的結果跟伺服器算出來的不一致（hydration mismatch）。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 同步瀏覽器 localStorage 這種外部系統，是本規則允許的用途
    setApiKey(loadStoredApiKey());
  }, []);

  function handleSaveApiKey(key: string) {
    saveStoredApiKey(key);
    setApiKey(key);
    setSettingsOpen(false);
  }

  // 統一處理 API 呼叫失敗：如果是跟 API Key 有關的錯誤（缺少或無效），
  // 就順手把設定彈窗打開，讓使用者能直接補上正確的金鑰
  function handleApiError(err: unknown) {
    const message = err instanceof Error ? err.message : "發生未知錯誤";
    setError(message);
    if (message.includes("API Key")) {
      setSettingsOpen(true);
    }
  }

  async function callInterviewApi(nextMessages: ChatMessage[]) {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [OPENAI_API_KEY_HEADER]: apiKey,
      },
      body: JSON.stringify({ jobDescription, messages: nextMessages, totalQuestions }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "發生未知錯誤");
    }
    return data as {
      message: string;
      done: boolean;
      questionNumber: number;
      totalQuestions: number;
    };
  }

  async function handleStart() {
    if (!apiKey.trim()) {
      setError("請先設定你的 OpenAI API Key");
      setSettingsOpen(true);
      return;
    }
    if (!jobDescription.trim()) {
      setError("請先輸入職缺描述");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await callInterviewApi([]);
      setMessages([{ role: "assistant", content: data.message }]);
      setQuestionNumber(data.questionNumber);
      setStage("interview");
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!currentAnswer.trim()) {
      setError("請輸入你的回答");
      return;
    }
    setError(null);
    setLoading(true);

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: currentAnswer },
    ];
    setMessages(nextMessages);
    setCurrentAnswer("");

    try {
      const data = await callInterviewApi(nextMessages);
      if (data.done) {
        setFeedback(data.message);
        setStage("finished");
      } else {
        setMessages([...nextMessages, { role: "assistant", content: data.message }]);
        setQuestionNumber(data.questionNumber);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleRestart() {
    setJobDescription("");
    setTotalQuestions(DEFAULT_QUESTIONS);
    setStage("setup");
    setMessages([]);
    setCurrentAnswer("");
    setQuestionNumber(1);
    setFeedback(null);
    setError(null);
  }

  const progressPercent = Math.min(
    100,
    Math.round(((questionNumber - 1) / totalQuestions) * 100)
  );

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-black/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="設定 OpenAI API Key"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <KeyRound className="h-4 w-4" />
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              ← 返回首頁
            </Link>
          </div>
        </div>
      </header>

      <ApiKeyDialog
        key={settingsOpen ? "open" : "closed"}
        open={settingsOpen}
        initialValue={apiKey}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveApiKey}
      />

      <main className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
        <div className="w-full max-w-2xl">
          {stage === "setup" && (
            <>
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI 模擬面試
                </span>
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  開始你的模擬面試
                </h1>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  貼上職缺描述、設定題數，AI 面試官馬上為你出題。
                </p>
              </div>

              <div className="flex flex-col gap-5 rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <KeyRound className="h-4 w-4" />
                    {apiKey ? "OpenAI API Key 已設定" : "尚未設定 OpenAI API Key"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {apiKey ? "更換" : "立即設定"}
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    職缺描述
                  </label>
                  <textarea
                    className="min-h-40 w-full resize-y rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    placeholder="例如：資深前端工程師，需熟悉 React、TypeScript，負責電商平台前端開發..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    面試題數（{MIN_QUESTIONS}～{MAX_QUESTIONS} 題）
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {QUESTION_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTotalQuestions(preset)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                          totalQuestions === preset
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                            : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {preset} 題
                      </button>
                    ))}
                    <input
                      type="number"
                      min={MIN_QUESTIONS}
                      max={MAX_QUESTIONS}
                      value={totalQuestions}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (Number.isNaN(value)) return;
                        setTotalQuestions(
                          Math.min(Math.max(Math.round(value), MIN_QUESTIONS), MAX_QUESTIONS)
                        );
                      }}
                      className="w-20 rounded-full border border-zinc-300 bg-white p-1.5 text-center text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "面試官準備中..." : "開始面試"}
                </button>
              </div>
            </>
          )}

          {stage === "interview" && (
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <div className="mb-2 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                  <span>
                    第 {questionNumber} / {totalQuestions} 題
                  </span>
                  <span>{progressPercent}% 已完成</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {messages.map((m, i) => (
                  <ChatBubble key={i} message={m} />
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <textarea
                  className="min-h-28 w-full resize-y rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 outline-none transition-colors focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="請輸入你的回答..."
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loading}
                  className="self-end rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-transform hover:scale-[1.01] disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "面試官思考中..." : "送出答案"}
                </button>
              </div>
            </div>
          )}

          {stage === "finished" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {messages.map((m, i) => (
                  <ChatBubble key={i} message={m} />
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 shadow-sm dark:border-indigo-900 dark:from-indigo-950 dark:to-violet-950">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    面試評分與建議
                  </h2>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {feedback}
                </p>
              </div>

              <button
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4" />
                重新開始
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
