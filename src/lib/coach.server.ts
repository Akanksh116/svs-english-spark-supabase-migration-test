/**
 * Gemini access layer for the SVS English Coach.
 * Server-only: never import from client code.
 */

// gemini-2.5-flash is unavailable to newer API keys (404 NOT_FOUND).
export const COACH_MODEL = "gemini-3.5-flash";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export type CoachTurn = { role: "user" | "model"; text: string };

export class CoachError extends Error {
  constructor(
    message: string,
    public code:
      | "missing_key"
      | "invalid_key"
      | "rate_limit"
      | "timeout"
      | "unavailable"
      | "network",
  ) {
    super(message);
  }
}

const MODE_INSTRUCTIONS: Record<string, string> = {
  classroom:
    "Roleplay classroom teaching situations: giving instructions, explaining a lesson, managing students.",
  parent:
    "Roleplay a parent meeting: discussing a student's progress, behaviour and homework politely.",
  office:
    "Roleplay staff-room and office communication: leave requests, circulars, short official talks.",
  telephone:
    "Roleplay telephone conversations: answering school calls, taking messages, speaking clearly.",
  assembly:
    "Roleplay morning assembly speaking: short announcements, addressing students on the ground.",
  free: "Free general spoken English conversation to keep daily fluency.",
};

export type CoachChallenge = { title: string; description?: string };

export function buildSystemInstruction(
  modeId: string,
  modeTitle: string,
  challenge?: CoachChallenge,
) {
  if (challenge) {
    return [
      "You are the SVS English Coach for teachers of Sri Vijaya Sai High School (India).",
      `Today's Challenge: "${challenge.title}".`,
      challenge.description ? `Challenge details: ${challenge.description}` : "",
      "STEP 1 — If the teacher has not spoken yet (no teacher message in the conversation):",
      "greet the teacher in one short sentence, state today's challenge, explain the objective in one sentence,",
      "and tell them to start speaking now and press Finish when done. Do NOT ask any question. Max 4 short sentences.",
      "",
      "STEP 2 — Every time the teacher sends an answer (typed or spoken), reply immediately with this exact structure:",
      "You said: <quote what the teacher said>",
      "Mistakes: <list the important grammar or vocabulary mistakes, or say 'No major mistakes.'>",
      "Why: <explain in very simple English why each mistake is wrong>",
      "Correct version: <the corrected sentence>",
      "Better sentence: <a more natural, native-sounding version>",
      "Tip: <one short practical English tip>",
      "Rules for STEP 2:",
      "- Do NOT ask any follow-up question and do NOT continue the conversation.",
      "- Keep every line short and simple. No essays, no extra sections.",
      "- Warm, encouraging tone. If the answer is already correct, praise it briefly and still give a better sentence and a tip.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  const scenario = MODE_INSTRUCTIONS[modeId] ?? MODE_INSTRUCTIONS.free;
  return [
    "You are the SVS English Coach, an enthusiastic English speaking coach for teachers and staff of Sri Vijaya Sai High School (India).",
    "You are NOT a general chatbot. Only coach spoken English for school situations.",
    `Current practice mode: ${modeTitle}. ${scenario}`,
    "If the teacher has not spoken yet, greet them warmly in one or two short sentences and ask your first question.",
    "",
    "After EVERY teacher message, reply with this exact structure:",
    "You said: <quote what the teacher actually said>",
    "Mistakes: <the important grammar or vocabulary mistakes, or 'No mistakes — well said!'>",
    "Why: <explain in very simple English why each mistake is wrong; skip if there are no mistakes>",
    "Correct version: <the corrected sentence; skip if already correct>",
    "Better sentence: <a more natural, native-sounding alternative, only if useful>",
    "Next question: <one short question to continue the conversation>",
    "Rules:",
    "- Keep every line short and simple. No long paragraphs, no essays, no bullet lists beyond this structure.",
    "- Ask only ONE question at the end and then wait.",
    "- If the sentence is already correct, praise it briefly and continue.",
    "- Warmly encourage the teacher and increase difficulty gradually as they improve.",
    "- If the teacher struggles, explain in very simple English. Only if still needed, add one short Telugu or Hindi line in brackets, then continue in English immediately.",
  ].join("\n");
}

export const EVALUATION_INSTRUCTION = [
  "You are evaluating an English speaking practice session of a school teacher.",
  "Be encouraging but realistic. Scores are 0-100 integers.",
  "Return ONLY JSON matching the requested schema.",
].join("\n");

type GeminiOptions = {
  system: string;
  contents: CoachTurn[];
  json?: boolean;
  maxOutputTokens?: number;
};

/**
 * Map a Gemini HTTP status to a coach error code + how long the key that hit it
 * should be cooled down. `retryable` means: try the next configured key.
 * Exported for tests.
 */
export function classifyHttpStatus(status: number): {
  code: CoachError["code"];
  cooldownMs: number;
  retryable: boolean;
  message: string;
} {
  if (status === 401 || status === 403) {
    return {
      code: "invalid_key",
      cooldownMs: 10 * 60_000,
      retryable: true,
      message: "The coach service key was rejected.",
    };
  }
  if (status === 429) {
    return {
      code: "rate_limit",
      cooldownMs: 60_000,
      retryable: true,
      message: "Too many requests right now. Please wait a moment.",
    };
  }
  // 500/502/503/504/529 — provider overload or transient outage (UNAVAILABLE).
  if (status >= 500 || status === 408) {
    return {
      code: "unavailable",
      cooldownMs: 30_000,
      retryable: true,
      message: "The AI service is temporarily unavailable. Please try again.",
    };
  }
  return {
    code: "unavailable",
    cooldownMs: 0,
    retryable: false,
    message: "The AI service could not process that request.",
  };
}

/** Cooldown applied to a key for a given failure code. */
const COOLDOWN_BY_CODE: Partial<Record<CoachError["code"], number>> = {
  rate_limit: 60_000,
  invalid_key: 10 * 60_000,
  unavailable: 30_000,
  // A key that stalled is skipped briefly so the next request does not pay the
  // same wall-clock cost again.
  timeout: 15_000,
};

const ALL_KEYS_FAILED_MESSAGE =
  "The AI service is temporarily unavailable. Please try again in a moment.";

/**
 * Timeout budget.
 *
 * The app runs as serverless functions, so a single slow Gemini call must never
 * consume the whole platform execution window — otherwise the platform kills
 * the function before any failover key is tried and the user sees a hard 504.
 *
 * - ATTEMPT_TIMEOUT_MS caps ONE key attempt.
 * - TOTAL_DEADLINE_MS caps the whole request across all failover attempts.
 *
 * Defaults are deliberately conservative so at least two attempts fit inside a
 * typical serverless execution limit. Both can be raised per-environment
 * (without code changes) when the deployment allows a longer function
 * duration.
 */
function readMs(name: string, fallback: number): number {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

export const DEFAULT_ATTEMPT_TIMEOUT_MS = 12_000;
export const DEFAULT_TOTAL_DEADLINE_MS = 25_000;
/** Below this much remaining budget a new attempt cannot realistically finish. */
export const MIN_ATTEMPT_BUDGET_MS = 2_500;

export function getTimeoutBudget() {
  const attempt = readMs("GEMINI_ATTEMPT_TIMEOUT_MS", DEFAULT_ATTEMPT_TIMEOUT_MS);
  const total = readMs("GEMINI_TOTAL_DEADLINE_MS", DEFAULT_TOTAL_DEADLINE_MS);
  return { attemptTimeoutMs: Math.min(attempt, total), totalDeadlineMs: total };
}

export async function callGemini({
  system,
  contents,
  json,
  maxOutputTokens = 512,
}: GeminiOptions): Promise<string> {
  const { getKeyRotation, markKeyExhausted, markKeyHealthy, describeKey } =
    await import("./gemini-keys.server");

  // Each configured key appears at most once here: no infinite retry loop.
  const keys = getKeyRotation();
  if (keys.length === 0) throw new CoachError("Gemini API key is not configured.", "missing_key");

  const { attemptTimeoutMs, totalDeadlineMs } = getTimeoutBudget();
  const deadline = Date.now() + totalDeadlineMs;

  let lastError: CoachError | undefined;

  for (const apiKey of keys) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_BUDGET_MS) {
      // Out of request budget — stop instead of getting killed mid-flight.
      lastError ??= new CoachError("The coach took too long to respond.", "timeout");
      break;
    }

    try {
      const text = await requestGemini({
        apiKey,
        system,
        contents,
        json,
        maxOutputTokens,
        timeoutMs: Math.min(attemptTimeoutMs, remaining),
      });
      markKeyHealthy(apiKey);
      return text;
    } catch (error) {
      if (!(error instanceof CoachError)) throw error;
      lastError = error;
      // Quota / auth / overload / stall: cool this key down and try the next.
      const cooldown = COOLDOWN_BY_CODE[error.code];
      if (cooldown) {
        markKeyExhausted(apiKey, cooldown);
        console.warn(`Gemini key ${describeKey(apiKey)} failed (${error.code}); trying next key.`);
        continue;
      }
      throw error;
    }
  }

  // Every key failed — surface a clean message, never the provider payload.
  if (lastError?.code === "invalid_key" || lastError?.code === "missing_key") {
    throw new CoachError(ALL_KEYS_FAILED_MESSAGE, "unavailable");
  }
  throw new CoachError(ALL_KEYS_FAILED_MESSAGE, lastError?.code ?? "unavailable");
}

async function requestGemini({
  apiKey,
  system,
  contents,
  json,
  maxOutputTokens,
  timeoutMs,
}: GeminiOptions & {
  apiKey: string;
  maxOutputTokens: number;
  timeoutMs: number;
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/${COACH_MODEL}:generateContent`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: contents.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
        generationConfig: {
          temperature: json ? 0.3 : 0.8,
          maxOutputTokens,
          // Keep internal thinking off so short coaching replies are not
          // truncated before any text is emitted.
          thinkingConfig: { thinkingBudget: 0 },
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new CoachError("The coach took too long to respond.", "timeout");
    }
    throw new CoachError("Could not reach the coach service.", "network");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text();
    // Server-side log only; the thrown message stays generic for the browser.
    console.error(`Gemini request failed [${response.status}] model=${COACH_MODEL}: ${body}`);
    const { code, message } = classifyHttpStatus(response.status);
    throw new CoachError(message, code);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      finishReason?: string;
      content?: { parts?: Array<{ text?: string }> };
    }>;
    promptFeedback?: { blockReason?: string };
  };
  const candidate = payload.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();
  if (!text) {
    const reason =
      candidate?.finishReason ?? payload.promptFeedback?.blockReason ?? "empty response";
    console.error(`Gemini returned no text (${reason}): ${JSON.stringify(payload).slice(0, 600)}`);
    throw new CoachError("The coach could not produce a reply. Please try again.", "unavailable");
  }
  return text;
}
