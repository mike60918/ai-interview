// BYOK（Bring Your Own Key）共用邏輯：
// 這個檔案不會 import "openai" 套件，所以前端元件跟後端 route handler
// 都可以安全地引用，用來共用「header 名稱」與「localStorage 存取」的邏輯。

// 前端呼叫 /api/interview 時，用這個 header 帶上使用者自己的 OpenAI API Key
export const OPENAI_API_KEY_HEADER = "x-openai-api-key";

const STORAGE_KEY = "ai-interview:openai-api-key";

// 從瀏覽器 localStorage 讀出使用者先前儲存的 API Key
export function loadStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    // 無痕模式或瀏覽器封鎖 localStorage 時，讀不到就當作沒設定
    return "";
  }
}

// 把 API Key 存進 localStorage；傳空字串則視為清除
export function saveStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (key) {
      window.localStorage.setItem(STORAGE_KEY, key);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // 寫入失敗（例如無痕模式）就靜默忽略，使用者這次 session 仍可正常使用
  }
}
