import { getOpenAIClient, OPENAI_MODEL } from "@/lib/openai";

// 使用者若沒有指定題數時的預設題數
const DEFAULT_QUESTIONS = 3;
// 允許使用者輸入的最小題數（防呆下限）
const MIN_QUESTIONS = 1;
// 允許使用者輸入的最大題數（防呆上限，避免無限出題浪費 OpenAI 額度）
const MAX_QUESTIONS = 10;

// 對話中單一則訊息的格式：誰說的（user=候選人 / assistant=面試官）、說了什麼
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// 前端呼叫這支 API 時，request body 預期的格式
type RequestBody = {
  jobDescription?: string; // 職缺描述
  messages?: ChatMessage[]; // 目前為止的問答歷史紀錄
  totalQuestions?: number; // 使用者指定的面試題數
};

// 把前端傳來的 totalQuestions 做驗證與範圍限制，避免非法值（非數字、負數、過大）造成問題
function resolveTotalQuestions(value: unknown): number {
  // 如果不是數字型別，就直接用預設題數
  const parsed = typeof value === "number" ? Math.round(value) : DEFAULT_QUESTIONS;
  // 如果是 NaN 或 Infinity 這類不合法的數字，也用預設題數
  if (!Number.isFinite(parsed)) return DEFAULT_QUESTIONS;
  // 把結果限制在 [MIN_QUESTIONS, MAX_QUESTIONS] 之間
  return Math.min(Math.max(parsed, MIN_QUESTIONS), MAX_QUESTIONS);
}

// 組出「出題階段」要給 OpenAI 的 system prompt（決定 AI 這一輪要扮演的角色與任務）
function buildQuestionSystemPrompt(
  jobDescription: string,
  questionNumber: number, // 目前是第幾題
  totalQuestions: number, // 總共幾題
  hasPreviousAnswer: boolean // 是否已經有候選人回答過（用來決定要不要提示 AI 參考先前回答）
) {
  return `你是一位資深技術面試官，正在針對以下職缺進行模擬面試：

職缺描述：
${jobDescription}

這是模擬面試的第 ${questionNumber} 題（共 ${totalQuestions} 題）。請根據職缺描述${
    hasPreviousAnswer ? "與候選人先前的回答" : ""
  }，提出下一個有針對性、精煉的面試問題。只輸出問題本身，不要包含題號、前言或任何額外說明。`;
}

// 組出「最終評分階段」要給 OpenAI 的 system prompt
// 這裡特別強調「不能再問問題」，因為先前測試發現如果把整段一問一答的對話直接丟給模型，
// 模型會被前面全是提問的語氣帶著走，導致評分時又忍不住反問候選人。
function buildEvaluationSystemPrompt(jobDescription: string, totalQuestions: number) {
  return `你是一位資深技術面試官，剛完成針對以下職缺的模擬面試（共 ${totalQuestions} 題）：

職缺描述：
${jobDescription}

使用者接下來會給你完整的面試問答紀錄。請根據候選人的回答內容，給出評分與建議，使用繁體中文並以清楚的條列式呈現，需包含：
1. 總體評分（滿分 100 分）
2. 每一題的評語與更好的回答方式：針對每一題，分別列出
   - 候選人回答的優點與不足
   - 更好的回答方式（具體說明應該補充或調整的重點，並提供一個示範性的參考回答）
3. 整體的具體且可執行的改進建議

規則：
- 面試已經結束，絕對不要再提出任何新問題或反問候選人，整段回覆中不可出現問號「？」。
- 只輸出上述三個項目的內容，不要有開場白、結語，也不要詢問是否需要更多資訊。`;
}

// 把 messages（一問一答交錯的陣列）轉換成一份「面試問答逐字稿」文字，
// 用來在最終評分階段以「單一則 user 訊息」的形式送給 OpenAI，
// 而不是沿用多輪對話格式（原因見上方 buildEvaluationSystemPrompt 的註解）。
function buildTranscript(messages: ChatMessage[]) {
  // 把面試官問的題目與候選人的回答分別取出
  const questions = messages.filter((m) => m.role === "assistant");
  const answers = messages.filter((m) => m.role === "user");

  // 依序組成「第 N 題 / 面試官提問 / 候選人回答」的段落，段落間用空行分隔
  return questions
    .map((q, i) => {
      const answer = answers[i]?.content ?? "(未作答)";
      return `第 ${i + 1} 題\n面試官提問：${q.content}\n候選人回答：${answer}`;
    })
    .join("\n\n");
}

// /api/interview 的 POST 處理函式：前端每次「開始面試」或「送出一題答案」都會呼叫這裡一次
export async function POST(request: Request) {
  // 解析 request body 的 JSON，格式錯誤就直接回 400
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "無效的請求格式" }, { status: 400 });
  }

  // 職缺描述必須存在且非空字串，否則無法出題
  const jobDescription = body.jobDescription?.trim();
  // messages 沒帶或格式錯誤時，視為空陣列（代表這是第一次呼叫、還沒有任何問答）
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!jobDescription) {
    return Response.json({ error: "職缺描述不可為空" }, { status: 400 });
  }

  // 取得（並校正過範圍的）本次面試要問幾題
  const totalQuestions = resolveTotalQuestions(body.totalQuestions);
  // 用「目前歷史紀錄中 user 角色訊息的數量」代表候選人已經回答過幾題
  // 這支 API 本身沒有保存任何 session 狀態，完全靠前端每次把完整歷史傳回來，
  // 所以「現在進行到第幾題」都是由這行從歷史紀錄反推出來的。
  const answerCount = messages.filter((m) => m.role === "user").length;
  // 只要候選人已回答的題數達到或超過設定的總題數，就代表面試結束，進入評分階段
  const isFinalStage = answerCount >= totalQuestions;

  // 依照目前階段（出題 or 評分），組出對應的 system prompt
  const systemPrompt = isFinalStage
    ? buildEvaluationSystemPrompt(jobDescription, totalQuestions)
    : buildQuestionSystemPrompt(jobDescription, answerCount + 1, totalQuestions, answerCount > 0);

  // 依照階段組出真正要送給 OpenAI 的訊息陣列：
  // - 評分階段：system + 一則整理好的逐字稿（單輪對話，避免模型被之前的提問語氣帶偏）
  // - 出題階段：system + 完整的歷史對話（多輪對話，讓模型看得到上下文以延續提問邏輯）
  const apiMessages = isFinalStage
    ? [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: buildTranscript(messages) },
      ]
    : [
        { role: "system" as const, content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ];

  try {
    // 在真正處理請求時才建立 OpenAI client，缺少 API 金鑰的錯誤
    // 也會被下面的 catch 接住，回傳乾淨的 500 錯誤，而不是讓整個
    // 服務崩潰（build 階段更不會因此失敗）
    const openai = getOpenAIClient();
    // 呼叫 OpenAI Chat Completions API 取得下一題或最終評分
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      // 評分階段用較低的 temperature（0.3）讓輸出更穩定、更遵守規則；
      // 出題階段用較高的 temperature（0.7）讓題目更有變化性
      temperature: isFinalStage ? 0.3 : 0.7,
      messages: apiMessages,
    });

    // 取出模型回覆的文字內容
    const reply = completion.choices[0]?.message?.content?.trim();

    // 理論上不太會發生，但保險起見：如果模型沒有回傳任何內容，回報 502（上游服務問題）
    if (!reply) {
      return Response.json({ error: "OpenAI 未回傳有效內容" }, { status: 502 });
    }

    // 把結果回傳給前端：
    // - message：這一輪的內容（新問題，或是最終的評分與建議）
    // - done：是否已經是最終評分階段，前端用這個欄位決定要不要切換到「結束畫面」
    // - questionNumber：目前是第幾題（評分階段就顯示為總題數）
    // - totalQuestions：把本次實際套用的總題數也回傳給前端，方便前端顯示「第 X / Y 題」
    return Response.json({
      message: reply,
      done: isFinalStage,
      questionNumber: isFinalStage ? totalQuestions : answerCount + 1,
      totalQuestions,
    });
  } catch (error) {
    // 呼叫 OpenAI 失敗（例如金鑰錯誤、額度用盡、網路問題）時，記錄錯誤並回傳 500
    console.error("OpenAI API error:", error);
    return Response.json({ error: "呼叫 OpenAI API 時發生錯誤" }, { status: 500 });
  }
}
