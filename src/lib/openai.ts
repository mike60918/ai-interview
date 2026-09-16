import OpenAI from "openai";

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;

// 延遲到第一次真正呼叫時才建立 OpenAI client。
// 若在模組頂層就執行 `new OpenAI(...)`，Next.js build 時為了收集
// route handler 的資訊會載入這個檔案，一旦當下環境沒有 OPENAI_API_KEY
// （例如 Vercel 專案設定裡忘了填），建構子會直接丟出例外，導致整個
// `next build` 失敗——即使實際上根本還沒有人呼叫這支 API。
export function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
