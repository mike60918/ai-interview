import Link from "next/link";
import { Award, MessagesSquare, Sliders, Target } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const features = [
  {
    icon: Target,
    title: "依職缺客製化出題",
    description: "貼上任何職缺描述，AI 會針對職缺內容設計專屬的面試問題，而不是通用題庫。",
  },
  {
    icon: MessagesSquare,
    title: "追問式對話",
    description: "AI 面試官會根據你上一題的回答繼續追問，模擬真實面試的臨場感。",
  },
  {
    icon: Sliders,
    title: "自訂面試題數",
    description: "從 1 題快速演練到 10 題完整模擬，依照你準備面試的時間彈性調整。",
  },
  {
    icon: Award,
    title: "評分與示範回答",
    description: "面試結束後提供總體評分、每題優缺點分析，以及更好的回答示範。",
  },
];

const steps = [
  {
    title: "貼上職缺描述",
    description: "複製任何一份你想準備的職缺描述，並設定想練習的題數。",
  },
  {
    title: "回答面試官的提問",
    description: "AI 面試官會依照職缺出題，並根據你的回答繼續追問，就像真人面試官一樣。",
  },
  {
    title: "取得評分與建議",
    description: "面試結束後立即取得總體評分、逐題講評，以及更好的回答示範。",
  },
];

const personas = [
  "應屆畢業生",
  "轉職 / 跨領域求職者",
  "準備外商面試的人",
  "內部升遷面談前的員工",
  "想反覆練習到有信心的求職者",
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-600/20" />
            <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-600/10" />
          </div>

          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-24 pt-20 text-center md:pt-28">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl md:text-6xl">
              在真正的面試前，先讓
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {" "}
                AI 面試官{" "}
              </span>
              考考你
            </h1>

            <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
              貼上任何一份職缺描述，AI
              會依照職缺內容出題、追問，並在面試結束後給你具體的評分與更好的回答示範。
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/interview"
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-[1.02]"
              >
                開始模擬面試
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                看看怎麼運作
              </a>
            </div>

            {/* Mock chat preview */}
            <div className="relative mt-12 w-full max-w-2xl">
              <div className="absolute -right-2 -top-4 z-10 rotate-3 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 sm:-right-8">
                <span className="text-indigo-600 dark:text-indigo-400">92</span> / 100 分
              </div>
              <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 text-left shadow-2xl shadow-indigo-500/10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                      請分享一個你曾經解決過的技術難題。
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm text-white">
                      我曾經在專案中遇到資料庫效能瓶頸，透過加索引與拆分查詢解決了問題。
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-100 px-4 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                      很好的例子，能再談談你當時是如何驗證解法有效的嗎？
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              為什麼用 AI 練習面試？
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              不用約時間、不用找面試夥伴，隨時都能開一場針對你目標職缺的模擬面試。
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="bg-zinc-50 py-24 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                三個步驟，開始你的模擬面試
              </h2>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For whom */}
        <section id="for-whom" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
              適合誰使用？
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              不管你準備的是哪一種面試，都可以先讓 AI 陪你練一輪。
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {personas.map((persona) => (
              <span
                key={persona}
                className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {persona}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-8 py-16 text-center shadow-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            />
            <h2 className="text-3xl font-bold text-white sm:text-4xl">準備好了嗎？</h2>
            <p className="mt-4 text-indigo-100">
              現在就貼上你的目標職缺，讓 AI 面試官陪你練習到有信心為止。
            </p>
            <Link
              href="/interview"
              className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-transform hover:scale-[1.02]"
            >
              開始模擬面試
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
