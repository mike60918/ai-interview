import OpenAI from "openai";

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// BYOK 模式：每個請求都帶著使用者自己的 API Key，
// 所以這裡不快取單一 client，而是依請求傳入的 key 各自建立一個。
export function createOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

// 判斷呼叫 OpenAI 失敗的原因是不是「金鑰本身有問題」（例如無效或過期），
// 好讓 API 能回傳比單純 500 更明確的錯誤訊息給使用者。
export function isOpenAIAuthError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 401
  );
}
