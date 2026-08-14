import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  Bot,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Send,
  Square,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DifficultyBadge } from "@/components/learning/DifficultyBadge";
import type { PracticeMode } from "@/components/practice/PracticeModeCard";
import type { SessionSummaryData } from "@/components/practice/SessionSummary";
import { VoiceRecorderPanel } from "@/components/practice/VoiceRecorderPanel";
import { coachEvaluate, coachReply } from "@/lib/coach.functions";
import { useRecordPracticeSession, ACHIEVEMENT_LABELS } from "@/lib/practice-progress";

type Turn = { role: "user" | "model"; text: string };

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface Props {
  mode: PracticeMode;
  challenge?: { title: string; description?: string };
  onFinish: (summary: SessionSummaryData, unlocked: string[]) => void;
  onCancel: () => void;
}

export function AICoachPanel({ mode, challenge, onFinish, onCancel }: Props) {
  const reply = useServerFn(coachReply);
  const evaluate = useServerFn(coachEvaluate);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [voiceConfidence, setVoiceConfidence] = useState<number | null>(null);
  const recordSession = useRecordPracticeSession();
  const started = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  const send = async (history: Turn[]) => {
    setThinking(true);
    setError(null);
    try {
      const res = await reply({
        data: { modeId: mode.id, modeTitle: mode.title, challenge, history },
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setTurns([...history, { role: "model", text: res.text }]);
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setThinking(false);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void send([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wordsSpoken = useMemo(
    () =>
      turns
        .filter((t) => t.role === "user")
        .reduce((n, t) => n + t.text.trim().split(/\s+/).filter(Boolean).length, 0),
    [turns],
  );

  const isChallenge = Boolean(challenge);

  /** Both modes: the coach replies with detailed corrective feedback. */
  const addUserTurn = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    void send([...turns, { role: "user", text: clean }]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    addUserTurn(text);
  };

  const handleRetry = () => {
    setError(null);
    void send(turns);
  };

  const handleFinish = async () => {
    setFinishing(true);
    setError(null);
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    let e: CoachEvaluation;
    try {
      const res = await evaluate({
        data: { modeTitle: mode.title, challenge, durationMinutes, history: turns },
      });
      if (!res.ok) {
        setError(res.message);
        setFinishing(false);
        return;
      }
      e = res.evaluation;
    } catch {
      setError("Could not generate your report. Please try again.");
      setFinishing(false);
      return;
    }

    // Only a session that reached this point (evaluated on Finish) is persisted.
    try {
      const { newAchievements } = await recordSession.mutateAsync({
        modeTitle: mode.title,
        durationMinutes,
        messages: turns.length,
        overall: e.overall,
        grammar: e.grammar,
        vocabulary: e.vocabulary,
        fluency: e.fluency,
        confidence: e.confidence,
        finishedAt: new Date().toISOString(),
        details: {
          modeId: mode.id,
          challengeTitle: challenge?.title,
          startedAt: startedAt.current,
          completedAt: new Date().toISOString(),
          transcript: turns,
          strengths: e.strengths,
          improvements: e.improvements,
          betterSentences: e.betterSentences,
          suggestedPractice: e.suggestedPractice,
        },
      });
      toast.success("Session saved to your progress");
      onFinish(
        {
          topic: challenge?.title ?? mode.title,
          durationMinutes,
          wordsSpoken,
          fluency: e.fluency,
          grammar: e.grammar,
          vocabulary: e.vocabulary,
          pronunciation: voiceConfidence ?? e.confidence,
          confidence: e.confidence,
          overall: e.overall,
          strengths: e.strengths,
          improvements: e.improvements,
          betterSentences: e.betterSentences,
          homework: e.suggestedPractice,
          aiGenerated: true,
        },

        newAchievements.map((id: string) => ACHIEVEMENT_LABELS[id] ?? id),
      );
    } catch {
      setError("Could not generate your report. Please try again.");
      setFinishing(false);
    }
  };

  return (
    <Card className="mb-8 overflow-hidden border-primary/20 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Bot className="h-4 w-4" /> {isChallenge ? "Today's Challenge" : "AI English Coach"}
          </p>
          <h2 className="mt-1 truncate text-xl font-bold md:text-2xl">
            {challenge?.title ?? mode.title}
          </h2>
          {isChallenge && challenge?.description ? (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{challenge.description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge level={mode.difficulty} />
            <Badge variant="outline" className="tabular-nums">
              {formatTime(seconds)}
            </Badge>
            <Badge variant="outline">{wordsSpoken} words</Badge>
            {isChallenge ? (
              <Badge variant="secondary">Challenge Mode · instant coaching feedback</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleFinish} disabled={finishing}>
            {finishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {isChallenge ? "Finish" : "End Session"}
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="max-h-[420px] space-y-4 overflow-y-auto p-5">
        {turns.map((t, i) => (
          <div key={i} className={`flex gap-3 ${t.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                t.role === "user" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
              }`}
            >
              {t.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-1 ${
                t.role === "user" ? "bg-accent/10" : "border bg-muted/40"
              }`}
            >
              {t.text}
            </div>
          </div>
        ))}

        {thinking ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Coach is thinking…
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <span className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </span>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={handleRetry}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        ) : null}
      </div>

      <div className="border-t p-4">
        <VoiceRecorderPanel
          disabled={thinking || finishing}
          onConfidence={setVoiceConfidence}
          onSend={(text) => addUserTurn(text)}
        />
        <div className="mt-3 flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isChallenge ? "Keep speaking or type your answer…" : "Type your reply in English…"
            }
            className="min-h-[52px] resize-none"
            disabled={thinking || finishing}
          />
          <Button
            onClick={handleSend}
            disabled={thinking || finishing || !input.trim()}
            className="gap-1.5"
          >
            <Send className="h-4 w-4" />
            {isChallenge ? "Add" : "Send"}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {isChallenge
              ? "Send your full answer — the coach gives detailed feedback. Press Finish when you are done."
              : "Press Enter to send · Shift + Enter for a new line"}
          </p>

          <Button variant="ghost" size="sm" onClick={onCancel} disabled={finishing}>
            Cancel session
          </Button>
        </div>
      </div>
    </Card>
  );
}
