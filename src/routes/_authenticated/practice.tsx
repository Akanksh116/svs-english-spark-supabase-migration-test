import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Mic,
  GraduationCap,
  Users,
  Building2,
  Phone,
  Sun,
  MessageCircle,
  Play,
  Sparkles,
  Lightbulb,
  History,
  Rocket,
  SpellCheck,
  AudioLines,
  BookMarked,
  Radio,
} from "lucide-react";
import { usePracticeSessions } from "@/lib/practice-progress";
import { PageContainer } from "@/components/common/PageContainer";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PracticeModeCard, type PracticeMode } from "@/components/practice/PracticeModeCard";
import { SessionSummary, type SessionSummaryData } from "@/components/practice/SessionSummary";
import { AICoachPanel } from "@/components/practice/AICoachPanel";
import { challengesService } from "@/services/challenges.service";

const CHALLENGE_DIFFICULTY: Record<string, PracticeMode["difficulty"]> = {
  beginner: "easy",
  intermediate: "medium",
  advanced: "hard",
};

export const Route = createFileRoute("/_authenticated/practice")({
  validateSearch: (search: Record<string, unknown>) => ({
    start: typeof search.start === "string" ? search.start : undefined,
    challenge: typeof search.challenge === "string" ? search.challenge : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Practice · SVS English Coach" },
      {
        name: "description",
        content:
          "Speaking practice for teachers — classroom, parent meeting, office, telephone and more.",
      },
    ],
  }),
  component: PracticePage,
});

const MODES: PracticeMode[] = [
  {
    id: "classroom",
    title: "Classroom Teaching",
    description:
      "Practice giving instructions, explaining topics, and managing the class in English.",
    duration: "5–8 min",
    difficulty: "easy",
    icon: GraduationCap,
  },
  {
    id: "parent",
    title: "Parent Meeting",
    description: "Rehearse polite, clear conversations about a student's progress with parents.",
    duration: "6–10 min",
    difficulty: "medium",
    icon: Users,
  },
  {
    id: "office",
    title: "Office Communication",
    description: "Everyday staff-room English — leave, circulars, and short official talks.",
    duration: "4–6 min",
    difficulty: "easy",
    icon: Building2,
  },
  {
    id: "telephone",
    title: "Telephone Conversation",
    description: "Answer calls confidently, take messages, and speak clearly on the phone.",
    duration: "3–5 min",
    difficulty: "medium",
    icon: Phone,
  },
  {
    id: "assembly",
    title: "Morning Assembly",
    description: "Make short announcements, lead prayers, and address students on the ground.",
    duration: "3–5 min",
    difficulty: "medium",
    icon: Sun,
  },
  {
    id: "free",
    title: "Free Conversation",
    description: "Talk about any topic — a warm-up to keep your English fluent every day.",
    duration: "5–15 min",
    difficulty: "hard",
    icon: MessageCircle,
  },
];

const TIPS = [
  "Speak slowly — clarity matters more than speed.",
  "Think in English. Try not to translate word for word.",
  "Use simple, short sentences before long ones.",
  "Breathe. A small pause is better than a long 'um'.",
  "Repeat key words to sound confident and clear.",
  "Smile — your voice carries the tone of your face.",
];

const AI_FEATURES = [
  {
    title: "AI Speaking Coach",
    description: "Real-time coaching on tone, pace and clarity.",
    icon: Mic,
  },
  {
    title: "Grammar Feedback",
    description: "Instant corrections while you speak.",
    icon: SpellCheck,
  },
  {
    title: "Pronunciation Estimate",
    description: "Estimated pronunciation from browser speech confidence.",
    icon: AudioLines,
  },
  {
    title: "Vocabulary Suggestions",
    description: "Better words offered as you talk.",
    icon: BookMarked,
  },
  {
    title: "Voice Practice",
    description: "Record your voice, get a live transcript and reply by speaking.",
    icon: Radio,
  },
];

function PracticePage() {
  const { start, challenge: challengeId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [active, setActive] = useState<PracticeMode | null>(null);
  const sessionRef = useRef<HTMLDivElement | null>(null);
  const [challengeCtx, setChallengeCtx] = useState<{ title: string; description?: string } | null>(
    null,
  );
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const { sessions: history, loading: historyLoading } = usePracticeSessions(10);

  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!start) return;
    let cancelled = false;
    const launch = async () => {
      if (challengeId) {
        try {
          const list = await challengesService.listChallenges({ onlyActive: true });
          const found = list.find((c) => c.id === challengeId);
          if (found && !cancelled) {
            setChallengeCtx({
              title: found.title,
              description: found.description ?? undefined,
            });
            setActive({
              id: `challenge-${found.id}`,
              title: found.title,
              description: found.description ?? "",
              duration: `${found.estimated_duration_minutes} min`,
              difficulty: CHALLENGE_DIFFICULTY[found.difficulty] ?? "medium",
              icon: Sparkles,
            });
            void navigate({ search: { start: undefined, challenge: undefined }, replace: true });
            return;
          }
        } catch {
          if (!cancelled) return;
        }
      }
      if (!cancelled) {
        setChallengeCtx(null);
        setActive((cur) => cur ?? MODES[0]);
        void navigate({ search: { start: undefined, challenge: undefined }, replace: true });
      }
    };
    void launch();
    return () => {
      cancelled = true;
    };
  }, [start, challengeId, navigate]);

  const startSession = (mode: PracticeMode) => {
    setChallengeCtx(null);
    setActive((cur) => (cur && cur.id === mode.id ? cur : mode));
    setSummary(null);
    setUnlocked([]);
  };

  // On mobile the coach panel renders above the mode cards, so scroll it into
  // view; otherwise a tap looks like nothing happened.
  useEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(() => {
      sessionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [active]);

  return (
    <PageContainer>
      <PageHeader
        title="Practice"
        description="Speak every day with your AI coach. Build confidence in the situations you actually face at school."
        actions={
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> AI Coach live
          </Badge>
        }
      />

      {/* Section 2: Current Session */}
      <div ref={sessionRef} className="scroll-mt-20" />
      {active ? (
        <AICoachPanel
          key={active.id}
          mode={active}
          challenge={challengeCtx ?? undefined}
          onCancel={() => {
            setActive(null);
            setChallengeCtx(null);
          }}
          onFinish={(data, achievements) => {
            setSummary(data);
            setUnlocked(achievements);
            setActive(null);
            setChallengeCtx(null);
          }}
        />
      ) : (
        <Card className="mb-8 overflow-hidden border-primary/20 shadow-soft">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mic className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold md:text-2xl">No practice session running</h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Pick a mode below to start a live conversation with your AI English coach. Sessions
                are private.
              </p>
              <Button size="lg" className="mt-2 gap-2" onClick={() => startSession(MODES[0])}>
                <Play className="h-4 w-4" />
                Start Practice
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Section 6: Session Summary */}
      {summary ? (
        <div className="mb-8 space-y-3">
          <SessionSummary data={summary} />
          {unlocked.length ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
              <Rocket className="h-4 w-4 text-accent" />
              <span className="font-medium">New achievements unlocked:</span>
              {unlocked.map((a) => (
                <Badge
                  key={a}
                  variant="outline"
                  className="border-accent/30 bg-accent/10 text-accent"
                >
                  {a}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Section 1: Practice Modes */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Practice Modes</h2>
          <span className="text-xs text-muted-foreground">Choose a real school scenario</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => (
            <PracticeModeCard key={m.id} mode={m} onStart={startSession} />
          ))}
        </div>
      </div>

      {/* Section 3 + 4 */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-primary" />
              Speaking Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-primary/5 p-4">
              <p className="text-sm font-medium leading-relaxed">{TIPS[tipIndex]}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                Tip {tipIndex + 1} of {TIPS.length}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {TIPS.filter((_, i) => i !== tipIndex)
                .slice(0, 3)
                .map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{t}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-accent" />
              Practice History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Loading your sessions…
              </p>
            ) : history.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No practice sessions yet — finish a session and it will appear here.
              </p>
            ) : (
              <ul className="divide-y">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{h.modeTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.finishedAt).toLocaleDateString()} · {h.durationMinutes} min
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                      {h.overall}%
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 5: What your AI coach does */}
      <Card className="mb-4 overflow-hidden border-primary/30 shadow-soft">
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 p-6 md:p-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Rocket className="h-4 w-4" />
            Your AI Coach
          </div>
          <h2 className="text-xl font-bold md:text-2xl">
            Built for Sri Vijaya Sai High School staff
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Start any mode above to talk with a coach that guides you one question at a time and
            scores your session at the end.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AI_FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-background/70 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
