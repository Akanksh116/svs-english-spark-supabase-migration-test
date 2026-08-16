import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const turnSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string().min(1).max(4000),
});

const challengeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

const chatInput = z.object({
  modeId: z.string().min(1).max(60),
  modeTitle: z.string().min(1).max(120),
  challenge: challengeSchema.optional(),
  history: z.array(turnSchema).max(60),
});

const evaluateInput = z.object({
  modeId: z.string().min(1).max(60).optional(),
  modeTitle: z.string().min(1).max(120),
  challenge: challengeSchema.optional(),
  durationMinutes: z.number().int().min(0).max(600),
  startedAt: z.string().max(40).optional(),
  history: z.array(turnSchema).max(60),
});

export type CoachEvaluation = {
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  betterSentences: string[];
  suggestedPractice: string;
};

function clamp(value: unknown, fallback = 70) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

function toList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  return list.length ? list.slice(0, 4) : fallback;
}

export const coachReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => chatInput.parse(input))
  .handler(async ({ data, context }) => {
    const { consumeRateLimit, COACH_REPLY_LIMIT } = await import("./rate-limit.server");
    const gate = consumeRateLimit(
      `coach-reply:${context.userId}`,
      COACH_REPLY_LIMIT.limit,
      COACH_REPLY_LIMIT.windowMs,
    );
    if (!gate.allowed) {
      return {
        ok: false as const,
        code: "rate_limit" as const,
        message: `Too many coach requests. Please wait ${gate.retryAfterSeconds}s and try again.`,
      };
    }

    const { buildSystemInstruction, callGemini, CoachError } = await import("./coach.server");
    try {
      const history = data.history.length
        ? data.history
        : [
            {
              role: "user" as const,
              text: "Let's begin the practice session. Greet me warmly and ask your first question.",
            },
          ];
      const text = await callGemini({
        system: buildSystemInstruction(data.modeId, data.modeTitle, data.challenge),
        contents: history,
        maxOutputTokens: 1200,
      });
      return { ok: true as const, text };
    } catch (error) {
      if (error instanceof CoachError) {
        return { ok: false as const, code: error.code, message: error.message };
      }
      console.error(error);
      return {
        ok: false as const,
        code: "unavailable" as const,
        message: "Something went wrong with the coach.",
      };
    }
  });

export const coachEvaluate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => evaluateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { consumeRateLimit, COACH_EVALUATE_LIMIT } = await import("./rate-limit.server");
    const gate = consumeRateLimit(
      `coach-evaluate:${context.userId}`,
      COACH_EVALUATE_LIMIT.limit,
      COACH_EVALUATE_LIMIT.windowMs,
    );
    if (!gate.allowed) {
      return {
        ok: false as const,
        code: "rate_limit" as const,
        message: `Too many session reports. Please wait ${gate.retryAfterSeconds}s and try again.`,
      };
    }

    const { EVALUATION_INSTRUCTION, callGemini, CoachError } = await import("./coach.server");
    const transcript = data.history
      .map((t) => `${t.role === "user" ? "Teacher" : "Coach"}: ${t.text}`)
      .join("\n");

    try {
      const raw = await callGemini({
        system: EVALUATION_INSTRUCTION,
        json: true,
        maxOutputTokens: 2000,
        contents: [
          {
            role: "user",
            text: [
              `Practice mode: ${data.modeTitle}`,
              ...(data.challenge
                ? [
                    `This session is a daily challenge: "${data.challenge.title}"`,
                    data.challenge.description
                      ? `Challenge details: ${data.challenge.description}`
                      : "",
                    "Evaluate how well the teacher answered this specific challenge.",
                  ].filter(Boolean)
                : []),
              `Duration: ${data.durationMinutes} minutes`,
              "Transcript:",
              transcript || "(the teacher did not speak)",
              "",
              'Return JSON: {"grammar":number,"vocabulary":number,"fluency":number,"confidence":number,"overall":number,"strengths":string[],"improvements":string[],"betterSentences":string[],"suggestedPractice":string}',
              "Keep each strength/improvement under 12 words. Max 3 items each. betterSentences: up to 3 improved rewrites of sentences the teacher actually said. suggestedPractice is one short sentence of homework.",
            ].join("\n"),
          },
        ],
      });

      const parsed = JSON.parse(raw.replace(/^```json\s*|```$/g, "")) as Record<string, unknown>;
      const evaluation: CoachEvaluation = {
        grammar: clamp(parsed.grammar),
        vocabulary: clamp(parsed.vocabulary),
        fluency: clamp(parsed.fluency),
        confidence: clamp(parsed.confidence),
        overall: clamp(parsed.overall),
        strengths: toList(parsed.strengths, ["You kept the conversation going."]),
        improvements: toList(parsed.improvements, ["Practise longer sentences."]),
        betterSentences: toList(parsed.betterSentences, []),

        suggestedPractice:
          typeof parsed.suggestedPractice === "string" && parsed.suggestedPractice.trim()
            ? parsed.suggestedPractice.trim()
            : "Speak for five minutes tomorrow on the same topic.",
      };

      // Authoritative persistence: server-computed scores, server-known user.
      // The browser never writes practice_sessions / user_stats.
      let newAchievements: string[] = [];
      try {
        const { persistCompletedSession } = await import("@/services/practice.server");
        const completedAt = new Date().toISOString();
        const durationMinutes = Math.min(180, Math.max(1, data.durationMinutes));
        const saved = await persistCompletedSession(context.userId, {
          modeTitle: data.modeTitle,
          durationMinutes,
          messages: data.history.length,
          overall: evaluation.overall,
          grammar: evaluation.grammar,
          vocabulary: evaluation.vocabulary,
          fluency: evaluation.fluency,
          confidence: evaluation.confidence,
          finishedAt: completedAt,
          details: {
            modeId: data.modeId,
            challengeTitle: data.challenge?.title,
            startedAt: data.startedAt,
            completedAt,
            transcript: data.history,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            betterSentences: evaluation.betterSentences,
            suggestedPractice: evaluation.suggestedPractice,
          },
        });
        newAchievements = saved.newAchievements;
      } catch (persistError) {
        console.error("Failed to persist practice session", persistError);
        return {
          ok: false as const,
          code: "unavailable" as const,
          message: "Your report was created but saving it failed. Please try Finish again.",
        };
      }

      return { ok: true as const, evaluation, newAchievements };
    } catch (error) {
      if (error instanceof CoachError) {
        return { ok: false as const, code: error.code, message: error.message };
      }
      console.error(error);
      return {
        ok: false as const,
        code: "unavailable" as const,
        message: "Could not generate your session report.",
      };
    }
  });
