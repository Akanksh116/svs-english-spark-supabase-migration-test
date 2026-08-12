import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  modeTitle: z.string().min(1).max(120),
  challenge: challengeSchema.optional(),
  durationMinutes: z.number().int().min(0).max(600),
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
  .inputValidator((input: unknown) => chatInput.parse(input))
  .handler(async ({ data }) => {
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
  .inputValidator((input: unknown) => evaluateInput.parse(input))
  .handler(async ({ data }) => {
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
      return { ok: true as const, evaluation };
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
